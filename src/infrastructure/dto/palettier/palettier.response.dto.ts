import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PalettierEntity } from "@domain/entities";

export class PalettierResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: "Rack A1" })
  name!: string;

  @ApiPropertyOptional({ example: 1, nullable: true })
  palettierTypeId!: number | null;

  @ApiProperty({ example: 5, description: "Number of slots along the width" })
  width!: number;

  @ApiProperty({ example: 3, description: "Number of slots along the depth" })
  depth!: number;

  @ApiProperty({ example: 4, description: "Number of slots along the height" })
  height!: number;

  @ApiProperty({
    example: 60,
    description: "Total capacity (width × depth × height)",
  })
  totalCapacity!: number;

  @ApiProperty({ example: "2024-01-15T10:30:00.000Z" })
  createdAt!: Date;

  @ApiProperty({ example: "2024-01-20T14:45:00.000Z" })
  updatedAt!: Date;

  static fromEntity(entity: PalettierEntity): PalettierResponseDto {
    const dto = new PalettierResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.palettierTypeId = entity.palettierTypeId;
    dto.width = entity.width;
    dto.depth = entity.depth;
    dto.height = entity.height;
    dto.totalCapacity = entity.totalCapacity;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
