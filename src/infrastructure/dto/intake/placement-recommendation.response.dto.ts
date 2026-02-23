import { ApiProperty } from "@nestjs/swagger";
import { PlacementRecommendation } from "@domain/types";

export class PlacementRecommendationResponseDto {
  @ApiProperty({ example: 1 })
  palettierId!: number;

  @ApiProperty({ example: "Cold Storage A" })
  palettierName!: string;

  @ApiProperty({ example: 0 })
  positionX!: number;

  @ApiProperty({ example: 0 })
  positionY!: number;

  @ApiProperty({ example: 0 })
  positionZ!: number;

  @ApiProperty({ example: "Cold storage — space available" })
  reasoning!: string;

  static fromRecommendation(
    rec: PlacementRecommendation
  ): PlacementRecommendationResponseDto {
    const dto = new PlacementRecommendationResponseDto();
    dto.palettierId = rec.palettierId;
    dto.palettierName = rec.palettierName;
    dto.positionX = rec.positionX;
    dto.positionY = rec.positionY;
    dto.positionZ = rec.positionZ;
    dto.reasoning = rec.reasoning;
    return dto;
  }
}
