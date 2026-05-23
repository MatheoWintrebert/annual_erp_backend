import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  type EntityManager,
  IsNull,
  QueryFailedError,
  Repository,
} from "typeorm";
import { PaletteEntity } from "@domain/entities";
import { CreatePaletteData, PaletteRepository } from "@domain/repositories";
import {
  PaletteLotFefoData,
  PaletteWithDetails,
  PaletteItemDetail,
  ProductStock,
} from "@domain/types";
import {
  PaletteNotFoundError,
  PositionOccupiedError,
  StockDeductionFailedError,
} from "@domain/errors";
import {
  PaletteTypeormEntity,
  PaletteLotTypeormEntity,
} from "@infrastructure/entities";

interface PaletteDetailRow {
  paletteId: number;
  palettierId: number;
  palettierName: string;
  positionX: number;
  positionY: number;
  positionZ: number;
  createdAt: string;
  productId: number | null;
  productName: string;
  productReference: string;
  lotReference: string;
  quantity: string | number;
  expiryDate: string | null;
  unitOfMeasureName: string;
}

@Injectable()
export class PaletteMysqlRepository implements PaletteRepository {
  constructor(
    @InjectRepository(PaletteTypeormEntity)
    private readonly paletteRepo: Repository<PaletteTypeormEntity>
  ) {}

