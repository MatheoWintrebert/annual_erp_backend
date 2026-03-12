import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class EnableTwoFactorResponseDto {
  @ApiProperty({
    description: "TOTP secret",
    type: String,
  })
  @IsString()
  secret: string;

  @ApiProperty({
    description: "QR code URL for authenticator app",
    type: String,
  })
  @IsString()
  qrCodeUrl: string;
}
