import { Injectable } from "@nestjs/common";
import { RuleRepository, RuleWithConfig } from "@domain/repositories";
import {
  PlacementConstraintType,
  RuleType,
  SelectionMode,
} from "@domain/types";
import type { RuleViolation } from "@domain/types";

export interface PaletteForViolationCheck {
  paletteId: number;
  palettierName: string;
  palettierTypeId: number;
  palettierId: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  productName: string;
}

@Injectable()
export class RuleViolationDetectorService {
  constructor(private readonly ruleRepository: RuleRepository) {}

  async detectViolations(ruleId: number): Promise<RuleViolation[]> {
    const ruleWithConfig = await this.ruleRepository.findById(ruleId);
    if (!ruleWithConfig?.rule.isActive) {
      return [];
    }

    const palettes =
      await this.ruleRepository.findPalettesForViolationCheck(ruleId);
    if (palettes.length === 0) {
      return [];
    }

    return this.checkViolations(ruleWithConfig, palettes);
  }

  private checkViolations(
    ruleWithConfig: RuleWithConfig,
    palettes: PaletteForViolationCheck[]
  ): RuleViolation[] {
    const { rule } = ruleWithConfig;

    switch (rule.type) {
      case RuleType.STORAGE_CONDITION:
        return this.checkStorageConditionViolations(ruleWithConfig, palettes);
      case RuleType.PLACEMENT_CONSTRAINT:
        return this.checkPlacementConstraintViolations(
          ruleWithConfig,
          palettes
        );
      case RuleType.ZONE_PRIORITY:
        return this.checkZonePriorityViolations(ruleWithConfig, palettes);
      case RuleType.PRODUCT_INCOMPATIBILITY:
        return this.checkProductIncompatibilityViolations(
          ruleWithConfig,
          palettes
        );
    }
  }

  private checkStorageConditionViolations(
    ruleWithConfig: RuleWithConfig,
    palettes: PaletteForViolationCheck[]
  ): RuleViolation[] {
    const config = ruleWithConfig.storageConditionConfig;
    if (!config) {
      return [];
    }

    const violations: RuleViolation[] = [];

    switch (config.selectionMode) {
      case SelectionMode.PALETTIER_TYPE: {
        const requiredTypeId = config.palettierTypeId;
        if (requiredTypeId == null) {
          return [];
        }

        for (const palette of palettes) {
          if (palette.palettierTypeId !== requiredTypeId) {
            violations.push(
              this.buildViolation(
                palette,
                ruleWithConfig.rule,
                `Palette is in a palettier of wrong type (requires type ID ${String(requiredTypeId)})`
              )
            );
          }
        }
        break;
      }
      case SelectionMode.SPECIFIC_PALETTIER: {
        const allowedPalettierIds = new Set(config.palettierIds);
        if (allowedPalettierIds.size === 0) {
          return [];
        }

        for (const palette of palettes) {
          if (!allowedPalettierIds.has(palette.palettierId)) {
            violations.push(
              this.buildViolation(
                palette,
                ruleWithConfig.rule,
                "Palette is not in an allowed palettier for this storage condition"
              )
            );
          }
        }
        break;
      }
    }

    return violations;
  }

  private checkPlacementConstraintViolations(
    ruleWithConfig: RuleWithConfig,
    palettes: PaletteForViolationCheck[]
  ): RuleViolation[] {
    const config = ruleWithConfig.placementConstraintConfig;
    if (!config) {
      return [];
    }

    const violations: RuleViolation[] = [];

    switch (config.constraintType) {
      case PlacementConstraintType.GROUND_ONLY: {
        for (const palette of palettes) {
          if (palette.positionZ !== 0) {
            violations.push(
              this.buildViolation(
                palette,
                ruleWithConfig.rule,
                `Palette must be on ground level (position Z=0), currently at Z=${String(palette.positionZ)}`
              )
            );
          }
        }
        break;
      }
      case PlacementConstraintType.MAX_HEIGHT: {
        const maxHeight = config.maxHeight;
        if (maxHeight == null) {
          return [];
        }

        for (const palette of palettes) {
          if (palette.positionZ > maxHeight) {
            violations.push(
              this.buildViolation(
                palette,
                ruleWithConfig.rule,
                `Palette exceeds maximum height (max Z=${String(maxHeight)}, currently at Z=${String(palette.positionZ)})`
              )
            );
          }
        }
        break;
      }
    }

    return violations;
  }

  private checkZonePriorityViolations(
    ruleWithConfig: RuleWithConfig,
    palettes: PaletteForViolationCheck[]
  ): RuleViolation[] {
    const config = ruleWithConfig.zonePriorityConfig;
    if (!config) {
      return [];
    }

    const priorityPalettierIds = new Set(config.palettierIds);
    if (priorityPalettierIds.size === 0) {
      return [];
    }

    const violations: RuleViolation[] = [];

    for (const palette of palettes) {
      if (!priorityPalettierIds.has(palette.palettierId)) {
        violations.push(
          this.buildViolation(
            palette,
            ruleWithConfig.rule,
            "Palette is not in a priority zone palettier (advisory)"
          )
        );
      }
    }

    return violations;
  }

  private checkProductIncompatibilityViolations(
    ruleWithConfig: RuleWithConfig,
    palettes: PaletteForViolationCheck[]
  ): RuleViolation[] {
    const config = ruleWithConfig.productIncompatibilityConfig;
    if (!config) {
      return [];
    }

    // The repository query (findPalettesForViolationCheck) already filters
    // to only return palettes that share a palettier with incompatible
    // product categories. Every palette returned here is a confirmed violation.
    return palettes.map((palette) =>
      this.buildViolation(
        palette,
        ruleWithConfig.rule,
        "Palette shares palettier with incompatible product category"
      )
    );
  }

  private buildViolation(
    palette: PaletteForViolationCheck,
    rule: { name: string; type: RuleType },
    reason: string
  ): RuleViolation {
    return {
      paletteId: palette.paletteId,
      palettierName: palette.palettierName,
      positionX: palette.positionX,
      positionY: palette.positionY,
      positionZ: palette.positionZ,
      productName: palette.productName,
      ruleName: rule.name,
      ruleType: rule.type,
      violationReason: reason,
    };
  }
}
