import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  ValidateNested,
} from "class-validator";
import { CreateRuleItemDto } from "./create-rule-item.dto";

export class CreateRuleBatchRequestDto {
  @ApiProperty({
    type: [CreateRuleItemDto],
    description: "Array of rules to create (max 50)",
    minItems: 1,
    maxItems: 50,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CreateRuleItemDto)
  rules!: CreateRuleItemDto[];
}
