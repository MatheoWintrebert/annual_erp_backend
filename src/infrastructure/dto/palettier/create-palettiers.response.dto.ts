import { ApiProperty } from "@nestjs/swagger";
import { PalettierEntity } from "@domain/entities";
import { PalettierResponseDto } from "./palettier.response.dto";

export class CreatePalettiersResponseDto {
  @ApiProperty({
    type: [PalettierResponseDto],
    description: "Array of created palettiers",
  })
  palettiers!: PalettierResponseDto[];

  static fromEntities(
    entities: PalettierEntity[]
  ): CreatePalettiersResponseDto {
    const dto = new CreatePalettiersResponseDto();
    dto.palettiers = entities.map((entity) =>
      PalettierResponseDto.fromEntity(entity)
    );
    return dto;
  }
}
