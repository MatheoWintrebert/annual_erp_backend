import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsInt, IsPositive, Min } from "class-validator";

export class CheckPlacementViolationsRequestDto {
  @ApiProperty({
    example: [1, 5],
    description: "Array of product IDs to check for placement violations",
    type: [Number],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  productIds: number[];

  @ApiProperty({
    example: 3,
    description: "ID of the palettier to check violations against",
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  palettierId: number;
}
