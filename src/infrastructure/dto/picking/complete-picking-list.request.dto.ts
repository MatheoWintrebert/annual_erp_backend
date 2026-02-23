import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";

export class CompletePickingListItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  pickingListItemId!: number;

  @ApiProperty({ example: 12 })
  @IsInt()
  @Min(1)
  paletteLotId!: number;

  @ApiProperty({ example: "picked", enum: ["picked", "skipped"] })
  @IsString()
  @IsIn(["picked", "skipped"])
  status!: "picked" | "skipped";

  @ApiProperty({ example: 20 })
  @IsInt()
  @Min(0)
  pickedQuantity!: number;
}

export class CompletePickingListRequestDto {
  @ApiProperty({ type: [CompletePickingListItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CompletePickingListItemDto)
  items!: CompletePickingListItemDto[];
}
