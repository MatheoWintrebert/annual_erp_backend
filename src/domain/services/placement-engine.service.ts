import { Injectable } from "@nestjs/common";
import { PalettierEntity } from "@domain/entities";
import { NoValidPlacementError } from "@domain/errors";
import {
  PaletteRepository,
  PalettierRepository,
  RuleRepository,
  RuleWithConfig,
} from "@domain/repositories";
import {
  ConflictGroup,
  PlacementConstraintType,
  PlacementInput,
  PlacementRecommendation,
  PlacementResult,
  PlacementViolationWarning,
  RuleType,
  SelectionMode,
} from "@domain/types";

interface PalettierCandidate {
  palettier: PalettierEntity;
  availablePositions: { x: number; y: number; z: number }[];
  zonePriorityScore: number;
}

interface PlacementData {
  allRules: RuleWithConfig[];
  palettiers: PalettierEntity[];
  occupiedPositionsMap: Map<
    number,
    { positionX: number; positionY: number; positionZ: number }[]
  >;
  categoryIdsMap: Map<number, number[]>;
}

@Injectable()
export class PlacementEngineService {
  constructor(
    private readonly ruleRepository: RuleRepository,
    private readonly palettierRepository: PalettierRepository,
    private readonly paletteRepository: PaletteRepository
  ) {}

  async recommend(input: PlacementInput): Promise<PlacementRecommendation> {
    const data = await this.loadPlacementData();
    return this.recommendFromPreloadedData(input, data);
  }

  async recommendWithConflictDetection(
    input: PlacementInput,
    productNames: string[]
  ): Promise<PlacementResult> {
    // Load all data once — shared between simple recommendation and conflict detection (H2 fix)
    const data = await this.loadPlacementData();

    try {
      // "resolved" assumes all products fit into a single palettier position (L1)
      const recommendation = this.recommendFromPreloadedData(input, data);
      return { status: "resolved", recommendation };
    } catch (error) {
      if (!(error instanceof NoValidPlacementError)) {
        throw error;
      }
    }

    // No single palettier satisfies all products — detect conflicts using same pre-loaded data
    const perProductCandidates = this.buildPerProductCompatibility(
      input,
      data.allRules,
      data.palettiers,
      data.occupiedPositionsMap,
      data.categoryIdsMap
    );

    const groups = this.partitionIntoGroups(
      perProductCandidates,
      input,
      productNames,
      data.allRules
    );

    const conflictExplanation = this.buildConflictExplanation(
      groups,
      data.allRules,
      input,
      productNames
    );

    return { status: "conflict", conflictExplanation, groups };
  }

  async checkViolationsForPalettier(
    productIds: number[],
    palettierId: number
  ): Promise<PlacementViolationWarning[]> {
    const data = await this.loadPlacementData();

    const targetPalettier = data.palettiers.find(
      (p) => p.id === palettierId && p.deletedAt == null
    );
    if (!targetPalettier) {
      return [];
    }

    const relevantRules = this.filterRelevantRules(data.allRules, productIds);
    const warnings: PlacementViolationWarning[] = [];

    for (const rwc of relevantRules) {
      switch (rwc.rule.type) {
        case RuleType.STORAGE_CONDITION: {
          if (!this.passesStorageCondition(targetPalettier, rwc)) {
            warnings.push({
              ruleName: rwc.rule.name,
              ruleType: RuleType.STORAGE_CONDITION,
              reason: `Storage condition "${rwc.rule.name}" is not satisfied by palettier "${targetPalettier.name}"`,
            });
          }
          break;
        }
        case RuleType.PLACEMENT_CONSTRAINT: {
          const allPositions = this.generateAllPositions(targetPalettier);
          const filtered = this.applyPlacementConstraint(allPositions, rwc);
          if (filtered.length === 0) {
            warnings.push({
              ruleName: rwc.rule.name,
              ruleType: RuleType.PLACEMENT_CONSTRAINT,
              reason: `Placement constraint "${rwc.rule.name}" cannot be satisfied on palettier "${targetPalettier.name}"`,
            });
          }
          break;
        }
        case RuleType.PRODUCT_INCOMPATIBILITY: {
          const existingCategoryIds =
            data.categoryIdsMap.get(palettierId) ?? [];
          const config = rwc.productIncompatibilityConfig;
          if (config && existingCategoryIds.includes(config.categoryId)) {
            warnings.push({
              ruleName: rwc.rule.name,
              ruleType: RuleType.PRODUCT_INCOMPATIBILITY,
              reason: `Palettier "${targetPalettier.name}" contains products from an incompatible category (rule: "${rwc.rule.name}")`,
            });
          }
          break;
        }
        case RuleType.ZONE_PRIORITY: {
          // Soft preference — not a violation
          break;
        }
      }
    }

    return warnings;
  }

