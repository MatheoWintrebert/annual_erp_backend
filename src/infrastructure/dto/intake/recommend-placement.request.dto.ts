import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsInt, IsPositive } from "class-validator";

export class RecommendPlacementRequestDto {
  @ApiProperty({
    example: [1, 2],
    description: "The IDs of the products to find placement for",
    type: [Number],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  productIds!: number[];
}
