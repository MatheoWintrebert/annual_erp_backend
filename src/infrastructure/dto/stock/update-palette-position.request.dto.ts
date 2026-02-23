import { ApiProperty } from "@nestjs/swagger";
import { IsInt, Min } from "class-validator";

export class UpdatePalettePositionRequestDto {
  @ApiProperty({
    example: 5,
    description: "ID of the target palettier",
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  palettierId: number;

  @ApiProperty({
    example: 2,
    description: "Position along the width (x-axis), 0-indexed",
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  positionX: number;

  @ApiProperty({
    example: 1,
    description: "Position along the depth (y-axis), 0-indexed",
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  positionY: number;

  @ApiProperty({
    example: 0,
    description: "Position along the height (z-axis), 0-indexed",
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  positionZ: number;
}
