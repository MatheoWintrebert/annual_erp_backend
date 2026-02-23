import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityManager, In, IsNull, Repository } from "typeorm";
import {
  RuleEntity,
  RulePlacementConstraintConfigEntity,
  RuleProductIncompatibilityConfigEntity,
  RuleStorageConditionConfigEntity,
  RuleZonePriorityConfigEntity,
} from "@domain/entities";
import {
  CreateRuleWithConfigData,
  FindRulesOptions,
  FindRulesResult,
  RuleRepository,
  RuleWithConfig,
  UpdateRuleWithConfigData,
} from "@domain/repositories";
import { RuleType } from "@domain/types";
import type { PaletteForViolationCheck } from "@domain/services";
import {
  PalettierTypeormEntity,
  PalettierTypeTypeormEntity,
  ProductRuleTypeormEntity,
  ProductTypeormEntity,
  RulePlacementConstraintConfigTypeormEntity,
  RuleProductIncompatibilityConfigTypeormEntity,
  RuleStorageConditionConfigTypeormEntity,
  RuleStorageConditionPalettierTypeormEntity,
  RuleTypeormEntity,
  RuleZonePriorityConfigTypeormEntity,
  RuleZonePriorityPalettierTypeormEntity,
} from "@infrastructure/entities";
import { RuleNotFoundError } from "@domain/errors";

@Injectable()
export class RuleMysqlRepository implements RuleRepository {
  constructor(
    @InjectRepository(RuleTypeormEntity)
    private readonly ruleRepo: Repository<RuleTypeormEntity>,
    @InjectRepository(RuleZonePriorityConfigTypeormEntity)
    private readonly zonePriorityConfigRepo: Repository<RuleZonePriorityConfigTypeormEntity>,
    @InjectRepository(RuleZonePriorityPalettierTypeormEntity)
    private readonly zonePriorityPalettierRepo: Repository<RuleZonePriorityPalettierTypeormEntity>,
    @InjectRepository(RuleProductIncompatibilityConfigTypeormEntity)
    private readonly productIncompatibilityConfigRepo: Repository<RuleProductIncompatibilityConfigTypeormEntity>,
    @InjectRepository(RuleStorageConditionConfigTypeormEntity)
    private readonly storageConditionConfigRepo: Repository<RuleStorageConditionConfigTypeormEntity>,
    @InjectRepository(RuleStorageConditionPalettierTypeormEntity)
    private readonly storageConditionPalettierRepo: Repository<RuleStorageConditionPalettierTypeormEntity>,
    @InjectRepository(RulePlacementConstraintConfigTypeormEntity)
    private readonly placementConstraintConfigRepo: Repository<RulePlacementConstraintConfigTypeormEntity>,
    @InjectRepository(ProductRuleTypeormEntity)
    private readonly productRuleRepo: Repository<ProductRuleTypeormEntity>,
    @InjectRepository(PalettierTypeormEntity)
    private readonly palettierRepo: Repository<PalettierTypeormEntity>,
    @InjectRepository(ProductTypeormEntity)
    private readonly productRepo: Repository<ProductTypeormEntity>,
    @InjectRepository(PalettierTypeTypeormEntity)
    private readonly palettierTypeRepo: Repository<PalettierTypeTypeormEntity>
  ) {}

  async findById(
    id: number,
    options?: { includeProducts?: boolean }
  ): Promise<RuleWithConfig | null> {
    const rule = await this.ruleRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!rule) {
      return null;
    }

