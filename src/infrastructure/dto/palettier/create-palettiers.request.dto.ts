import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, ValidateNested } from "class-validator";
import { CreatePalettierItemDto } from "./create-palettier-item.dto";

export class CreatePalettiersRequestDto {
  @ApiProperty({
    type: [CreatePalettierItemDto],
    description: "Array of palettiers to create",
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePalettierItemDto)
  palettiers!: CreatePalettierItemDto[];
}
