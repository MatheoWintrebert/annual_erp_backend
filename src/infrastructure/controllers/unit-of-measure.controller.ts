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
  CreateUnitOfMeasureUseCase,
  DeleteUnitOfMeasureUseCase,
  GetUnitOfMeasureByIdUseCase,
  GetUnitsOfMeasureUseCase,
  UpdateUnitOfMeasureUseCase,
} from "@application/use-cases";
import {
  CreateUnitOfMeasureRequestDto,
  GetUnitsOfMeasureQueryDto,
  UnitOfMeasureResponseDto,
  UnitsOfMeasureListResponseDto,
  UpdateUnitOfMeasureRequestDto,
} from "@infrastructure/dto";
import { HttpErrorDto } from "@infrastructure/dto/general";
import { createSwaggerErrorCodesDescription, ErrorCode } from "@domain/types";

@ApiTags("Units of Measure")
@Controller({ path: "units-of-measure" })
export class UnitOfMeasureController {
  constructor(
    private readonly createUnitOfMeasureUseCase: CreateUnitOfMeasureUseCase,
    private readonly getUnitsOfMeasureUseCase: GetUnitsOfMeasureUseCase,
    private readonly getUnitOfMeasureByIdUseCase: GetUnitOfMeasureByIdUseCase,
    private readonly updateUnitOfMeasureUseCase: UpdateUnitOfMeasureUseCase,
    private readonly deleteUnitOfMeasureUseCase: DeleteUnitOfMeasureUseCase
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create a unit of measure",
    description:
      "Creates a new unit of measure with the given name and abbreviation.",
  })
  @ApiBody({ type: CreateUnitOfMeasureRequestDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Unit of measure created successfully",
    type: UnitOfMeasureResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: createSwaggerErrorCodesDescription([
      ErrorCode.DTO_VALIDATION_FAILED,
    ]),
    type: HttpErrorDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description:
      "A unit of measure with the same name or abbreviation already exists",
    type: HttpErrorDto,
  })
  async create(
    @Body() dto: CreateUnitOfMeasureRequestDto
  ): Promise<UnitOfMeasureResponseDto> {
    const unitOfMeasure = await this.createUnitOfMeasureUseCase.execute({
      name: dto.name,
      abbreviation: dto.abbreviation,
    });

    return UnitOfMeasureResponseDto.fromEntity(unitOfMeasure);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Get all units of measure",
    description:
      "Retrieves a paginated list of units of measure. Supports search by name or abbreviation.",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "List of units of measure retrieved successfully",
    type: UnitsOfMeasureListResponseDto,
  })
  async getUnitsOfMeasure(
    @Query() query: GetUnitsOfMeasureQueryDto
  ): Promise<UnitsOfMeasureListResponseDto> {
    const result = await this.getUnitsOfMeasureUseCase.execute({
      search: query.search,
      page: query.page,
      limit: query.limit,
    });

    return UnitsOfMeasureListResponseDto.fromFindUnitsOfMeasureResult(result);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Get a unit of measure by ID",
    description: "Retrieves a single unit of measure by its unique identifier.",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The unique identifier of the unit of measure",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Unit of measure retrieved successfully",
    type: UnitOfMeasureResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: createSwaggerErrorCodesDescription([
      ErrorCode.RESOURCE_NOT_FOUND,
    ]),
    type: HttpErrorDto,
  })
  async getUnitOfMeasureById(
    @Param("id", ParseIntPipe) id: number
  ): Promise<UnitOfMeasureResponseDto> {
    const unitOfMeasure = await this.getUnitOfMeasureByIdUseCase.execute({
      id,
    });

    return UnitOfMeasureResponseDto.fromEntity(unitOfMeasure);
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Update a unit of measure",
    description:
      "Updates an existing unit of measure. Only provided fields will be updated.",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The unique identifier of the unit of measure to update",
  })
  @ApiBody({ type: UpdateUnitOfMeasureRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Unit of measure updated successfully",
    type: UnitOfMeasureResponseDto,
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
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description:
      "A unit of measure with the same name or abbreviation already exists",
    type: HttpErrorDto,
  })
  async updateUnitOfMeasure(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateUnitOfMeasureRequestDto
  ): Promise<UnitOfMeasureResponseDto> {
    const unitOfMeasure = await this.updateUnitOfMeasureUseCase.execute({
      id,
      name: dto.name,
      abbreviation: dto.abbreviation,
    });

    return UnitOfMeasureResponseDto.fromEntity(unitOfMeasure);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Delete a unit of measure",
    description:
      "Permanently deletes a unit of measure. Will fail if products are still referencing it.",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The unique identifier of the unit of measure to delete",
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: "Unit of measure deleted successfully",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: createSwaggerErrorCodesDescription([
      ErrorCode.RESOURCE_NOT_FOUND,
    ]),
    type: HttpErrorDto,
  })
  async deleteUnitOfMeasure(
    @Param("id", ParseIntPipe) id: number
  ): Promise<void> {
    await this.deleteUnitOfMeasureUseCase.execute({ id });
  }
}
