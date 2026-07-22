import { IsArray, IsInt } from "class-validator";
import { Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class AvailableStockQueryDto {
  @ApiProperty({
    example: [1, 2, 3],
    description: "Comma-separated or repeated product IDs",
  })
  @IsArray()
  @IsInt({ each: true })
  @Transform(({ value }: { value: unknown }) => {
    const toInt = (v: unknown): number => parseInt(String(v).trim(), 10);
    if (typeof value === "string") return value.split(",").map(toInt);
    if (Array.isArray(value)) return (value as unknown[]).map(toInt);
    return [toInt(value)];
  })
  productIds!: number[];
}
