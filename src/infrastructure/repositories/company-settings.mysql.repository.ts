import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CompanySettingsEntity } from "@domain/entities";
import {
  CompanySettingsRepository,
  CreateCompanySettingsData,
  UpdateCompanySettingsData,
} from "@domain/repositories";
import { CompanySettingsTypeormEntity } from "@infrastructure/entities";

@Injectable()
export class CompanySettingsMysqlRepository implements CompanySettingsRepository {
  constructor(
    @InjectRepository(CompanySettingsTypeormEntity)
    private readonly repository: Repository<CompanySettingsTypeormEntity>
  ) {}

  async findFirst(): Promise<CompanySettingsEntity | null> {
    const entity = await this.repository.findOne({
      where: {},
      order: { id: "ASC" },
    });

    if (!entity) {
      return null;
    }

    return this.toDomainEntity(entity);
  }

  async create(
    data: CreateCompanySettingsData
  ): Promise<CompanySettingsEntity> {
    const entity = this.repository.create(data);
    const saved = await this.repository.save(entity);

    return this.toDomainEntity(saved);
  }

  async update(
    id: number,
    data: UpdateCompanySettingsData
  ): Promise<CompanySettingsEntity> {
    await this.repository.update(id, data);

    const updated = await this.repository.findOneOrFail({ where: { id } });

    return this.toDomainEntity(updated);
  }

  private toDomainEntity(
    entity: CompanySettingsTypeormEntity
  ): CompanySettingsEntity {
    return new CompanySettingsEntity({
      id: entity.id,
      name: entity.name,
      language: entity.language,
      timezone: entity.timezone,
      brandingLogoUrl: entity.brandingLogoUrl,
      primaryColor: entity.primaryColor,
      secondaryColor: entity.secondaryColor,
      contactEmail: entity.contactEmail,
      contactPhone: entity.contactPhone,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
