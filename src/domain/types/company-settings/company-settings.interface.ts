export interface ICompanySettings {
  id: number;
  name: string;
  language: string;
  timezone: string;
  brandingLogoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  createdAt: Date;
  updatedAt: Date;
}
