import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsPositive, Min } from "class-validator";

export class CreateProductIncompatibilityConfigDto {
  @ApiProperty({
    example: 1,
    description: "ID of the incompatibility category",
  })
  @IsInt()
  @IsPositive()
  categoryId!: number;

  @ApiProperty({
    example: 3,
    description:
      "Minimum distance (in palettier slots) required between incompatible products",
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  minimumDistance!: number;
}
