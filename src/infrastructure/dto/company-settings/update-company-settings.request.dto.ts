import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from "class-validator";

export class UpdateCompanySettingsRequestDto {
  @ApiPropertyOptional({
    example: "My Company",
    description: "Company name",
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    example: "fr",
    description: "Language code (e.g., fr, en)",
    maxLength: 10,
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  language?: string;

  @ApiPropertyOptional({
    example: "Europe/Paris",
    description: "Timezone identifier",
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  timezone?: string;

  @ApiPropertyOptional({
    example: "https://example.com/logo.png",
    description: "URL to the company logo",
    nullable: true,
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  brandingLogoUrl?: string | null;

  @ApiPropertyOptional({
    example: "#3B82F6",
    description: "Primary brand color (hex)",
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  primaryColor?: string | null;

  @ApiPropertyOptional({
    example: "#10B981",
    description: "Secondary brand color (hex)",
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  secondaryColor?: string | null;

  @ApiPropertyOptional({
    example: "contact@company.com",
    description: "Contact email address",
    nullable: true,
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  contactEmail?: string | null;

  @ApiPropertyOptional({
    example: "+33 1 23 45 67 89",
    description: "Contact phone number",
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  contactPhone?: string | null;
}
