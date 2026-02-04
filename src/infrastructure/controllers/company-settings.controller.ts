import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Put,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
  GetCompanySettingsUseCase,
  UpdateCompanySettingsUseCase,
} from "@application/use-cases";
import {
  CompanySettingsResponseDto,
  UpdateCompanySettingsRequestDto,
} from "@infrastructure/dto";
import { HttpErrorDto } from "@infrastructure/dto/general";
import { createSwaggerErrorCodesDescription, ErrorCode } from "@domain/types";

@ApiTags("Company Settings")
@Controller({ path: "company-settings" })
export class CompanySettingsController {
  constructor(
    private readonly getCompanySettingsUseCase: GetCompanySettingsUseCase,
    private readonly updateCompanySettingsUseCase: UpdateCompanySettingsUseCase
  ) {}

  @Get()
  @ApiOperation({ summary: "Get company settings" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Company settings retrieved successfully",
    type: CompanySettingsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: createSwaggerErrorCodesDescription([
      ErrorCode.RESOURCE_NOT_FOUND,
    ]),
    type: HttpErrorDto,
  })
  async getCompanySettings(): Promise<CompanySettingsResponseDto> {
    const settings = await this.getCompanySettingsUseCase.execute();
    return CompanySettingsResponseDto.fromEntity(settings);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Create or update company settings",
    description:
      "Creates company settings if they don't exist, otherwise updates them (upsert).",
  })
  @ApiBody({ type: UpdateCompanySettingsRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Company settings created or updated successfully",
    type: CompanySettingsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: createSwaggerErrorCodesDescription([
      ErrorCode.DTO_VALIDATION_FAILED,
    ]),
    type: HttpErrorDto,
  })
  async updateCompanySettings(
    @Body() dto: UpdateCompanySettingsRequestDto
  ): Promise<CompanySettingsResponseDto> {
    const settings = await this.updateCompanySettingsUseCase.execute({
      data: dto,
    });
    return CompanySettingsResponseDto.fromEntity(settings);
  }
}
