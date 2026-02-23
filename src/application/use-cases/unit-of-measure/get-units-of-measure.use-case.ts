import { Injectable } from "@nestjs/common";
import {
  FindUnitsOfMeasureResult,
  UnitOfMeasureRepository,
} from "@domain/repositories";
import { QueryUseCase } from "@domain/types";

export interface GetUnitsOfMeasureInput {
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class GetUnitsOfMeasureUseCase implements QueryUseCase<
  GetUnitsOfMeasureInput,
  FindUnitsOfMeasureResult
> {
  constructor(
    private readonly unitOfMeasureRepository: UnitOfMeasureRepository
  ) {}

  async execute(
    input: GetUnitsOfMeasureInput
  ): Promise<FindUnitsOfMeasureResult> {
    return this.unitOfMeasureRepository.findAll({
      search: input.search,
      page: input.page ?? 1,
      limit: input.limit ?? 20,
    });
  }
}
