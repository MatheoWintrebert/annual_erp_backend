import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, IsNull, Like, Repository } from "typeorm";
import { ProductEntity } from "@domain/entities";
import { ProductNotFoundError } from "@domain/errors";
import {
  CreateProductData,
  FindProductsOptions,
  FindProductsResult,
  ProductRepository,
  ProductWithRules,
  UpdateProductData,
} from "@domain/repositories";
import {
  CategoryTypeormEntity,
  LotTypeormEntity,
  PaletteTypeormEntity,
  ProductRuleTypeormEntity,
  ProductTypeormEntity,
  RuleTypeormEntity,
  UnitOfMeasureTypeormEntity,
} from "@infrastructure/entities";

@Injectable()
export class ProductMysqlRepository implements ProductRepository {
  constructor(
    @InjectRepository(ProductTypeormEntity)
    private readonly productRepo: Repository<ProductTypeormEntity>,
    @InjectRepository(ProductRuleTypeormEntity)
    private readonly productRuleRepo: Repository<ProductRuleTypeormEntity>,
    @InjectRepository(UnitOfMeasureTypeormEntity)
    private readonly unitOfMeasureRepo: Repository<UnitOfMeasureTypeormEntity>,
    @InjectRepository(RuleTypeormEntity)
    private readonly ruleRepo: Repository<RuleTypeormEntity>,
    @InjectRepository(CategoryTypeormEntity)
    private readonly categoryRepo: Repository<CategoryTypeormEntity>,
    @InjectRepository(LotTypeormEntity)
    private readonly lotRepo: Repository<LotTypeormEntity>,
    @InjectRepository(PaletteTypeormEntity)
    private readonly paletteRepo: Repository<PaletteTypeormEntity>
  ) {}

  async findById(id: number): Promise<ProductWithRules | null> {
    const product = await this.productRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!product) {
      return null;
    }

    const ruleIds = await this.loadRuleIds(product.id);

