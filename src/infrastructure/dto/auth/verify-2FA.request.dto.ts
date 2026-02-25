import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class VerifyTwoFactorRequestDto {
  @ApiProperty({
    description: "TOTP code from authenticator",
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}
