import {
  IsArray,
  IsInt,
  Min,
  ArrayMinSize,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class CreatePickingListItemDto {
  @ApiProperty({ example: 1, description: "Product ID" })
  @IsInt()
  @Min(1)
  productId!: number;

  @ApiProperty({ example: 20, description: "Requested quantity to pick" })
  @IsInt()
  @Min(1)
  requestedQuantity!: number;
}

export class CreatePickingListRequestDto {
  @ApiProperty({
    type: [CreatePickingListItemDto],
    description: "Items to include in the picking list",
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePickingListItemDto)
  items!: CreatePickingListItemDto[];
}
