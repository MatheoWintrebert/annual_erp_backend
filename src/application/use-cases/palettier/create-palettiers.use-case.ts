import { Injectable } from "@nestjs/common";
import { DataSource, EntityManager } from "typeorm";
import { PalettierEntity } from "@domain/entities";
import { NotFoundError, ValidationError } from "@domain/errors";
import {
  CreatePalettierData,
  PalettierRepository,
  PalettierTypeRepository,
} from "@domain/repositories";
import { ErrorCode, QueryUseCase } from "@domain/types";

export interface CreatePalettierItemInput {
  name: string;
  typeId?: number;
  newTypeName?: string;
  width: number;
  depth: number;
  height: number;
}

export interface CreatePalettiersInput {
  palettiers: CreatePalettierItemInput[];
}

@Injectable()
export class CreatePalettiersUseCase implements QueryUseCase<
  CreatePalettiersInput,
  PalettierEntity[]
> {
  constructor(
    private readonly palettierRepository: PalettierRepository,
    private readonly palettierTypeRepository: PalettierTypeRepository,
    private readonly dataSource: DataSource
  ) {}

  async execute(input: CreatePalettiersInput): Promise<PalettierEntity[]> {
    this.validateInput(input.palettiers);

    return this.dataSource.transaction(async (transactionManager) => {
      const newTypeCache = new Map<string, number>();
      const palettierDataList: CreatePalettierData[] = [];

      for (const item of input.palettiers) {
        const typeId = await this.resolveTypeId(
          item,
          newTypeCache,
          transactionManager
        );

        palettierDataList.push({
          name: item.name,
          palettierTypeId: typeId,
          width: item.width,
          depth: item.depth,
          height: item.height,
        });
      }

      return this.palettierRepository.createMany(
        palettierDataList,
        transactionManager
      );
    });
  }

  private validateInput(palettiers: CreatePalettierItemInput[]): void {
    const invalidItems = palettiers
      .map((item, index) => ({ item, index }))
      .filter(
        ({ item }) =>
          item.typeId === undefined && item.newTypeName === undefined
      );

    if (invalidItems.length > 0) {
      throw new ValidationError(
        "Each palettier must have either typeId or newTypeName",
        {
          code: ErrorCode.DTO_VALIDATION_FAILED,
          details: {
            invalidIndices: invalidItems.map(({ index }) => index),
          },
        }
      );
    }

    const bothProvidedItems = palettiers
      .map((item, index) => ({ item, index }))
      .filter(
        ({ item }) =>
          item.typeId !== undefined && item.newTypeName !== undefined
      );

    if (bothProvidedItems.length > 0) {
      throw new ValidationError(
        "Each palettier must have either typeId or newTypeName, not both",
        {
          code: ErrorCode.DTO_VALIDATION_FAILED,
          details: {
            invalidIndices: bothProvidedItems.map(({ index }) => index),
          },
        }
      );
    }
  }

  private async resolveTypeId(
    item: CreatePalettierItemInput,
    newTypeCache: Map<string, number>,
    transactionManager: EntityManager
  ): Promise<number | null> {
    if (item.typeId !== undefined) {
      const existingType = await this.palettierTypeRepository.findById(
        item.typeId
      );

      if (!existingType) {
        throw new NotFoundError(
          `Palettier type with ID ${String(item.typeId)}`
        );
      }

      return item.typeId;
    }

    if (item.newTypeName !== undefined) {
      const cachedTypeId = newTypeCache.get(item.newTypeName);
      if (cachedTypeId !== undefined) {
        return cachedTypeId;
      }

      const existingType = await this.palettierTypeRepository.findByName(
        item.newTypeName
      );

      if (existingType) {
        newTypeCache.set(item.newTypeName, existingType.id);
        return existingType.id;
      }

      const newType = await this.palettierTypeRepository.create(
        { name: item.newTypeName },
        transactionManager
      );

      newTypeCache.set(item.newTypeName, newType.id);
      return newType.id;
    }

    return null;
  }
}
