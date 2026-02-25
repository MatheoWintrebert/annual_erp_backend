import { IShortUser } from "@domain/types";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsEmail, IsInt, IsString } from "class-validator";

export class UserResponseDto implements IShortUser {
  @ApiPropertyOptional({
    description: "User unique identifier",
    type: Number,
  })
  @IsInt()
  id: number;

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
    description: "User email address",
    type: String,
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "Indicates if the user is active",
    type: Boolean,
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: "Timestamp when the user was created",
    type: Date,
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: "Timestamp when the user was last updated",
    type: Date,
  })
  @IsDate()
  updatedAt: Date;
}
