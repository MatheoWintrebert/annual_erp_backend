import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class DisableTwoFactorResponseDto {
  @ApiProperty({
    description: "Success message",
    type: String,
  })
  @IsString()
  message: string;
}

export class RegenerateBackupCodesResponseDto {
  @ApiProperty({
    description: "New backup codes",
    type: [String],
  })
  backupCodes: string[];
}
