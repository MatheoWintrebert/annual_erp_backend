import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PalettierTypeEntity } from "@domain/entities";

export class PalettierTypeResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: "Refrigerated" })
  name!: string;

  @ApiPropertyOptional({
    example: "Storage for temperature-sensitive products",
    nullable: true,
  })
  description!: string | null;

  @ApiProperty({ example: "2024-01-15T10:30:00.000Z" })
  createdAt!: Date;

  @ApiProperty({ example: "2024-01-20T14:45:00.000Z" })
  updatedAt!: Date;

  static fromEntity(entity: PalettierTypeEntity): PalettierTypeResponseDto {
    const dto = new PalettierTypeResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
