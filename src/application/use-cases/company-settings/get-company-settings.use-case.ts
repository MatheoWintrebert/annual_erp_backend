import { Injectable } from "@nestjs/common";
import { CompanySettingsEntity } from "@domain/entities";
import { NotFoundError } from "@domain/errors";
import { CompanySettingsRepository } from "@domain/repositories";
import { QueryUseCase } from "@domain/types";

@Injectable()
export class GetCompanySettingsUseCase implements QueryUseCase<
  void,
  CompanySettingsEntity
> {
  constructor(
    private readonly companySettingsRepository: CompanySettingsRepository
  ) {}

  async execute(): Promise<CompanySettingsEntity> {
    const settings = await this.companySettingsRepository.findFirst();

    if (!settings) {
      throw new NotFoundError("CompanySettings");
    }

    return settings;
  }
}
