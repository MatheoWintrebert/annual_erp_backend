import { IRegisterInput } from "@application/use-cases";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class RegisterRequestDto implements IRegisterInput {
  @ApiProperty({
    description: "Code",
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  code: string;

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
}
