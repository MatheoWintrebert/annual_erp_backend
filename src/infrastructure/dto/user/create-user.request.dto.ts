import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

export class CreateUserRequestDto {
  @ApiProperty({
    description: "User email",
    type: String,
  })
  @IsEmail()
  email: string;
}
