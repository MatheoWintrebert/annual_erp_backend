import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class PostUserResquestDto {
  @ApiProperty({
    description: "User last name",
    type: String,
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: "User first name",
    type: String,
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: "User email",
    type: String,
  })
  @IsString()
  email: string;
}
