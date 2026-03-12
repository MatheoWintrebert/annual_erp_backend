import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class LoginResponseDto {
  @ApiProperty({
    description: "Authentication token",
    type: String,
  })
  @IsString()
  token: string;
}
