import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdatePalettierTypeRequestDto {
  @ApiPropertyOptional({
    example: "Refrigerated",
    description: "Name of the palettier type",
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    example: "Storage for temperature-sensitive products",
    description: "Description of the palettier type. Set to null to remove.",
    maxLength: 500,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string | null;
}
