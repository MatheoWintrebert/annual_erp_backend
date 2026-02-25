import { ApiProperty } from "@nestjs/swagger";
import type { PaletteWithDetails } from "@domain/types";

export class PaletteItemDetailResponseDto {
  @ApiProperty({ example: 1 })
  productId!: number;

  @ApiProperty({ example: "Whole Milk" })
  productName!: string;

  @ApiProperty({ example: "WM-001" })
  productReference!: string;

  @ApiProperty({ example: "LOT-2026-0842" })
  lotReference!: string;

  @ApiProperty({ example: 40 })
  quantity!: number;

  @ApiProperty({ example: "2026-03-15T00:00:00.000Z", nullable: true })
  expiryDate!: string | null;

  @ApiProperty({ example: "units" })
  unitOfMeasureName!: string;
}

export class PaletteListItemResponseDto {
  @ApiProperty({ example: 42 })
  id!: number;

  @ApiProperty({ example: 5 })
  palettierId!: number;

  @ApiProperty({ example: "Cold Storage A" })
  palettierName!: string;

  @ApiProperty({ example: 0 })
  positionX!: number;

  @ApiProperty({ example: 0 })
  positionY!: number;

  @ApiProperty({ example: 0 })
  positionZ!: number;

  @ApiProperty({ example: "2026-02-10T08:30:00.000Z" })
  receivedAt!: string;

  @ApiProperty({ type: [PaletteItemDetailResponseDto] })
  items!: PaletteItemDetailResponseDto[];

  static fromDomain(palette: PaletteWithDetails): PaletteListItemResponseDto {
    const dto = new PaletteListItemResponseDto();
    dto.id = palette.id;
    dto.palettierId = palette.palettierId;
    dto.palettierName = palette.palettierName;
    dto.positionX = palette.positionX;
    dto.positionY = palette.positionY;
    dto.positionZ = palette.positionZ;
    dto.receivedAt = palette.createdAt.toISOString();

    dto.items = palette.items.map((item) => {
      const itemDto = new PaletteItemDetailResponseDto();
      itemDto.productId = item.productId;
      itemDto.productName = item.productName;
      itemDto.productReference = item.productReference;
      itemDto.lotReference = item.lotReference;
      itemDto.quantity = item.quantity;
      itemDto.expiryDate = item.expiryDate
        ? item.expiryDate.toISOString()
        : null;
      itemDto.unitOfMeasureName = item.unitOfMeasureName;
      return itemDto;
    });

    return dto;
  }
}