  private async loadPlacementData(): Promise<PlacementData> {
    const rulesResult = await this.ruleRepository.findAll({
      isActive: true,
      includeProducts: true,
      limit: 1000,
    });
    const allRules = rulesResult.rules;
    const palettiers = await this.palettierRepository.findAll();
    const activePalettierIds = palettiers
      .filter((p) => p.deletedAt == null)
      .map((p) => p.id);

    const [occupiedPositionsMap, categoryIdsMap] = await Promise.all([
      this.paletteRepository.findOccupiedPositionsByPalettierIds(
        activePalettierIds
      ),
      this.paletteRepository.findCategoryIdsByPalettierIds(activePalettierIds),
    ]);

    return { allRules, palettiers, occupiedPositionsMap, categoryIdsMap };
  }

  private recommendFromPreloadedData(
    input: PlacementInput,
    data: PlacementData
  ): PlacementRecommendation {
    const relevantRules = this.filterRelevantRules(
      data.allRules,
      input.productIds
    );
    const candidates = this.buildCandidates(
      data.palettiers,
      relevantRules,
      input,
      data.occupiedPositionsMap,
      data.categoryIdsMap
    );

    if (candidates.length === 0) {
      throw new NoValidPlacementError(input.productIds[0]);
    }

    candidates.sort((a, b) => {
      if (a.zonePriorityScore !== b.zonePriorityScore) {
        return b.zonePriorityScore - a.zonePriorityScore;
      }
      if (a.availablePositions.length !== b.availablePositions.length) {
        return b.availablePositions.length - a.availablePositions.length;
      }
      return a.palettier.name.localeCompare(b.palettier.name);
    });

    const winner = candidates[0];
    const position = winner.availablePositions[0];
    const reasoning = this.buildReasoning(winner, relevantRules);

    return {
      palettierId: winner.palettier.id,
      palettierName: winner.palettier.name,
      positionX: position.x,
      positionY: position.y,
      positionZ: position.z,
      reasoning,
    };
  }

  private buildPerProductCompatibility(
    input: PlacementInput,
    allRules: RuleWithConfig[],
    palettiers: PalettierEntity[],
    occupiedPositionsMap: Map<
      number,
      { positionX: number; positionY: number; positionZ: number }[]
    >,
    categoryIdsMap: Map<number, number[]>
  ): Map<number, PalettierCandidate[]> {
    const result = new Map<number, PalettierCandidate[]>();

    for (let i = 0; i < input.productIds.length; i++) {
      const singleInput: PlacementInput = {
        productIds: [input.productIds[i]],
        productCategoryIds: [input.productCategoryIds[i]],
      };

      const relevantRules = this.filterRelevantRules(
        allRules,
        singleInput.productIds
      );

      const candidates = this.buildCandidates(
        palettiers,
        relevantRules,
        singleInput,
        occupiedPositionsMap,
        categoryIdsMap
      );

      result.set(input.productIds[i], candidates);
    }

    return result;
  }