    return {
      product: this.toProductEntity(product),
      ruleIds,
    };
  }

  async findByIds(ids: number[]): Promise<ProductWithRules[]> {
    if (ids.length === 0) {
      return [];
    }

    const products = await this.productRepo.find({
      where: { id: In(ids), deletedAt: IsNull() },
    });

    return this.attachRuleIds(products);
  }

  async findAll(options?: FindProductsOptions): Promise<FindProductsResult> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const skip = (page - 1) * limit;

    const whereClause: Record<string, unknown> = {
      deletedAt: IsNull(),
    };

    if (options?.search) {
      const searchResults = await this.findWithSearch(
        options.search,
        skip,
        limit
      );
      return searchResults;
    }

    const [products, total] = await this.productRepo.findAndCount({
      where: whereClause,
      order: { createdAt: "DESC" },
      skip,
      take: limit,
    });

    const productsWithRules = await this.attachRuleIds(products);

    return {
      products: productsWithRules,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByReference(reference: string): Promise<ProductEntity | null> {
    const product = await this.productRepo.findOne({
      where: { reference, deletedAt: IsNull() },
    });

    if (!product) {
      return null;
    }

    return this.toProductEntity(product);
  }

  async create(data: CreateProductData): Promise<ProductWithRules> {
    const productEntity = this.productRepo.create({
      reference: data.reference,
      name: data.name,
      unitOfMeasureId: data.unitOfMeasureId,
      categoryId: data.categoryId ?? null,
      minimumStock: data.minimumStock ?? null,
      expiryAlertThreshold: data.expiryAlertThreshold ?? null,
    });
    const savedProduct = await this.productRepo.save(productEntity);

    const ruleIds = data.ruleIds ?? [];
    if (ruleIds.length > 0) {
      const productRuleEntities = ruleIds.map((ruleId) =>
        this.productRuleRepo.create({
          productId: savedProduct.id,
          ruleId,
        })
      );
      await this.productRuleRepo.save(productRuleEntities);
    }

    return {
      product: this.toProductEntity(savedProduct),
      ruleIds,
    };
  }

  async update(id: number, data: UpdateProductData): Promise<ProductWithRules> {
    const product = await this.productRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!product) {
      throw new ProductNotFoundError(id);
    }

    if (data.reference !== undefined) {
      product.reference = data.reference;
    }
    if (data.name !== undefined) {
      product.name = data.name;
    }
    if (data.unitOfMeasureId !== undefined) {
      product.unitOfMeasureId = data.unitOfMeasureId;
    }
    if (data.categoryId !== undefined) {
      product.categoryId = data.categoryId;
    }
    if (data.minimumStock !== undefined) {
      product.minimumStock = data.minimumStock;
    }
    if (data.expiryAlertThreshold !== undefined) {
      product.expiryAlertThreshold = data.expiryAlertThreshold;
    }

    await this.productRepo.save(product);

    if (data.ruleIds !== undefined) {
      await this.productRuleRepo.delete({ productId: id });

      if (data.ruleIds.length > 0) {
        const productRuleEntities = data.ruleIds.map((ruleId) =>
          this.productRuleRepo.create({
            productId: id,
            ruleId,
          })
        );
        await this.productRuleRepo.save(productRuleEntities);
      }
    }

    const ruleIds = await this.loadRuleIds(id);

    return {
      product: this.toProductEntity(product),
      ruleIds,
    };
  }

  async softDelete(id: number): Promise<void> {
    const product = await this.productRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!product) {
      throw new ProductNotFoundError(id);
    }

    await this.productRepo.softDelete(id);
  }

  async validateUnitOfMeasureId(id: number): Promise<boolean> {
    const unit = await this.unitOfMeasureRepo.findOne({
      where: { id },
      select: ["id"],
    });

    return unit !== null;
  }

  async validateCategoryId(id: number): Promise<boolean> {
    const category = await this.categoryRepo.findOne({
      where: { id, deletedAt: IsNull() },
      select: ["id"],
    });

    return category !== null;
  }

  async validateRuleIds(ids: number[]): Promise<number[]> {
    if (ids.length === 0) {
      return [];
    }

    const existingRules = await this.ruleRepo.find({
      where: { id: In(ids), deletedAt: IsNull() },
      select: ["id"],
    });

    const existingIds = new Set(existingRules.map((r) => r.id));
    return ids.filter((id) => !existingIds.has(id));
  }

  async countActivePalettes(productId: number): Promise<number> {
    const result = await this.paletteRepo
      .createQueryBuilder("p")
      .select("COUNT(DISTINCT p.id)", "count")
      .innerJoin("p.paletteLots", "pl")
      .innerJoin("pl.lot", "l")
      .where("l.productId = :productId", { productId })
      .andWhere("p.deletedAt IS NULL")
      .andWhere("l.deletedAt IS NULL")
      .getRawOne<{ count: string }>();

    return Number(result?.count ?? 0);
  }

  async findAllWithThresholds(): Promise<
    {
      id: number;
      name: string;
      reference: string;
      minimumStock: number | null;
      expiryAlertThreshold: number | null;
      unitOfMeasureName: string;
    }[]
  > {
    const rows: {
      id: number;
      name: string;
      reference: string;
      minimumStock: string | number | null;
      expiryAlertThreshold: number | null;
      unitOfMeasureName: string;
    }[] = await this.productRepo
      .createQueryBuilder("product")
      .innerJoin("product.unitOfMeasure", "unitOfMeasure")
      .where("product.deletedAt IS NULL")
      .andWhere(
        "(product.minimumStock IS NOT NULL OR product.expiryAlertThreshold IS NOT NULL)"
      )
      .select("product.id", "id")
      .addSelect("product.name", "name")
      .addSelect("product.reference", "reference")
      .addSelect("product.minimumStock", "minimumStock")
      .addSelect("product.expiryAlertThreshold", "expiryAlertThreshold")
      .addSelect("unitOfMeasure.name", "unitOfMeasureName")
      .getRawMany();

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      reference: row.reference,
      minimumStock: row.minimumStock !== null ? Number(row.minimumStock) : null,
      expiryAlertThreshold: row.expiryAlertThreshold,
      unitOfMeasureName: row.unitOfMeasureName,
    }));
  }

  private async loadRuleIds(productId: number): Promise<number[]> {
    const productRules = await this.productRuleRepo.find({
      where: { productId },
    });
    return productRules.map((pr) => pr.ruleId);
  }

  private async attachRuleIds(
    products: ProductTypeormEntity[]
  ): Promise<ProductWithRules[]> {
    if (products.length === 0) {
      return [];
    }

    const productIds = products.map((p) => p.id);
    const allProductRules = await this.productRuleRepo.find({
      where: { productId: In(productIds) },
    });

    const rulesByProductId = new Map<number, number[]>();
    for (const pr of allProductRules) {
      const existing = rulesByProductId.get(pr.productId) ?? [];
      existing.push(pr.ruleId);
      rulesByProductId.set(pr.productId, existing);
    }

    return products.map((product) => ({
      product: this.toProductEntity(product),
      ruleIds: rulesByProductId.get(product.id) ?? [],
    }));
  }

  private escapeLikeString(value: string): string {
    return value.replace(/[%_\\]/g, "\\$&");
  }

  private async findWithSearch(
    search: string,
    skip: number,
    limit: number
  ): Promise<FindProductsResult> {
    const escaped = this.escapeLikeString(search);
    const [products, total] = await this.productRepo.findAndCount({
      where: [
        { name: Like(`%${escaped}%`), deletedAt: IsNull() },
        { reference: Like(`%${escaped}%`), deletedAt: IsNull() },
      ],
      order: { createdAt: "DESC" },
      skip,
      take: limit,
    });

    const productsWithRules = await this.attachRuleIds(products);

    const page = Math.floor(skip / limit) + 1;

    return {
      products: productsWithRules,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async countActiveProducts(): Promise<number> {
    return this.productRepo.count({
      where: { deletedAt: IsNull() },
    });
  }

  private toProductEntity(entity: ProductTypeormEntity): ProductEntity {
    return new ProductEntity({
      id: entity.id,
      reference: entity.reference,
      name: entity.name,
      unitOfMeasureId: entity.unitOfMeasureId,
      categoryId: entity.categoryId,
      minimumStock: entity.minimumStock,
      expiryAlertThreshold: entity.expiryAlertThreshold,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    });
  }
}
