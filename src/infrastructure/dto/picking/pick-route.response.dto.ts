import { ApiProperty } from "@nestjs/swagger";
import { PickRouteItem } from "@domain/types";

export class PickRouteItemResponseDto {
  @ApiProperty({ example: 1 })
  pickingListItemId!: number;

  @ApiProperty({ example: 1 })
  productId!: number;

  @ApiProperty({ example: "Whole Milk" })
  productName!: string;

  @ApiProperty({ example: "WM-001" })
  productReference!: string;

  @ApiProperty({ example: "Cold Storage A" })
  palettierName!: string;

  @ApiProperty({ example: 5 })
  paletteId!: number;

  @ApiProperty({ example: 12 })
  paletteLotId!: number;

  @ApiProperty({ example: 1 })
  positionX!: number;

  @ApiProperty({ example: 2 })
  positionY!: number;

  @ApiProperty({ example: 1 })
  positionZ!: number;

  @ApiProperty({ example: 20 })
  quantityToPick!: number;

  @ApiProperty({ example: "2026-03-01T00:00:00.000Z", nullable: true })
  expiryDate!: string | null;

  @ApiProperty({ example: "LOT-2026-001" })
  lotReference!: string;

  static fromDomain(item: PickRouteItem): PickRouteItemResponseDto {
    const dto = new PickRouteItemResponseDto();
    dto.pickingListItemId = item.pickingListItemId;
    dto.productId = item.productId;
    dto.productName = item.productName;
    dto.productReference = item.productReference;
    dto.palettierName = item.palettierName;
    dto.paletteId = item.paletteId;
    dto.paletteLotId = item.paletteLotId;
    dto.positionX = item.positionX;
    dto.positionY = item.positionY;
    dto.positionZ = item.positionZ;
    dto.quantityToPick = item.quantityToPick;
    dto.expiryDate = item.expiryDate?.toISOString() ?? null;
    dto.lotReference = item.lotReference;
    return dto;
  }
}
