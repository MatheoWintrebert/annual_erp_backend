import { Injectable } from "@nestjs/common";
import { CompanySettingsEntity } from "@domain/entities";
import {
  CompanySettingsRepository,
  UpdateCompanySettingsData,
} from "@domain/repositories";
import { QueryUseCase } from "@domain/types";

const DEFAULT_COMPANY_NAME = "My Company";

export interface UpdateCompanySettingsInput {
  data: UpdateCompanySettingsData;
}

@Injectable()
export class UpdateCompanySettingsUseCase implements QueryUseCase<
  UpdateCompanySettingsInput,
  CompanySettingsEntity
> {
  constructor(
    private readonly companySettingsRepository: CompanySettingsRepository
  ) {}

  async execute(
    input: UpdateCompanySettingsInput
  ): Promise<CompanySettingsEntity> {
    const existing = await this.companySettingsRepository.findFirst();

    if (!existing) {
      return this.companySettingsRepository.create({
        name: input.data.name ?? DEFAULT_COMPANY_NAME,
        language: input.data.language,
        timezone: input.data.timezone,
        brandingLogoUrl: input.data.brandingLogoUrl,
        primaryColor: input.data.primaryColor,
        secondaryColor: input.data.secondaryColor,
        contactEmail: input.data.contactEmail,
        contactPhone: input.data.contactPhone,
      });
    }

    return this.companySettingsRepository.update(existing.id, input.data);
  }
}