    return this.loadRuleWithConfig(rule, options?.includeProducts ?? false);
  }

  async findAll(options?: FindRulesOptions): Promise<FindRulesResult> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const skip = (page - 1) * limit;
    const isActive = options?.isActive ?? true;

    const whereClause: Record<string, unknown> = {
      deletedAt: IsNull(),
      isActive,
    };

    if (options?.type) {
      whereClause.type = options.type;
    }

    const [rules, total] = await this.ruleRepo.findAndCount({
      where: whereClause,
      order: { createdAt: "DESC" },
      skip,
      take: limit,
    });

    const rulesWithConfig = await Promise.all(
      rules.map((rule) =>
        this.loadRuleWithConfig(rule, options?.includeProducts ?? false)
      )
    );

    return {
      rules: rulesWithConfig,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createBatch(
    rules: CreateRuleWithConfigData[],
    transactionManager?: EntityManager
  ): Promise<RuleWithConfig[]> {
    const manager = transactionManager ?? this.ruleRepo.manager;
    const createdRules: RuleWithConfig[] = [];

    for (const ruleData of rules) {
      const ruleEntity = manager.create(RuleTypeormEntity, {
        name: ruleData.rule.name,
        description: ruleData.rule.description ?? null,
        type: ruleData.rule.type,
        isActive: ruleData.rule.isActive ?? true,
      });
      const savedRule = await manager.save(RuleTypeormEntity, ruleEntity);

      let zonePriorityConfig:
        | (RuleZonePriorityConfigEntity & { palettierIds: number[] })
        | undefined;
      let productIncompatibilityConfig:
        | RuleProductIncompatibilityConfigEntity
        | undefined;
      let storageConditionConfig:
        | (RuleStorageConditionConfigEntity & { palettierIds: number[] })
        | undefined;
      let placementConstraintConfig:
        | RulePlacementConstraintConfigEntity
        | undefined;

      if (
        ruleData.rule.type === RuleType.ZONE_PRIORITY &&
        ruleData.zonePriorityConfig
      ) {
        const configEntity = manager.create(
          RuleZonePriorityConfigTypeormEntity,
          {
            ruleId: savedRule.id,
            priorityLevel: ruleData.zonePriorityConfig.priorityLevel,
          }
        );
        const savedConfig = await manager.save(
          RuleZonePriorityConfigTypeormEntity,
          configEntity
        );

        const palettierEntities = ruleData.zonePriorityConfig.palettierIds.map(
          (palettierId) =>
            manager.create(RuleZonePriorityPalettierTypeormEntity, {
              configId: savedConfig.id,
              palettierId,
            })
        );
        await manager.save(
          RuleZonePriorityPalettierTypeormEntity,
          palettierEntities
        );

        const baseConfig = this.toZonePriorityConfigEntity(savedConfig);
        zonePriorityConfig = {
          id: baseConfig.id,
          ruleId: baseConfig.ruleId,
          priorityLevel: baseConfig.priorityLevel,
          createdAt: baseConfig.createdAt,
          updatedAt: baseConfig.updatedAt,
          palettierIds: ruleData.zonePriorityConfig.palettierIds,
        };
      }

      if (
        ruleData.rule.type === RuleType.PRODUCT_INCOMPATIBILITY &&
        ruleData.productIncompatibilityConfig
      ) {
        const configEntity = manager.create(
          RuleProductIncompatibilityConfigTypeormEntity,
          {
            ruleId: savedRule.id,
            categoryId: ruleData.productIncompatibilityConfig.categoryId,
            minimumDistance:
              ruleData.productIncompatibilityConfig.minimumDistance,
          }
        );
        const savedConfig = await manager.save(
          RuleProductIncompatibilityConfigTypeormEntity,
          configEntity
        );

        productIncompatibilityConfig =
          this.toProductIncompatibilityConfigEntity(savedConfig);
      }

      if (
        ruleData.rule.type === RuleType.STORAGE_CONDITION &&
        ruleData.storageConditionConfig
      ) {
        const configEntity = manager.create(
          RuleStorageConditionConfigTypeormEntity,
          {
            ruleId: savedRule.id,
            conditionType: ruleData.storageConditionConfig.conditionType,
            selectionMode: ruleData.storageConditionConfig.selectionMode,
            palettierTypeId:
              ruleData.storageConditionConfig.palettierTypeId ?? null,
          }
        );
        const savedConfig = await manager.save(
          RuleStorageConditionConfigTypeormEntity,
          configEntity
        );

        const palettierIds = ruleData.storageConditionConfig.palettierIds ?? [];
        if (palettierIds.length > 0) {
          const palettierEntities = palettierIds.map((palettierId) =>
            manager.create(RuleStorageConditionPalettierTypeormEntity, {
              configId: savedConfig.id,
              palettierId,
            })
          );
          await manager.save(
            RuleStorageConditionPalettierTypeormEntity,
            palettierEntities
          );
        }

        const baseStorageConfig =
          this.toStorageConditionConfigEntity(savedConfig);
        storageConditionConfig = {
          id: baseStorageConfig.id,
          ruleId: baseStorageConfig.ruleId,
          conditionType: baseStorageConfig.conditionType,
          selectionMode: baseStorageConfig.selectionMode,
          palettierTypeId: baseStorageConfig.palettierTypeId,
          createdAt: baseStorageConfig.createdAt,
          updatedAt: baseStorageConfig.updatedAt,
          palettierIds,
        };
      }

      if (
        ruleData.rule.type === RuleType.PLACEMENT_CONSTRAINT &&
        ruleData.placementConstraintConfig
      ) {
        const configEntity = manager.create(
          RulePlacementConstraintConfigTypeormEntity,
          {
            ruleId: savedRule.id,
            constraintType: ruleData.placementConstraintConfig.constraintType,
            maxHeight: ruleData.placementConstraintConfig.maxHeight ?? null,
          }
        );
        const savedConfig = await manager.save(
          RulePlacementConstraintConfigTypeormEntity,
          configEntity
        );

        placementConstraintConfig =
          this.toPlacementConstraintConfigEntity(savedConfig);
      }

      const productIds = ruleData.rule.productIds ?? [];
      if (productIds.length > 0) {
        const productRuleEntities = productIds.map((productId) =>
          manager.create(ProductRuleTypeormEntity, {
            ruleId: savedRule.id,
            productId,
          })
        );
        await manager.save(ProductRuleTypeormEntity, productRuleEntities);
      }

      createdRules.push({
        rule: this.toRuleEntity(savedRule),
        zonePriorityConfig,
        productIncompatibilityConfig,
        storageConditionConfig,
        placementConstraintConfig,
        productIds: productIds.length > 0 ? productIds : undefined,
      });
    }

    return createdRules;
  }

  async update(
    id: number,
    data: UpdateRuleWithConfigData
  ): Promise<RuleWithConfig> {
    const rule = await this.ruleRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!rule) {
      throw new RuleNotFoundError(id);
    }

    if (data.rule) {
      if (data.rule.name !== undefined) {
        rule.name = data.rule.name;
      }
      if (data.rule.description !== undefined) {
        rule.description = data.rule.description;
      }
      if (data.rule.isActive !== undefined) {
        rule.isActive = data.rule.isActive;
      }
      await this.ruleRepo.save(rule);
    }

    if (rule.type === RuleType.ZONE_PRIORITY && data.zonePriorityConfig) {
      const config = await this.zonePriorityConfigRepo.findOne({
        where: { ruleId: id },
      });

      if (config) {
        if (data.zonePriorityConfig.priorityLevel !== undefined) {
          config.priorityLevel = data.zonePriorityConfig.priorityLevel;
          await this.zonePriorityConfigRepo.save(config);
        }

        if (data.zonePriorityConfig.palettierIds !== undefined) {
          await this.zonePriorityPalettierRepo.delete({ configId: config.id });
          const palettierEntities = data.zonePriorityConfig.palettierIds.map(
            (palettierId) =>
              this.zonePriorityPalettierRepo.create({
                configId: config.id,
                palettierId,
              })
          );
          await this.zonePriorityPalettierRepo.save(palettierEntities);
        }
      }
    }

    if (
      rule.type === RuleType.PRODUCT_INCOMPATIBILITY &&
      data.productIncompatibilityConfig
    ) {
      const config = await this.productIncompatibilityConfigRepo.findOne({
        where: { ruleId: id },
      });

      if (config) {
        if (data.productIncompatibilityConfig.categoryId !== undefined) {
          config.categoryId = data.productIncompatibilityConfig.categoryId;
        }
        if (data.productIncompatibilityConfig.minimumDistance !== undefined) {
          config.minimumDistance =
            data.productIncompatibilityConfig.minimumDistance;
        }
        await this.productIncompatibilityConfigRepo.save(config);
      }
    }

    if (
      rule.type === RuleType.STORAGE_CONDITION &&
      data.storageConditionConfig
    ) {
      const config = await this.storageConditionConfigRepo.findOne({
        where: { ruleId: id },
      });

      if (config) {
        if (data.storageConditionConfig.conditionType !== undefined) {
          config.conditionType = data.storageConditionConfig.conditionType;
        }
        if (data.storageConditionConfig.selectionMode !== undefined) {
          config.selectionMode = data.storageConditionConfig.selectionMode;
        }
        if (data.storageConditionConfig.palettierTypeId !== undefined) {
          config.palettierTypeId = data.storageConditionConfig.palettierTypeId;
        }
        await this.storageConditionConfigRepo.save(config);

        if (data.storageConditionConfig.palettierIds !== undefined) {
          await this.storageConditionPalettierRepo.delete({
            configId: config.id,
          });
          if (data.storageConditionConfig.palettierIds.length > 0) {
            const palettierEntities =
              data.storageConditionConfig.palettierIds.map((palettierId) =>
                this.storageConditionPalettierRepo.create({
                  configId: config.id,
                  palettierId,
                })
              );
            await this.storageConditionPalettierRepo.save(palettierEntities);
          }
        }
      }
    }

    if (
      rule.type === RuleType.PLACEMENT_CONSTRAINT &&
      data.placementConstraintConfig
    ) {
      const config = await this.placementConstraintConfigRepo.findOne({
        where: { ruleId: id },
      });

      if (config) {
        if (data.placementConstraintConfig.constraintType !== undefined) {
          config.constraintType = data.placementConstraintConfig.constraintType;
        }
        if (data.placementConstraintConfig.maxHeight !== undefined) {
          config.maxHeight = data.placementConstraintConfig.maxHeight;
        }
        await this.placementConstraintConfigRepo.save(config);
      }
    }

    const updatedRule = await this.findById(id);
    if (!updatedRule) {
      throw new RuleNotFoundError(id);
    }

    return updatedRule;
  }

  async softDelete(id: number): Promise<void> {
    const rule = await this.ruleRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!rule) {
      throw new RuleNotFoundError(id);
    }

    await this.ruleRepo.softDelete(id);
  }

  async linkProducts(
    ruleId: number,
    productIds: number[],
    transactionManager?: EntityManager
  ): Promise<void> {
    const manager = transactionManager ?? this.productRuleRepo.manager;

    const existingLinks = await manager.find(ProductRuleTypeormEntity, {
      where: { ruleId, productId: In(productIds) },
    });

    const existingProductIds = new Set(
      existingLinks.map((link) => link.productId)
    );
    const newProductIds = productIds.filter(
      (id) => !existingProductIds.has(id)
    );

    if (newProductIds.length > 0) {
      const productRuleEntities = newProductIds.map((productId) =>
        manager.create(ProductRuleTypeormEntity, {
          ruleId,
          productId,
        })
      );
      await manager.save(ProductRuleTypeormEntity, productRuleEntities);
    }
  }

  async unlinkProducts(ruleId: number, productIds: number[]): Promise<void> {
    await this.productRuleRepo.delete({
      ruleId,
      productId: In(productIds),
    });
  }

  async validatePalettierIds(ids: number[]): Promise<number[]> {
    if (ids.length === 0) {
      return [];
    }

    const existingPalettiers = await this.palettierRepo.find({
      where: { id: In(ids), deletedAt: IsNull() },
      select: ["id"],
    });

    const existingIds = new Set(existingPalettiers.map((p) => p.id));
    return ids.filter((id) => !existingIds.has(id));
  }

  async validateProductIds(ids: number[]): Promise<number[]> {
    if (ids.length === 0) {
      return [];
    }

    const existingProducts = await this.productRepo.find({
      where: { id: In(ids), deletedAt: IsNull() },
      select: ["id"],
    });

    const existingIds = new Set(existingProducts.map((p) => p.id));
    return ids.filter((id) => !existingIds.has(id));
  }

  async validatePalettierTypeId(id: number): Promise<boolean> {
    const palettierType = await this.palettierTypeRepo.findOne({
      where: { id },
      select: ["id"],
    });

    return palettierType !== null;
  }

  async findPalettesForViolationCheck(
    ruleId: number
  ): Promise<PaletteForViolationCheck[]> {
    interface RawPaletteRow {
      paletteId: number;
      palettierName: string;
      palettierTypeId: number;
      palettierId: number;
      positionX: number;
      positionY: number;
      positionZ: number;
      productName: string;
    }

    const rows: RawPaletteRow[] = await this.ruleRepo
      .createQueryBuilder("rule")
      .innerJoin("product_rule", "pr", "pr.rule_id = rule.id")
      .innerJoin(
        "product",
        "prod",
        "prod.id = pr.product_id AND prod.deleted_at IS NULL"
      )
      .innerJoin(
        "lot",
        "lot",
        "lot.product_id = prod.id AND lot.deleted_at IS NULL"
      )
      .innerJoin("palette_lot", "pl", "pl.lot_id = lot.id")
      .innerJoin(
        "palette",
        "palette",
        "palette.id = pl.palette_id AND palette.deleted_at IS NULL"
      )
      .innerJoin(
        "palettier",
        "palettier",
        "palettier.id = palette.palettier_id AND palettier.deleted_at IS NULL"
      )
      .where("rule.id = :ruleId", { ruleId })
      .select([
        "DISTINCT palette.id AS paletteId",
        "palettier.name AS palettierName",
        "palettier.palettier_type_id AS palettierTypeId",
        "palettier.id AS palettierId",
        "palette.position_x AS positionX",
        "palette.position_y AS positionY",
        "palette.position_z AS positionZ",
        "prod.name AS productName",
      ])
      .getRawMany();

    return rows;
  }

  private async loadRuleWithConfig(
    rule: RuleTypeormEntity,
    includeProducts: boolean
  ): Promise<RuleWithConfig> {
    const result: RuleWithConfig = {
      rule: this.toRuleEntity(rule),
    };

    switch (rule.type) {
      case RuleType.ZONE_PRIORITY: {
        const config = await this.zonePriorityConfigRepo.findOne({
          where: { ruleId: rule.id },
        });
        if (config) {
          const palettiers = await this.zonePriorityPalettierRepo.find({
            where: { configId: config.id },
          });
          const baseZoneConfig = this.toZonePriorityConfigEntity(config);
          result.zonePriorityConfig = {
            id: baseZoneConfig.id,
            ruleId: baseZoneConfig.ruleId,
            priorityLevel: baseZoneConfig.priorityLevel,
            createdAt: baseZoneConfig.createdAt,
            updatedAt: baseZoneConfig.updatedAt,
            palettierIds: palettiers.map((p) => p.palettierId),
          };
        }
        break;
      }
      case RuleType.PRODUCT_INCOMPATIBILITY: {
        const config = await this.productIncompatibilityConfigRepo.findOne({
          where: { ruleId: rule.id },
        });
        if (config) {
          result.productIncompatibilityConfig =
            this.toProductIncompatibilityConfigEntity(config);
        }
        break;
      }
      case RuleType.STORAGE_CONDITION: {
        const config = await this.storageConditionConfigRepo.findOne({
          where: { ruleId: rule.id },
        });
        if (config) {
          const palettiers = await this.storageConditionPalettierRepo.find({
            where: { configId: config.id },
          });
          const baseStorageConditionConfig =
            this.toStorageConditionConfigEntity(config);
          result.storageConditionConfig = {
            id: baseStorageConditionConfig.id,
            ruleId: baseStorageConditionConfig.ruleId,
            conditionType: baseStorageConditionConfig.conditionType,
            selectionMode: baseStorageConditionConfig.selectionMode,
            palettierTypeId: baseStorageConditionConfig.palettierTypeId,
            createdAt: baseStorageConditionConfig.createdAt,
            updatedAt: baseStorageConditionConfig.updatedAt,
            palettierIds: palettiers.map((p) => p.palettierId),
          };
        }
        break;
      }
      case RuleType.PLACEMENT_CONSTRAINT: {
        const config = await this.placementConstraintConfigRepo.findOne({
          where: { ruleId: rule.id },
        });
        if (config) {
          result.placementConstraintConfig =
            this.toPlacementConstraintConfigEntity(config);
        }
        break;
      }
    }

    if (includeProducts) {
      const productRules = await this.productRuleRepo.find({
        where: { ruleId: rule.id },
      });
      result.productIds = productRules.map((pr) => pr.productId);
    }

    return result;
  }

  async countActiveRules(): Promise<number> {
    return this.ruleRepo.count({
      where: { deletedAt: IsNull() },
    });
  }

  private toRuleEntity(entity: RuleTypeormEntity): RuleEntity {
    return new RuleEntity({
      id: entity.id,
      name: entity.name,
      description: entity.description,
      type: entity.type,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    });
  }

  private toZonePriorityConfigEntity(
    entity: RuleZonePriorityConfigTypeormEntity
  ): RuleZonePriorityConfigEntity {
    return new RuleZonePriorityConfigEntity({
      id: entity.id,
      ruleId: entity.ruleId,
      priorityLevel: entity.priorityLevel,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  private toProductIncompatibilityConfigEntity(
    entity: RuleProductIncompatibilityConfigTypeormEntity
  ): RuleProductIncompatibilityConfigEntity {
    return new RuleProductIncompatibilityConfigEntity({
      id: entity.id,
      ruleId: entity.ruleId,
      categoryId: entity.categoryId,
      minimumDistance: entity.minimumDistance,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  private toStorageConditionConfigEntity(
    entity: RuleStorageConditionConfigTypeormEntity
  ): RuleStorageConditionConfigEntity {
    return new RuleStorageConditionConfigEntity({
      id: entity.id,
      ruleId: entity.ruleId,
      conditionType: entity.conditionType,
      selectionMode: entity.selectionMode,
      palettierTypeId: entity.palettierTypeId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  private toPlacementConstraintConfigEntity(
    entity: RulePlacementConstraintConfigTypeormEntity
  ): RulePlacementConstraintConfigEntity {
    return new RulePlacementConstraintConfigEntity({
      id: entity.id,
      ruleId: entity.ruleId,
      constraintType: entity.constraintType,
      maxHeight: entity.maxHeight,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
