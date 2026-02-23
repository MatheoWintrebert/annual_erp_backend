import { ApiProperty } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsInt, IsPositive, Min } from "class-validator";

export class CreateZonePriorityConfigDto {
  @ApiProperty({
    example: 1,
    description: "Priority level (lower number = higher priority)",
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  priorityLevel!: number;

  @ApiProperty({
    type: [Number],
    example: [1, 2, 3],
    description: "Array of palettier IDs to assign to this zone",
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @IsPositive({ each: true })
  palettierIds!: number[];
}
