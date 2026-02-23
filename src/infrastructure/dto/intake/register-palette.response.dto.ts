import { ApiProperty } from "@nestjs/swagger";
import type { RegisterPaletteOutput } from "@application/use-cases";

export class RegisterPaletteResponseItemDto {
  @ApiProperty({ example: 1 })
  lotId!: number;

  @ApiProperty({ example: "LOT-20260209-0001" })
  lotReference!: string;

  @ApiProperty({ example: 1 })
  productId!: number;

  @ApiProperty({ example: "Widget A" })
  productName!: string;

  @ApiProperty({ example: 100 })
  quantity!: number;

  @ApiProperty({ example: "2026-12-31T00:00:00.000Z", nullable: true })
  expiryDate!: Date | null;
}

export class RegisterPaletteResponseDto {
  @ApiProperty({ example: 1 })
  paletteId!: number;

  @ApiProperty({ example: 1 })
  palettierId!: number;

  @ApiProperty({ example: "Cold Storage A" })
  palettierName!: string;

  @ApiProperty({ example: 0 })
  positionX!: number;

  @ApiProperty({ example: 0 })
  positionY!: number;

  @ApiProperty({ example: 0 })
  positionZ!: number;

  @ApiProperty({ type: [RegisterPaletteResponseItemDto] })
  items!: RegisterPaletteResponseItemDto[];

  @ApiProperty({ example: "2026-02-09T10:30:00.000Z" })
  createdAt!: Date;

  static fromOutput(output: RegisterPaletteOutput): RegisterPaletteResponseDto {
    const dto = new RegisterPaletteResponseDto();
    dto.paletteId = output.palette.id;
    dto.palettierId = output.palette.palettierId;
    dto.palettierName = output.palettierName;
    dto.positionX = output.palette.positionX;
    dto.positionY = output.palette.positionY;
    dto.positionZ = output.palette.positionZ;
    dto.createdAt = output.palette.createdAt;

    dto.items = output.items.map((item) => {
      const itemDto = new RegisterPaletteResponseItemDto();
      itemDto.lotId = item.lot.id;
      itemDto.lotReference = item.lot.reference;
      itemDto.productId = item.lot.productId;
      itemDto.productName = item.productName;
      itemDto.quantity = item.paletteLot.quantity;
      itemDto.expiryDate = item.lot.expirationDate;
      return itemDto;
    });

    return dto;
  }
}
