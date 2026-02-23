import { ApiProperty } from "@nestjs/swagger";
import {
  PickingCompletionResult,
  PickingDiscrepancy,
  StockDeduction,
} from "@domain/types";

export class StockDeductionDto {
  @ApiProperty({ example: 12 })
  paletteLotId!: number;

  @ApiProperty({ example: "Whole Milk" })
  productName!: string;

  @ApiProperty({ example: 20 })
  quantityDeducted!: number;

  @ApiProperty({ example: "Cold Storage A" })
  palettierName!: string;

  @ApiProperty({ example: 1 })
  positionX!: number;

  @ApiProperty({ example: 2 })
  positionY!: number;

  @ApiProperty({ example: 1 })
  positionZ!: number;

  static fromDomain(d: StockDeduction): StockDeductionDto {
    const dto = new StockDeductionDto();
    dto.paletteLotId = d.paletteLotId;
    dto.productName = d.productName;
    dto.quantityDeducted = d.quantityDeducted;
    dto.palettierName = d.palettierName;
    dto.positionX = d.positionX;
    dto.positionY = d.positionY;
    dto.positionZ = d.positionZ;
    return dto;
  }
}

export class PickingDiscrepancyDto {
  @ApiProperty({ example: 1 })
  pickingListItemId!: number;

  @ApiProperty({ example: "Whole Milk" })
  productName!: string;

  @ApiProperty({ example: "Cold Storage A" })
  palettierName!: string;

  @ApiProperty({ example: 1 })
  positionX!: number;

  @ApiProperty({ example: 2 })
  positionY!: number;

  @ApiProperty({ example: 1 })
  positionZ!: number;

  @ApiProperty({ example: "Item skipped — not found at location" })
  reason!: string;

  static fromDomain(d: PickingDiscrepancy): PickingDiscrepancyDto {
    const dto = new PickingDiscrepancyDto();
    dto.pickingListItemId = d.pickingListItemId;
    dto.productName = d.productName;
    dto.palettierName = d.palettierName;
    dto.positionX = d.positionX;
    dto.positionY = d.positionY;
    dto.positionZ = d.positionZ;
    dto.reason = d.reason;
    return dto;
  }
}

export class CompletePickingListResponseDto {
  @ApiProperty({ example: 1 })
  pickingListId!: number;

  @ApiProperty({ example: "completed" })
  status!: string;

  @ApiProperty({ example: 3 })
  totalItemsPicked!: number;

  @ApiProperty({ example: 1 })
  totalItemsSkipped!: number;

  @ApiProperty({ type: [StockDeductionDto] })
  deductions!: StockDeductionDto[];

  @ApiProperty({ type: [PickingDiscrepancyDto] })
  discrepancies!: PickingDiscrepancyDto[];

  static fromDomain(result: PickingCompletionResult): CompletePickingListResponseDto {
    const dto = new CompletePickingListResponseDto();
    dto.pickingListId = result.pickingListId;
    dto.status = result.status;
    dto.totalItemsPicked = result.totalItemsPicked;
    dto.totalItemsSkipped = result.totalItemsSkipped;
    dto.deductions = result.deductions.map((d) => StockDeductionDto.fromDomain(d));
    dto.discrepancies = result.discrepancies.map((d) => PickingDiscrepancyDto.fromDomain(d));
    return dto;
  }
}
