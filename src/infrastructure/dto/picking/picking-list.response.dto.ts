import { ApiProperty } from "@nestjs/swagger";
import type { PickingListEntity } from "@domain/entities";

export class PickingListItemResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  productId!: number;

  @ApiProperty({ example: "Whole Milk" })
  productName!: string;

  @ApiProperty({ example: 20 })
  requestedQuantity!: number;
}

export class PickingListResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: "created" })
  status!: string;

  @ApiProperty({ type: [PickingListItemResponseDto] })
  items!: PickingListItemResponseDto[];

  @ApiProperty({ example: "2026-02-14T10:30:00.000Z" })
  createdAt!: string;

  static fromDomain(list: PickingListEntity): PickingListResponseDto {
    const dto = new PickingListResponseDto();
    dto.id = list.id;
    dto.status = list.status;
    dto.createdAt = list.createdAt.toISOString();
    dto.items = list.items.map((item) => {
      const itemDto = new PickingListItemResponseDto();
      itemDto.id = item.id;
      itemDto.productId = item.productId;
      itemDto.productName = item.productName ?? "";
      itemDto.requestedQuantity = item.requestedQuantity;
      return itemDto;
    });
    return dto;
  }
}