  private partitionIntoGroups(
    compatibility: Map<number, PalettierCandidate[]>,
    input: PlacementInput,
    productNames: string[],
    allRules: RuleWithConfig[]
  ): ConflictGroup[] {
    // Greedy partition: sorts products by constraint level, then merges into groups sequentially.
    // Known limitation: greedy approach can produce suboptimal groupings for >3 products.
    // Example: products A, B, C where A+B fit together and A+C fit together but B+C don't —
    // the order of processing determines whether A joins B's group or C's group.
    // This is acceptable for typical palette sizes (2-10 products) where optimal grouping
    // has minimal practical impact compared to a globally optimal but expensive algorithm.

    // Sort products by number of compatible palettiers (ascending — most constrained first)
    const sortedProducts = input.productIds
      .map((id, idx) => ({
        productId: id,
        productName: productNames[idx],
        categoryId: input.productCategoryIds[idx],
        candidates: compatibility.get(id) ?? [],
      }))
      .sort((a, b) => a.candidates.length - b.candidates.length);

    const groups: {
      productIds: number[];
      productNames: string[];
      categoryIds: (number | null)[];
      compatiblePalettierIds: Set<number>;
    }[] = [];

    for (const product of sortedProducts) {
      const productPalettierIds = new Set(
        product.candidates.map((c) => c.palettier.id)
      );

      let merged = false;

      for (const group of groups) {
        // Check if palettier sets intersect
        const intersection = new Set(
          [...productPalettierIds].filter((id) =>
            group.compatiblePalettierIds.has(id)
          )
        );
        if (intersection.size === 0) continue;

        // Check PRODUCT_INCOMPATIBILITY between this product and group members
        const hasIncompatibility = this.hasProductIncompatibilityBetween(
          product.categoryId,
          group.categoryIds,
          allRules,
          [...group.productIds, product.productId]
        );
        if (hasIncompatibility) continue;

        // Merge into this group
        group.productIds.push(product.productId);
        group.productNames.push(product.productName);
        group.categoryIds.push(product.categoryId);
        group.compatiblePalettierIds = intersection;
        merged = true;
        break;
      }

      if (!merged) {
        groups.push({
          productIds: [product.productId],
          productNames: [product.productName],
          categoryIds: [product.categoryId],
          compatiblePalettierIds: productPalettierIds,
        });
      }
    }

    // Build ConflictGroup results with recommendations
    return groups.map((group) => {
      if (group.compatiblePalettierIds.size === 0) {
        // No palettier satisfies the rules for these products
        const ruleNames = this.describeBlockingRules(
          allRules,
          group.productIds
        );
        const reason =
          ruleNames.length > 0
            ? `No palettier satisfies the rules for ${group.productNames.join(", ")} (blocked by: ${ruleNames.join(", ")})`
            : `No palettier has available positions for ${group.productNames.join(", ")} — all slots are occupied`;
        return {
          productIds: group.productIds,
          productNames: group.productNames,
          recommendation: null,
          reasoning: reason,
        };
      }

      // Pick the best palettier from the compatible set
      const candidatesForGroup = (
        compatibility.get(group.productIds[0]) ?? []
      ).filter((c) => group.compatiblePalettierIds.has(c.palettier.id));

      candidatesForGroup.sort((a, b) => {
        if (a.zonePriorityScore !== b.zonePriorityScore) {
          return b.zonePriorityScore - a.zonePriorityScore;
        }
        if (a.availablePositions.length !== b.availablePositions.length) {
          return b.availablePositions.length - a.availablePositions.length;
        }
        return a.palettier.name.localeCompare(b.palettier.name);
      });

      if (candidatesForGroup.length === 0) {
        return {
          productIds: group.productIds,
          productNames: group.productNames,
          recommendation: null,
          reasoning: `All compatible palettiers are full for ${group.productNames.join(", ")} — no open positions remain`,
        };
      }

      const winner = candidatesForGroup[0];
      const position = winner.availablePositions[0];
      const relevantRules = this.filterRelevantRules(
        allRules,
        group.productIds
      );
      const reasoning = this.buildReasoning(winner, relevantRules);

      return {
        productIds: group.productIds,
        productNames: group.productNames,
        recommendation: {
          palettierId: winner.palettier.id,
          palettierName: winner.palettier.name,
          positionX: position.x,
          positionY: position.y,
          positionZ: position.z,
          reasoning,
        },
        reasoning,
      };
    });
  }

