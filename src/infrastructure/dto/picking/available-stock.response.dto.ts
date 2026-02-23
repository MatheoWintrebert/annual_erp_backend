import { ApiProperty } from "@nestjs/swagger";
import type { ProductStock } from "@domain/types";

export class AvailableStockResponseDto {
  @ApiProperty({ example: 1 })
  productId!: number;

  @ApiProperty({ example: "Whole Milk" })
  productName!: string;

  @ApiProperty({ example: "WM-001" })
  productReference!: string;

  @ApiProperty({ example: 150 })
  availableQuantity!: number;

  @ApiProperty({ example: "L" })
  unitOfMeasureName!: string;

  static fromDomain(stock: ProductStock): AvailableStockResponseDto {
    const dto = new AvailableStockResponseDto();
    dto.productId = stock.productId;
    dto.productName = stock.productName;
    dto.productReference = stock.productReference;
    dto.availableQuantity = stock.availableQuantity;
    dto.unitOfMeasureName = stock.unitOfMeasureName;
    return dto;
  }
}
