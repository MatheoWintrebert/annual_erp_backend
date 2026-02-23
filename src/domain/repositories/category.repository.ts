import { CategoryEntity } from "@domain/entities";

export interface FindCategoriesOptions {
  search?: string;
  page?: number;
  limit?: number;
}

export interface FindCategoriesResult {
  categories: CategoryEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateCategoryData {
  name: string;
}

export interface UpdateCategoryData {
  name?: string;
}

export abstract class CategoryRepository {
  abstract findById(id: number): Promise<CategoryEntity | null>;

  abstract findAll(
    options?: FindCategoriesOptions
  ): Promise<FindCategoriesResult>;

  abstract findByName(name: string): Promise<CategoryEntity | null>;

  abstract create(data: CreateCategoryData): Promise<CategoryEntity>;

  abstract update(
    id: number,
    data: UpdateCategoryData
  ): Promise<CategoryEntity>;

  abstract softDelete(id: number): Promise<void>;
}