  private hasProductIncompatibilityBetween(
    productCategoryId: number | null,
    groupCategoryIds: (number | null)[],
    allRules: RuleWithConfig[],
    combinedProductIds: number[]
  ): boolean {
    if (productCategoryId == null) return false;

    const incompatibilityRules = allRules.filter(
      (rwc) =>
        rwc.rule.type === RuleType.PRODUCT_INCOMPATIBILITY &&
        rwc.productIncompatibilityConfig != null
    );

    for (const rwc of incompatibilityRules) {
      const config = rwc.productIncompatibilityConfig;
      if (config == null) continue;
      const ruleProductIds = new Set(rwc.productIds ?? []);

      // Check if any combined product is affected by this rule
      const affectsProducts = combinedProductIds.some((pid) =>
        ruleProductIds.has(pid)
      );
      if (!affectsProducts) continue;

      const incompatibleCategoryId = config.categoryId;

      // If incoming product is in the incompatible category and group has other categories
      if (productCategoryId === incompatibleCategoryId) {
        const groupHasOtherCategories = groupCategoryIds.some(
          (catId) => catId != null && catId !== incompatibleCategoryId
        );
        if (groupHasOtherCategories) return true;
      }

      // If group has the incompatible category and incoming product is a different category
      if (groupCategoryIds.includes(incompatibleCategoryId)) {
        if (productCategoryId !== incompatibleCategoryId) return true;
      }
    }

    return false;
  }

  private buildConflictExplanation(
    _groups: ConflictGroup[],
    allRules: RuleWithConfig[],
    input: PlacementInput,
    productNames: string[]
  ): string {
    const parts: string[] = [];

    for (let i = 0; i < input.productIds.length; i++) {
      const productId = input.productIds[i];
      const productName = productNames[i];
      const relevantRules = this.filterRelevantRules(allRules, [productId]);

      const descriptions: string[] = [];

      for (const rwc of relevantRules) {
        switch (rwc.rule.type) {
          case RuleType.STORAGE_CONDITION:
            descriptions.push(rwc.rule.name);
            break;
          case RuleType.PLACEMENT_CONSTRAINT:
            descriptions.push(rwc.rule.name);
            break;
          case RuleType.PRODUCT_INCOMPATIBILITY:
            descriptions.push(`incompatible category (${rwc.rule.name})`);
            break;
          case RuleType.ZONE_PRIORITY:
            break;
        }
      }

      if (descriptions.length > 0) {
        parts.push(`${productName} needs ${descriptions.join(", ")}`);
      }
    }

    if (parts.length > 0) {
      return parts.join(", ");
    }

    return "Products require separate placement due to incompatible rules";
  }

  private filterRelevantRules(
    allRules: RuleWithConfig[],
    productIds: number[]
  ): RuleWithConfig[] {
    const productIdSet = new Set(productIds);

    return allRules.filter((rwc) => {
      if (!rwc.productIds || rwc.productIds.length === 0) {
        return false;
      }
      return rwc.productIds.some((pid) => productIdSet.has(pid));
    });
  }

