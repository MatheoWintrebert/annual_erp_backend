import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateUnitOfMeasureRequestDto {
  @ApiProperty({
    example: "Kilogram",
    description: "Unique unit of measure name",
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name!: string;

  @ApiProperty({
    example: "kg",
    description: "Unique abbreviation for the unit of measure",
    maxLength: 10,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  abbreviation!: string;
}
