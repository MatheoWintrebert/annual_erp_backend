import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class FullLoginRequestDto {
  @ApiProperty({
    description: "User email address",
    type: String,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: "User password",
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: "code password",
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}