  private buildCandidates(
    palettiers: PalettierEntity[],
    relevantRules: RuleWithConfig[],
    input: PlacementInput,
    occupiedPositionsMap: Map<
      number,
      { positionX: number; positionY: number; positionZ: number }[]
    >,
    categoryIdsMap: Map<number, number[]>
  ): PalettierCandidate[] {
    const candidates: PalettierCandidate[] = [];

    for (const palettier of palettiers) {
      if (palettier.deletedAt != null) {
        continue;
      }

      const occupiedPositions = occupiedPositionsMap.get(palettier.id) ?? [];

      const allPositions = this.generateAllPositions(palettier);
      let availablePositions = this.subtractOccupied(
        allPositions,
        occupiedPositions
      );

      if (availablePositions.length === 0) {
        continue;
      }

      const passesHardRules = this.evaluateHardRules(
        palettier,
        relevantRules,
        input,
        availablePositions,
        categoryIdsMap.get(palettier.id) ?? []
      );

      if (!passesHardRules.passes) {
        continue;
      }

      availablePositions = passesHardRules.filteredPositions;

      if (availablePositions.length === 0) {
        continue;
      }

      const zonePriorityScore = this.computeZonePriorityScore(
        palettier,
        relevantRules
      );

      candidates.push({
        palettier,
        availablePositions,
        zonePriorityScore,
      });
    }

    return candidates;
  }

  private evaluateHardRules(
    palettier: PalettierEntity,
    relevantRules: RuleWithConfig[],
    input: PlacementInput,
    availablePositions: { x: number; y: number; z: number }[],
    existingCategoryIds: number[]
  ): {
    passes: boolean;
    filteredPositions: { x: number; y: number; z: number }[];
  } {
    let filteredPositions = [...availablePositions];

    for (const rwc of relevantRules) {
      switch (rwc.rule.type) {
        case RuleType.STORAGE_CONDITION: {
          if (!this.passesStorageCondition(palettier, rwc)) {
            return { passes: false, filteredPositions: [] };
          }
          break;
        }
        case RuleType.PLACEMENT_CONSTRAINT: {
          filteredPositions = this.applyPlacementConstraint(
            filteredPositions,
            rwc
          );
          if (filteredPositions.length === 0) {
            return { passes: false, filteredPositions: [] };
          }
          break;
        }
        case RuleType.PRODUCT_INCOMPATIBILITY: {
          const compatible = this.checkProductIncompatibility(
            rwc,
            input,
            existingCategoryIds
          );
          if (!compatible) {
            return { passes: false, filteredPositions: [] };
          }
          break;
        }
        case RuleType.ZONE_PRIORITY: {
          // Soft rule — handled in scoring, not filtering
          break;
        }
      }
    }

    return { passes: true, filteredPositions };
  }

  private passesStorageCondition(
    palettier: PalettierEntity,
    rwc: RuleWithConfig
  ): boolean {
    const config = rwc.storageConditionConfig;
    if (!config) {
      return true;
    }

    switch (config.selectionMode) {
      case SelectionMode.PALETTIER_TYPE: {
        if (config.palettierTypeId == null) {
          return true;
        }
        return palettier.palettierTypeId === config.palettierTypeId;
      }
      case SelectionMode.SPECIFIC_PALETTIER: {
        const allowedIds = new Set(config.palettierIds);
        return allowedIds.has(palettier.id);
      }
      default:
        return true;
    }
  }

  private applyPlacementConstraint(
    positions: { x: number; y: number; z: number }[],
    rwc: RuleWithConfig
  ): { x: number; y: number; z: number }[] {
    const config = rwc.placementConstraintConfig;
    if (!config) {
      return positions;
    }

    switch (config.constraintType) {
      case PlacementConstraintType.GROUND_ONLY:
        return positions.filter((p) => p.z === 0);
      case PlacementConstraintType.MAX_HEIGHT: {
        const maxHeight = config.maxHeight;
        if (maxHeight == null) {
          return positions;
        }
        return positions.filter((p) => p.z <= maxHeight);
      }
      default:
        return positions;
    }
  }

