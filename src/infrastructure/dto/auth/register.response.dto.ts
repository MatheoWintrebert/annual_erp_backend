import { UserResponseDto } from "../user";
import { ApiProperty } from "@nestjs/swagger";
import { IsString, ValidateNested } from "class-validator";

export class RegisterResponseDto {
  @ApiProperty({
    description: "Registered user information",
    type: UserResponseDto,
  })
  @ValidateNested()
  user: UserResponseDto;

  @ApiProperty({
    description: "Authentication token",
    type: String,
  })
  @IsString()
  token: string;

  @ApiProperty({
    description: "2FA qrcode",
    type: String,
  })
  @IsString()
  qrCode: string;
}
