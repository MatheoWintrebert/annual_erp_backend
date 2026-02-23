import { ProductEntity } from "@domain/entities";

export interface ProductWithRules {
  product: ProductEntity;
  ruleIds: number[];
}

export interface FindProductsOptions {
  search?: string;
  page?: number;
  limit?: number;
}

export interface FindProductsResult {
  products: ProductWithRules[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateProductData {
  reference: string;
  name: string;
  unitOfMeasureId: number;
  categoryId?: number | null;
  minimumStock?: number | null;
  expiryAlertThreshold?: number | null;
  ruleIds?: number[];
}

export interface UpdateProductData {
  reference?: string;
  name?: string;
  unitOfMeasureId?: number;
  categoryId?: number | null;
  minimumStock?: number | null;
  expiryAlertThreshold?: number | null;
  ruleIds?: number[];
}

export abstract class ProductRepository {
  abstract findById(id: number): Promise<ProductWithRules | null>;

  abstract findByIds(ids: number[]): Promise<ProductWithRules[]>;

  abstract findAll(options?: FindProductsOptions): Promise<FindProductsResult>;

  abstract findByReference(reference: string): Promise<ProductEntity | null>;

  abstract create(data: CreateProductData): Promise<ProductWithRules>;

  abstract update(
    id: number,
    data: UpdateProductData
  ): Promise<ProductWithRules>;

  abstract softDelete(id: number): Promise<void>;

  abstract validateUnitOfMeasureId(id: number): Promise<boolean>;

  abstract validateCategoryId(id: number): Promise<boolean>;

  abstract validateRuleIds(ids: number[]): Promise<number[]>;

  abstract countActivePalettes(productId: number): Promise<number>;

  abstract countActiveProducts(): Promise<number>;

  abstract findAllWithThresholds(): Promise<{
    id: number;
    name: string;
    reference: string;
    minimumStock: number | null;
    expiryAlertThreshold: number | null;
    unitOfMeasureName: string;
  }[]>;
}