  private checkProductIncompatibility(
    rwc: RuleWithConfig,
    input: PlacementInput,
    existingCategoryIds: number[]
  ): boolean {
    const config = rwc.productIncompatibilityConfig;
    if (!config) {
      return true;
    }

    const incomingCategoryIds = input.productCategoryIds.filter(
      (id): id is number => id != null
    );

    const incomingHasIncompatible = incomingCategoryIds.includes(
      config.categoryId
    );
    const palettierHasIncompatible = existingCategoryIds.includes(
      config.categoryId
    );

    // Incoming product is in the incompatible category and palettier
    // already has products from OTHER categories → reject
    if (incomingHasIncompatible) {
      const palettierHasOtherCategories = existingCategoryIds.some(
        (catId) => catId !== config.categoryId
      );
      if (palettierHasOtherCategories) {
        return false;
      }
    }

    // Palettier already has the incompatible category and incoming
    // product is from a DIFFERENT category → reject
    if (palettierHasIncompatible) {
      const incomingHasOtherCategories = incomingCategoryIds.some(
        (catId) => catId !== config.categoryId
      );
      if (incomingHasOtherCategories) {
        return false;
      }
    }

    return true;
  }

  private computeZonePriorityScore(
    palettier: PalettierEntity,
    relevantRules: RuleWithConfig[]
  ): number {
    let score = 0;

    for (const rwc of relevantRules) {
      if (rwc.rule.type !== RuleType.ZONE_PRIORITY) {
        continue;
      }

      const config = rwc.zonePriorityConfig;
      if (!config) {
        continue;
      }

      if (config.palettierIds.includes(palettier.id)) {
        score += config.priorityLevel;
      }
    }

    return score;
  }

  private generateAllPositions(
    palettier: PalettierEntity
  ): { x: number; y: number; z: number }[] {
    const positions: { x: number; y: number; z: number }[] = [];

    // Fill order: X (left→right), Y (front→back), Z (bottom→top)
    for (let z = 0; z < palettier.height; z++) {
      for (let y = 0; y < palettier.depth; y++) {
        for (let x = 0; x < palettier.width; x++) {
          positions.push({ x, y, z });
        }
      }
    }

    return positions;
  }

  private subtractOccupied(
    allPositions: { x: number; y: number; z: number }[],
    occupied: { positionX: number; positionY: number; positionZ: number }[]
  ): { x: number; y: number; z: number }[] {
    const occupiedSet = new Set(
      occupied.map(
        (p) =>
          `${String(p.positionX)},${String(p.positionY)},${String(p.positionZ)}`
      )
    );

    return allPositions.filter(
      (p) => !occupiedSet.has(`${String(p.x)},${String(p.y)},${String(p.z)}`)
    );
  }

  private describeBlockingRules(
    allRules: RuleWithConfig[],
    productIds: number[]
  ): string[] {
    const relevantRules = this.filterRelevantRules(allRules, productIds);
    const names: string[] = [];
    for (const rwc of relevantRules) {
      switch (rwc.rule.type) {
        case RuleType.STORAGE_CONDITION:
        case RuleType.PLACEMENT_CONSTRAINT:
        case RuleType.PRODUCT_INCOMPATIBILITY:
          names.push(rwc.rule.name);
          break;
        case RuleType.ZONE_PRIORITY:
          break;
      }
    }
    return names;
  }

  private buildReasoning(
    candidate: PalettierCandidate,
    relevantRules: RuleWithConfig[]
  ): string {
    const reasons: string[] = [];

    for (const rwc of relevantRules) {
      switch (rwc.rule.type) {
        case RuleType.STORAGE_CONDITION:
          reasons.push(rwc.rule.name);
          break;
        case RuleType.ZONE_PRIORITY:
          if (
            rwc.zonePriorityConfig?.palettierIds.includes(
              candidate.palettier.id
            )
          ) {
            reasons.push(`Priority zone: ${rwc.rule.name}`);
          }
          break;
        case RuleType.PLACEMENT_CONSTRAINT:
          reasons.push(rwc.rule.name);
          break;
        case RuleType.PRODUCT_INCOMPATIBILITY:
          break;
      }
    }

    reasons.push("space available");

    return reasons.join(" — ");
  }
}
