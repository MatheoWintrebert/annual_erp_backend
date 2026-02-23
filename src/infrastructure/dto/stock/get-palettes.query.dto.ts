import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString } from "class-validator";

export class GetPalettesQueryDto {
  @ApiPropertyOptional({
    example: 5,
    description: "Filter by palettier ID",
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  palettierId?: number;

  @ApiPropertyOptional({
    example: "milk",
    description: "Search by product name",
  })
  @IsOptional()
  @IsString()
  search?: string;
}
