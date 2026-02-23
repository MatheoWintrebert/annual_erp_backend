import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateUnitOfMeasureRequestDto {
  @ApiPropertyOptional({
    example: "Liter",
    description: "Unit of measure name",
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({
    example: "L",
    description: "Abbreviation for the unit of measure",
    maxLength: 10,
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  abbreviation?: string;
}
