import { ApiProperty } from "@nestjs/swagger";

export class VerifyTwoFactorResponseDto {
  @ApiProperty({
    description: "JWT token for authenticated session",
    type: String,
  })
  token: string;
}
