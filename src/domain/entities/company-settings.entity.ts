import { ICompanySettings } from "@domain/types";

export class CompanySettingsEntity implements ICompanySettings {
  public readonly id: number;
  public readonly name: string;
  public readonly language: string;
  public readonly timezone: string;
  public readonly brandingLogoUrl: string | null;
  public readonly primaryColor: string | null;
  public readonly secondaryColor: string | null;
  public readonly contactEmail: string | null;
  public readonly contactPhone: string | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(params: ICompanySettings) {
    this.id = params.id;
    this.name = params.name;
    this.language = params.language;
    this.timezone = params.timezone;
    this.brandingLogoUrl = params.brandingLogoUrl;
    this.primaryColor = params.primaryColor;
    this.secondaryColor = params.secondaryColor;
    this.contactEmail = params.contactEmail;
    this.contactPhone = params.contactPhone;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }
}
