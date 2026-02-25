import { IUser } from "@domain/types";
import { UserResponseDto } from "../user";
import { ApiProperty } from "@nestjs/swagger";
import { IsString, ValidateNested } from "class-validator";

export class LoginResponseDto {
  @ApiProperty({
    description: "Authentication token",
    type: String,
  })
  @IsString()
  token: string;
}
