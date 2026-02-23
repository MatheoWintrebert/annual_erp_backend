import { ApiProperty } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsInt, IsPositive } from "class-validator";

export class LinkProductsRequestDto {
  @ApiProperty({
    type: [Number],
    example: [1, 2, 3],
    description: "Array of product IDs to link to the rule",
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @IsPositive({ each: true })
  productIds!: number[];
}
