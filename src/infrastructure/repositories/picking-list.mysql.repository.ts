import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PickingListEntity, PickingListItemEntity } from "@domain/entities";
import { PickingListRepository } from "@domain/repositories";
import {
  CreatePickingListInput,
  PickingListItemStatus,
  PickingListStatus,
} from "@domain/types";
import {
  PickingListTypeormEntity,
  PickingListItemTypeormEntity,
} from "@infrastructure/entities";

@Injectable()
export class PickingListMysqlRepository implements PickingListRepository {
  constructor(
    @InjectRepository(PickingListTypeormEntity)
    private readonly pickingListRepo: Repository<PickingListTypeormEntity>
  ) {}

  async create(input: CreatePickingListInput): Promise<PickingListEntity> {
    const entity = this.pickingListRepo.create({
      status: PickingListStatus.CREATED,
      items: input.items.map((item) => {
        const itemEntity = new PickingListItemTypeormEntity();
        itemEntity.productId = item.productId;
        itemEntity.requestedQuantity = item.requestedQuantity;
        return itemEntity;
      }),
    });

    const saved = await this.pickingListRepo.save(entity);

    // Reload with relations to get complete data
    const loaded = await this.pickingListRepo.findOne({
      where: { id: saved.id },
      relations: ["items", "items.product"],
    });

    if (!loaded) {
      throw new Error(
        `Failed to load newly created picking list ${String(saved.id)}`
      );
    }

    return this.toDomain(loaded);
  }

  async findById(id: number): Promise<PickingListEntity | null> {
    const entity = await this.pickingListRepo.findOne({
      where: { id },
      relations: ["items", "items.product"],
    });

    if (!entity) {
      return null;
    }

    return this.toDomain(entity);
  }

  async updateStatus(id: number, status: PickingListStatus): Promise<void> {
    await this.pickingListRepo.update(id, { status });
  }

  async updateItems(
    pickingListId: number,
    items: {
      id: number;
      status: PickingListItemStatus;
      pickedQuantity: number | null;
    }[]
  ): Promise<void> {
    const itemRepo = this.pickingListRepo.manager.getRepository(
      PickingListItemTypeormEntity
    );
    for (const item of items) {
      await itemRepo.update(
        { id: item.id, pickingListId },
        { status: item.status, pickedQuantity: item.pickedQuantity }
      );
    }
  }

  private toDomain(entity: PickingListTypeormEntity): PickingListEntity {
    return new PickingListEntity({
      id: entity.id,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      items: entity.items.map(
        (item) =>
          new PickingListItemEntity({
            id: item.id,
            pickingListId: item.pickingListId,
            productId: item.productId,
            productName: item.product.name,
            requestedQuantity: item.requestedQuantity,
            pickedQuantity: item.pickedQuantity,
            status: item.status,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          })
      ),
    });
  }
}
