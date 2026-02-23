import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  CreateRulesBatchUseCase,
  DeleteRuleUseCase,
  GetActiveViolationsUseCase,
  GetRuleByIdUseCase,
  GetRulesUseCase,
  LinkProductsToRuleUseCase,
  UnlinkProductsFromRuleUseCase,
  UpdateRuleUseCase,
} from "@application/use-cases";
import {
  CreateRuleBatchRequestDto,
  GetRulesQueryDto,
  LinkProductsRequestDto,
  RuleBatchResponseDto,
  RuleResponseDto,
  RuleViolationResponseDto,
  RulesListResponseDto,
  UpdateRuleRequestDto,
  UpdateRuleResponseDto,
} from "@infrastructure/dto";
import { HttpErrorDto } from "@infrastructure/dto/general";
import { createSwaggerErrorCodesDescription, ErrorCode } from "@domain/types";

@ApiTags("Rules")
@Controller({ path: "rules" })
export class RuleController {
  constructor(
    private readonly createRulesBatchUseCase: CreateRulesBatchUseCase,
    private readonly getRulesUseCase: GetRulesUseCase,
    private readonly getRuleByIdUseCase: GetRuleByIdUseCase,
    private readonly updateRuleUseCase: UpdateRuleUseCase,
    private readonly deleteRuleUseCase: DeleteRuleUseCase,
    private readonly linkProductsToRuleUseCase: LinkProductsToRuleUseCase,
    private readonly unlinkProductsFromRuleUseCase: UnlinkProductsFromRuleUseCase,
    private readonly getActiveViolationsUseCase: GetActiveViolationsUseCase
  ) {}

