import { ApiProperty } from "@nestjs/swagger";
import { CompanySettingsEntity } from "@domain/entities";

export class CompanySettingsResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: "My Company" })
  name!: string;

  @ApiProperty({ example: "fr" })
  language!: string;

  @ApiProperty({ example: "Europe/Paris" })
  timezone!: string;

  @ApiProperty({ example: "https://example.com/logo.png", nullable: true })
  brandingLogoUrl!: string | null;

  @ApiProperty({ example: "#3B82F6", nullable: true })
  primaryColor!: string | null;

  @ApiProperty({ example: "#10B981", nullable: true })
  secondaryColor!: string | null;

  @ApiProperty({ example: "contact@company.com", nullable: true })
  contactEmail!: string | null;

  @ApiProperty({ example: "+33 1 23 45 67 89", nullable: true })
  contactPhone!: string | null;

  @ApiProperty({ example: "2024-01-15T10:30:00.000Z" })
  createdAt!: Date;

  @ApiProperty({ example: "2024-01-20T14:45:00.000Z" })
  updatedAt!: Date;

  static fromEntity(entity: CompanySettingsEntity): CompanySettingsResponseDto {
    const dto = new CompanySettingsResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.language = entity.language;
    dto.timezone = entity.timezone;
    dto.brandingLogoUrl = entity.brandingLogoUrl;
    dto.primaryColor = entity.primaryColor;
    dto.secondaryColor = entity.secondaryColor;
    dto.contactEmail = entity.contactEmail;
    dto.contactPhone = entity.contactPhone;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
