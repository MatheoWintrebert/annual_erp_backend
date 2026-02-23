import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import type { PlacementResult, ConflictGroup } from "@domain/types";
import { PlacementRecommendationResponseDto } from "./placement-recommendation.response.dto";

export class ConflictGroupResponseDto {
  @ApiProperty({ example: [1, 3], type: [Number] })
  productIds!: number[];

  @ApiProperty({ example: ["Product A", "Product C"], type: [String] })
  productNames!: string[];

  @ApiPropertyOptional({ type: PlacementRecommendationResponseDto })
  recommendation!: PlacementRecommendationResponseDto | null;

  @ApiProperty({ example: "Cold storage — space available" })
  reasoning!: string;

  static fromGroup(group: ConflictGroup): ConflictGroupResponseDto {
    const dto = new ConflictGroupResponseDto();
    dto.productIds = group.productIds;
    dto.productNames = group.productNames;
    dto.recommendation = group.recommendation
      ? PlacementRecommendationResponseDto.fromRecommendation(
          group.recommendation
        )
      : null;
    dto.reasoning = group.reasoning;
    return dto;
  }
}

export class PlacementResultResponseDto {
  @ApiProperty({
    enum: ["resolved", "conflict"],
    example: "resolved",
  })
  status!: "resolved" | "conflict";

  @ApiPropertyOptional({ type: PlacementRecommendationResponseDto })
  recommendation?: PlacementRecommendationResponseDto;

  @ApiPropertyOptional({
    example:
      "Product A needs cold storage, Product B needs dry storage",
  })
  conflictExplanation?: string;

  @ApiPropertyOptional({ type: [ConflictGroupResponseDto] })
  groups?: ConflictGroupResponseDto[];

  static fromResult(result: PlacementResult): PlacementResultResponseDto {
    const dto = new PlacementResultResponseDto();
    dto.status = result.status;

    if (result.status === "resolved") {
      dto.recommendation =
        PlacementRecommendationResponseDto.fromRecommendation(
          result.recommendation
        );
    } else {
      dto.conflictExplanation = result.conflictExplanation;
      dto.groups = result.groups.map((g) =>
        ConflictGroupResponseDto.fromGroup(g)
      );
    }

    return dto;
  }
}
