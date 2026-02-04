import { CompanySettingsEntity } from "@domain/entities";

export interface CreateCompanySettingsData {
  name: string;
  language?: string;
  timezone?: string;
  brandingLogoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
}

export interface UpdateCompanySettingsData {
  name?: string;
  language?: string;
  timezone?: string;
  brandingLogoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
}

export abstract class CompanySettingsRepository {
  abstract findFirst(): Promise<CompanySettingsEntity | null>;
  abstract create(
    data: CreateCompanySettingsData
  ): Promise<CompanySettingsEntity>;
  abstract update(
    id: number,
    data: UpdateCompanySettingsData
  ): Promise<CompanySettingsEntity>;
}