  async create(
    data: CreatePaletteData,
    transactionManager?: EntityManager
  ): Promise<PaletteEntity> {
    const repo = transactionManager
      ? transactionManager.getRepository(PaletteTypeormEntity)
      : this.paletteRepo;
    const entity = repo.create({
      palettierId: data.palettierId,
      positionX: data.positionX,
      positionY: data.positionY,
      positionZ: data.positionZ,
    });
    try {
      const saved = await repo.save(entity);
      return this.toPaletteEntity(saved);
    } catch (error: unknown) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { errno?: number }).errno === 1062
      ) {
        throw new PositionOccupiedError(
          data.palettierId,
          data.positionX,
          data.positionY,
          data.positionZ
        );
      }
      throw error;
    }
  }

  async findByPalettierIdAndPosition(
    palettierId: number,
    x: number,
    y: number,
    z: number
  ): Promise<PaletteEntity | null> {
    const palette = await this.paletteRepo.findOne({
      where: {
        palettierId,
        positionX: x,
        positionY: y,
        positionZ: z,
        deletedAt: IsNull(),
      },
    });

    if (!palette) {
      return null;
    }

    return this.toPaletteEntity(palette);
  }

  async findById(id: number): Promise<PaletteEntity | null> {
    const palette = await this.paletteRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!palette) {
      return null;
    }

    return this.toPaletteEntity(palette);
  }

  async updatePosition(
    id: number,
    palettierId: number,
    positionX: number,
    positionY: number,
    positionZ: number
  ): Promise<void> {
    try {
      const result = await this.paletteRepo.update(
        { id, deletedAt: IsNull() },
        { palettierId, positionX, positionY, positionZ }
      );
      if (result.affected === 0) {
        throw new PaletteNotFoundError(id);
      }
    } catch (error: unknown) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { errno?: number }).errno === 1062
      ) {
        throw new PositionOccupiedError(
          palettierId,
          positionX,
          positionY,
          positionZ
        );
      }
      throw error;
    }
  }

  async findOccupiedPositionsByPalettierId(
    palettierId: number
  ): Promise<{ positionX: number; positionY: number; positionZ: number }[]> {
    const palettes = await this.paletteRepo.find({
      where: { palettierId, deletedAt: IsNull() },
      select: ["positionX", "positionY", "positionZ"],
    });

    return palettes.map((p) => ({
      positionX: p.positionX,
      positionY: p.positionY,
      positionZ: p.positionZ,
    }));
  }

  async findOccupiedPositionsByPalettierIds(
    palettierIds: number[]
  ): Promise<
    Map<number, { positionX: number; positionY: number; positionZ: number }[]>
  > {
    const result = new Map<
      number,
      { positionX: number; positionY: number; positionZ: number }[]
    >();

    for (const id of palettierIds) {
      result.set(id, []);
    }

    if (palettierIds.length === 0) {
      return result;
    }

    const palettes = await this.paletteRepo.find({
      where: palettierIds.map((id) => ({
        palettierId: id,
        deletedAt: IsNull(),
      })),
      select: ["palettierId", "positionX", "positionY", "positionZ"],
    });

    for (const p of palettes) {
      const list = result.get(p.palettierId) ?? [];
      list.push({
        positionX: p.positionX,
        positionY: p.positionY,
        positionZ: p.positionZ,
      });
      result.set(p.palettierId, list);
    }

    return result;
  }

  async findCategoryIdsByPalettierId(palettierId: number): Promise<number[]> {
    const results: { categoryId: number | null }[] = await this.paletteRepo
      .createQueryBuilder("palette")
      .innerJoin("palette.paletteLots", "paletteLot")
      .innerJoin("paletteLot.lot", "lot")
      .innerJoin("lot.product", "product")
      .where("palette.palettierId = :palettierId", { palettierId })
      .andWhere("palette.deletedAt IS NULL")
      .select("product.categoryId", "categoryId")
      .groupBy("product.categoryId")
      .getRawMany();

    return results
      .map((r) => r.categoryId)
      .filter((id): id is number => id != null);
  }

  async findCategoryIdsByPalettierIds(
    palettierIds: number[]
  ): Promise<Map<number, number[]>> {
    const result = new Map<number, number[]>();

    for (const id of palettierIds) {
      result.set(id, []);
    }

    if (palettierIds.length === 0) {
      return result;
    }

    const rows: { palettierId: number; categoryId: number | null }[] =
      await this.paletteRepo
        .createQueryBuilder("palette")
        .innerJoin("palette.paletteLots", "paletteLot")
        .innerJoin("paletteLot.lot", "lot")
        .innerJoin("lot.product", "product")
        .where("palette.palettierId IN (:...palettierIds)", { palettierIds })
        .andWhere("palette.deletedAt IS NULL")
        .select("palette.palettierId", "palettierId")
        .addSelect("product.categoryId", "categoryId")
        .groupBy("palette.palettierId")
        .addGroupBy("product.categoryId")
        .getRawMany();

    for (const row of rows) {
      if (row.categoryId == null) {
        continue;
      }
      const list = result.get(row.palettierId) ?? [];
      if (!list.includes(row.categoryId)) {
        list.push(row.categoryId);
      }
      result.set(row.palettierId, list);
    }

    return result;
  }

  async findAllWithDetails(filters?: {
    palettierId?: number;
    productSearch?: string;
  }): Promise<PaletteWithDetails[]> {
    const qb = this.paletteRepo
      .createQueryBuilder("palette")
      .innerJoin("palette.palettier", "palettier")
      .leftJoin("palette.paletteLots", "paletteLot")
      .leftJoin("paletteLot.lot", "lot")
      .leftJoin("lot.product", "product")
      .leftJoin("product.unitOfMeasure", "unitOfMeasure")
      .select("palette.id", "paletteId")
      .addSelect("palette.palettierId", "palettierId")
      .addSelect("palettier.name", "palettierName")
      .addSelect("palette.positionX", "positionX")
      .addSelect("palette.positionY", "positionY")
      .addSelect("palette.positionZ", "positionZ")
      .addSelect("palette.createdAt", "createdAt")
      .addSelect("product.id", "productId")
      .addSelect("product.name", "productName")
      .addSelect("product.reference", "productReference")
      .addSelect("lot.reference", "lotReference")
      .addSelect("paletteLot.quantity", "quantity")
      .addSelect("lot.expirationDate", "expiryDate")
      .addSelect("unitOfMeasure.name", "unitOfMeasureName")
      .where("palette.deletedAt IS NULL")
      .orderBy("palette.createdAt", "DESC");

    if (filters?.palettierId !== undefined) {
      qb.andWhere("palette.palettierId = :palettierId", {
        palettierId: filters.palettierId,
      });
    }

    if (filters?.productSearch) {
      // Get palette IDs that contain a matching product
      const subQuery = this.paletteRepo
        .createQueryBuilder("subPalette")
        .innerJoin("subPalette.paletteLots", "subPaletteLot")
        .innerJoin("subPaletteLot.lot", "subLot")
        .innerJoin("subLot.product", "subProduct")
        .select("subPalette.id")
        .where("subPalette.deletedAt IS NULL")
        .andWhere("subProduct.name LIKE :search");

      qb.andWhere(`palette.id IN (${subQuery.getQuery()})`);
      qb.setParameters({
        ...qb.getParameters(),
        search: `%${filters.productSearch}%`,
      });
    }

    const rows = await qb.getRawMany<PaletteDetailRow>();

    // Group raw rows by palette ID
    const paletteMap = new Map<number, PaletteWithDetails>();

    for (const row of rows) {
      if (!paletteMap.has(row.paletteId)) {
        paletteMap.set(row.paletteId, {
          id: row.paletteId,
          palettierId: row.palettierId,
          palettierName: row.palettierName,
          positionX: row.positionX,
          positionY: row.positionY,
          positionZ: row.positionZ,
          createdAt: new Date(row.createdAt),
          items: [],
        });
      }

      // Only add item if there's a product (LEFT JOIN may produce null product rows)
      if (row.productId != null) {
        const palette = paletteMap.get(row.paletteId);
        if (!palette) continue;
        const item: PaletteItemDetail = {
          productId: row.productId,
          productName: row.productName,
          productReference: row.productReference,
          lotReference: row.lotReference,
          quantity: Number(row.quantity),
          expiryDate: row.expiryDate ? new Date(row.expiryDate) : null,
          unitOfMeasureName: row.unitOfMeasureName,
        };
        palette.items.push(item);
      }
    }

    return Array.from(paletteMap.values());
  }

  async getAvailableStockByProductIds(
    productIds: number[]
  ): Promise<ProductStock[]> {
    if (productIds.length === 0) {
      return [];
    }

    const rows: {
      productId: number;
      productName: string;
      productReference: string;
      availableQuantity: string;
      unitOfMeasureName: string;
    }[] = await this.paletteRepo
      .createQueryBuilder("palette")
      .innerJoin("palette.paletteLots", "paletteLot")
      .innerJoin("paletteLot.lot", "lot")
      .innerJoin("lot.product", "product")
      .leftJoin("product.unitOfMeasure", "unitOfMeasure")
      .where("product.id IN (:...productIds)", { productIds })
      .andWhere("palette.deletedAt IS NULL")
      .andWhere("lot.deletedAt IS NULL")
      .andWhere("product.deletedAt IS NULL")
      .select("product.id", "productId")
      .addSelect("product.name", "productName")
      .addSelect("product.reference", "productReference")
      .addSelect("COALESCE(SUM(paletteLot.quantity), 0)", "availableQuantity")
      .addSelect("unitOfMeasure.name", "unitOfMeasureName")
      .groupBy("product.id")
      .addGroupBy("product.name")
      .addGroupBy("product.reference")
      .addGroupBy("unitOfMeasure.name")
      .getRawMany();

    // Build a set of found product IDs to detect products with 0 stock
    const foundIds = new Set(rows.map((r) => r.productId));

    // For products not found in the join (no lots/palettes), query product info directly
    const missingIds = productIds.filter((id) => !foundIds.has(id));

    let missingProducts: ProductStock[] = [];
    if (missingIds.length > 0) {
      const missingRows: {
        productId: number;
        productName: string;
        productReference: string;
        unitOfMeasureName: string;
      }[] = await this.paletteRepo.manager
        .createQueryBuilder()
        .select("product.id", "productId")
        .addSelect("product.name", "productName")
        .addSelect("product.reference", "productReference")
        .addSelect("unitOfMeasure.name", "unitOfMeasureName")
        .from("products", "product")
        .leftJoin(
          "units_of_measure",
          "unitOfMeasure",
          "unitOfMeasure.id = product.unit_of_measure_id"
        )
        .where("product.id IN (:...missingIds)", { missingIds })
        .andWhere("product.deleted_at IS NULL")
        .getRawMany();

      missingProducts = missingRows.map((r) => ({
        productId: r.productId,
        productName: r.productName,
        productReference: r.productReference,
        availableQuantity: 0,
        unitOfMeasureName: r.unitOfMeasureName,
      }));
    }

    const result: ProductStock[] = rows.map((r) => ({
      productId: r.productId,
      productName: r.productName,
      productReference: r.productReference,
      availableQuantity: Number(r.availableQuantity),
      unitOfMeasureName: r.unitOfMeasureName,
    }));

    return [...result, ...missingProducts];
  }

  async getPaletteLotsByProductIdsForFefo(
    productIds: number[]
  ): Promise<PaletteLotFefoData[]> {
    if (productIds.length === 0) {
      return [];
    }

    const rows: {
      paletteLotId: number;
      paletteId: number;
      palettierId: number;
      palettierName: string;
      positionX: number;
      positionY: number;
      positionZ: number;
      lotId: number;
      lotReference: string;
      expiryDate: Date | null;
      quantity: string | number;
      productId: number;
      productName: string;
      productReference: string;
    }[] = await this.paletteRepo
      .createQueryBuilder("palette")
      .innerJoin("palette.palettier", "palettier")
      .innerJoin("palette.paletteLots", "paletteLot")
      .innerJoin("paletteLot.lot", "lot")
      .innerJoin("lot.product", "product")
      .where("product.id IN (:...productIds)", { productIds })
      .andWhere("paletteLot.quantity > 0")
      .andWhere("palette.deletedAt IS NULL")
      .andWhere("palettier.deletedAt IS NULL")
      .andWhere("lot.deletedAt IS NULL")
      .andWhere("product.deletedAt IS NULL")
      .select("paletteLot.id", "paletteLotId")
      .addSelect("palette.id", "paletteId")
      .addSelect("palettier.id", "palettierId")
      .addSelect("palettier.name", "palettierName")
      .addSelect("palette.positionX", "positionX")
      .addSelect("palette.positionY", "positionY")
      .addSelect("palette.positionZ", "positionZ")
      .addSelect("lot.id", "lotId")
      .addSelect("lot.reference", "lotReference")
      .addSelect("lot.expirationDate", "expiryDate")
      .addSelect("paletteLot.quantity", "quantity")
      .addSelect("product.id", "productId")
      .addSelect("product.name", "productName")
      .addSelect("product.reference", "productReference")
      .orderBy("CASE WHEN lot.expiration_date IS NULL THEN 1 ELSE 0 END", "ASC")
      .addOrderBy("lot.expiration_date", "ASC")
      .addOrderBy("lot.created_at", "ASC")
      .getRawMany();

    return rows.map((row) => ({
      paletteLotId: row.paletteLotId,
      paletteId: row.paletteId,
      palettierId: row.palettierId,
      palettierName: row.palettierName,
      positionX: row.positionX,
      positionY: row.positionY,
      positionZ: row.positionZ,
      lotId: row.lotId,
      lotReference: row.lotReference,
      expiryDate: row.expiryDate ? new Date(row.expiryDate) : null,
      quantity: Number(row.quantity),
      productId: row.productId,
      productName: row.productName,
      productReference: row.productReference,
    }));
  }

  async deductPaletteLotQuantity(
    paletteLotId: number,
    quantity: number,
    transactionManager?: EntityManager
  ): Promise<void> {
    const repo = transactionManager
      ? transactionManager.getRepository(PaletteLotTypeormEntity)
      : this.paletteRepo.manager.getRepository(PaletteLotTypeormEntity);

    const result = await repo
      .createQueryBuilder()
      .update(PaletteLotTypeormEntity)
      .set({ quantity: () => "quantity - :qty" })
      .setParameters({ qty: quantity })
      .where("id = :id AND quantity >= :quantity", {
        id: paletteLotId,
        quantity,
      })
      .execute();

    if (result.affected === 0) {
      throw new StockDeductionFailedError(paletteLotId, quantity);
    }
  }

  async deductMultiplePaletteLotQuantities(
    deductions: { paletteLotId: number; quantity: number }[]
  ): Promise<void> {
    if (deductions.length === 0) return;

    await this.paletteRepo.manager.transaction(async (manager) => {
      for (const { paletteLotId, quantity } of deductions) {
        await this.deductPaletteLotQuantity(paletteLotId, quantity, manager);
      }
    });
  }

  async getStockWithExpiryByProductIds(productIds: number[]): Promise<
    {
      productId: number;
      lotId: number;
      quantity: number;
      expiryDate: Date | null;
    }[]
  > {
    if (productIds.length === 0) {
      return [];
    }

    const rows: {
      productId: number;
      lotId: number;
      quantity: string | number;
      expiryDate: Date | null;
    }[] = await this.paletteRepo
      .createQueryBuilder("palette")
      .innerJoin("palette.paletteLots", "paletteLot")
      .innerJoin("paletteLot.lot", "lot")
      .where("lot.productId IN (:...productIds)", { productIds })
      .andWhere("paletteLot.quantity > 0")
      .andWhere("palette.deletedAt IS NULL")
      .andWhere("lot.deletedAt IS NULL")
      .select("lot.productId", "productId")
      .addSelect("lot.id", "lotId")
      .addSelect("SUM(paletteLot.quantity)", "quantity")
      .addSelect("lot.expirationDate", "expiryDate")
      .groupBy("lot.productId")
      .addGroupBy("lot.id")
      .addGroupBy("lot.expirationDate")
      .getRawMany();

    return rows.map((row) => ({
      productId: row.productId,
      lotId: row.lotId,
      quantity: Number(row.quantity),
      expiryDate: row.expiryDate ? new Date(row.expiryDate) : null,
    }));
  }

  async getStockQuantityByProductIds(
    productIds: number[]
  ): Promise<{ productId: number; totalQuantity: number }[]> {
    if (productIds.length === 0) {
      return [];
    }

    const rows: {
      productId: number;
      totalQuantity: string | number;
    }[] = await this.paletteRepo
      .createQueryBuilder("palette")
      .innerJoin("palette.paletteLots", "paletteLot")
      .innerJoin("paletteLot.lot", "lot")
      .where("lot.productId IN (:...productIds)", { productIds })
      .andWhere("paletteLot.quantity > 0")
      .andWhere("palette.deletedAt IS NULL")
      .andWhere("lot.deletedAt IS NULL")
      .select("lot.productId", "productId")
      .addSelect("SUM(paletteLot.quantity)", "totalQuantity")
      .groupBy("lot.productId")
      .getRawMany();

    return rows.map((row) => ({
      productId: row.productId,
      totalQuantity: Number(row.totalQuantity),
    }));
  }

  async countActivePalettes(): Promise<number> {
    return this.paletteRepo.count({
      where: { deletedAt: IsNull() },
    });
  }

  async countPalettesCreatedBetween(
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    return this.paletteRepo
      .createQueryBuilder("palette")
      .where("palette.deletedAt IS NULL")
      .andWhere("palette.createdAt >= :startDate", { startDate })
      .andWhere("palette.createdAt < :endDate", { endDate })
      .getCount();
  }

  async delete(id: number): Promise<void> {
    const result = await this.paletteRepo.softDelete({
      id,
      deletedAt: IsNull(),
    });
    if (result.affected === 0) {
      throw new PaletteNotFoundError(id);
    }
  }

  private toPaletteEntity(entity: PaletteTypeormEntity): PaletteEntity {
    return new PaletteEntity({
      id: entity.id,
      palettierId: entity.palettierId,
      positionX: entity.positionX,
      positionY: entity.positionY,
      positionZ: entity.positionZ,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    });
  }
}
