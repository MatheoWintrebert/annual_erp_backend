import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class VerifyTwoFactorResponseDto {
  @ApiProperty({
    description: "JWT token for authenticated session",
    type: String,
  })
  token: string;
}