  @Post("batch")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create multiple rules in batch",
    description:
      "Creates one or more rules in a single atomic operation (max 50 rules). " +
      "Each rule must have the appropriate config for its type. " +
      "If any rule fails validation, the entire operation is rolled back.",
  })
  @ApiBody({ type: CreateRuleBatchRequestDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Rules created successfully",
    type: RuleBatchResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: createSwaggerErrorCodesDescription([
      ErrorCode.DTO_VALIDATION_FAILED,
    ]),
    type: HttpErrorDto,
  })
  async createBatch(
    @Body() dto: CreateRuleBatchRequestDto
  ): Promise<RuleBatchResponseDto> {
    const rules = await this.createRulesBatchUseCase.execute({
      rules: dto.rules.map((rule) => ({
        name: rule.name,
        description: rule.description,
        type: rule.type,
        isActive: rule.isActive,
        productIds: rule.productIds,
        zonePriorityConfig: rule.zonePriorityConfig,
        productIncompatibilityConfig: rule.productIncompatibilityConfig,
        storageConditionConfig: rule.storageConditionConfig,
        placementConstraintConfig: rule.placementConstraintConfig,
      })),
    });

    return RuleBatchResponseDto.fromRulesWithConfig(rules);
  }

  @Get("violations")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Get all active rule violations",
    description:
      "Scans all active rules and returns any violations found on existing palettes.",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "List of active violations",
    type: [RuleViolationResponseDto],
  })
  async getActiveViolations(): Promise<RuleViolationResponseDto[]> {
    const violations = await this.getActiveViolationsUseCase.execute();
    return violations.map((v) => RuleViolationResponseDto.fromDomain(v));
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Get all rules",
    description:
      "Retrieves a paginated list of rules. By default, only active rules are returned.",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "List of rules retrieved successfully",
    type: RulesListResponseDto,
  })
  async getRules(
    @Query() query: GetRulesQueryDto
  ): Promise<RulesListResponseDto> {
    const result = await this.getRulesUseCase.execute({
      type: query.type,
      isActive: query.isActive,
      includeProducts: query.includeProducts,
      page: query.page,
      limit: query.limit,
    });

    return RulesListResponseDto.fromFindRulesResult(result);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Get a rule by ID",
    description: "Retrieves a single rule by its unique identifier.",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The unique identifier of the rule",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Rule retrieved successfully",
    type: RuleResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: createSwaggerErrorCodesDescription([
      ErrorCode.RESOURCE_NOT_FOUND,
    ]),
    type: HttpErrorDto,
  })
  async getRuleById(
    @Param("id", ParseIntPipe) id: number,
    @Query("includeProducts") includeProducts?: string
  ): Promise<RuleResponseDto> {
    const rule = await this.getRuleByIdUseCase.execute({
      id,
      includeProducts: includeProducts === "true",
    });

    return RuleResponseDto.fromRuleWithConfig(rule);
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Update a rule",
    description:
      "Updates an existing rule. Only provided fields will be updated. " +
      "Config updates must match the rule's type.",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The unique identifier of the rule to update",
  })
  @ApiBody({ type: UpdateRuleRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      "Rule updated successfully. Includes violations array if any existing palettes violate the updated rule.",
    type: UpdateRuleResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: createSwaggerErrorCodesDescription([
      ErrorCode.DTO_VALIDATION_FAILED,
    ]),
    type: HttpErrorDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: createSwaggerErrorCodesDescription([
      ErrorCode.RESOURCE_NOT_FOUND,
    ]),
    type: HttpErrorDto,
  })
  async updateRule(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateRuleRequestDto
  ): Promise<UpdateRuleResponseDto> {
    const { ruleWithConfig, violations } = await this.updateRuleUseCase.execute(
      {
        id,
        name: dto.name,
        description: dto.description,
        isActive: dto.isActive,
        zonePriorityConfig: dto.zonePriorityConfig,
        productIncompatibilityConfig: dto.productIncompatibilityConfig,
        storageConditionConfig: dto.storageConditionConfig,
        placementConstraintConfig: dto.placementConstraintConfig,
      }
    );

    return UpdateRuleResponseDto.fromUpdateResult(ruleWithConfig, violations);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Delete a rule",
    description: "Soft deletes a rule by setting its deletedAt timestamp.",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The unique identifier of the rule to delete",
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: "Rule deleted successfully",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: createSwaggerErrorCodesDescription([
      ErrorCode.RESOURCE_NOT_FOUND,
    ]),
    type: HttpErrorDto,
  })
  async deleteRule(@Param("id", ParseIntPipe) id: number): Promise<void> {
    await this.deleteRuleUseCase.execute({ id });
  }

  @Post(":id/products")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Link products to a rule",
    description:
      "Associates one or more products with a rule. " +
      "Products already linked will be skipped. " +
      "Returns any violations detected after linking.",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The unique identifier of the rule",
  })
  @ApiBody({ type: LinkProductsRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Products linked successfully. Includes violations if any.",
    type: [RuleViolationResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: createSwaggerErrorCodesDescription([
      ErrorCode.DTO_VALIDATION_FAILED,
    ]),
    type: HttpErrorDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: createSwaggerErrorCodesDescription([
      ErrorCode.RESOURCE_NOT_FOUND,
    ]),
    type: HttpErrorDto,
  })
  async linkProducts(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: LinkProductsRequestDto
  ): Promise<{ violations: RuleViolationResponseDto[] }> {
    const { violations } = await this.linkProductsToRuleUseCase.execute({
      ruleId: id,
      productIds: dto.productIds,
    });

    return {
      violations: violations.map((v) => RuleViolationResponseDto.fromDomain(v)),
    };
  }

  @Delete(":id/products")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Unlink products from a rule",
    description: "Removes the association between products and a rule.",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The unique identifier of the rule",
  })
  @ApiBody({ type: LinkProductsRequestDto })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: "Products unlinked successfully",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: createSwaggerErrorCodesDescription([
      ErrorCode.RESOURCE_NOT_FOUND,
    ]),
    type: HttpErrorDto,
  })
  async unlinkProducts(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: LinkProductsRequestDto
  ): Promise<void> {
    await this.unlinkProductsFromRuleUseCase.execute({
      ruleId: id,
      productIds: dto.productIds,
    });
  }
}
