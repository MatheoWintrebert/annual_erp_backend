import { IsArray, IsInt } from "class-validator";
import { Transform, Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class AvailableStockQueryDto {
  @ApiProperty({
    example: [1, 2, 3],
    description: "Comma-separated or repeated product IDs",
  })
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string"
      ? value.split(",").map(Number)
      : Array.isArray(value)
        ? (value as unknown[]).map(Number)
        : [Number(value)],
  )
  productIds!: number[];
}
