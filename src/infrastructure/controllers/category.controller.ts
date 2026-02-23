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
  CreateCategoryUseCase,
  DeleteCategoryUseCase,
  GetCategoriesUseCase,
  GetCategoryByIdUseCase,
  UpdateCategoryUseCase,
} from "@application/use-cases";
import {
  CategoriesListResponseDto,
  CategoryResponseDto,
  CreateCategoryRequestDto,
  GetCategoriesQueryDto,
  UpdateCategoryRequestDto,
} from "@infrastructure/dto";
import { HttpErrorDto } from "@infrastructure/dto/general";
import { createSwaggerErrorCodesDescription, ErrorCode } from "@domain/types";

@ApiTags("Categories")
@Controller({ path: "categories" })
export class CategoryController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly getCategoriesUseCase: GetCategoriesUseCase,
    private readonly getCategoryByIdUseCase: GetCategoryByIdUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create a category",
    description: "Creates a new category with the given name.",
  })
  @ApiBody({ type: CreateCategoryRequestDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Category created successfully",
    type: CategoryResponseDto,
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
    description: "A category with the same name already exists",
    type: HttpErrorDto,
  })
  async create(
    @Body() dto: CreateCategoryRequestDto
  ): Promise<CategoryResponseDto> {
    const category = await this.createCategoryUseCase.execute({
      name: dto.name,
    });

    return CategoryResponseDto.fromEntity(category);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Get all categories",
    description:
      "Retrieves a paginated list of categories. Supports search by name.",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "List of categories retrieved successfully",
    type: CategoriesListResponseDto,
  })
  async getCategories(
    @Query() query: GetCategoriesQueryDto
  ): Promise<CategoriesListResponseDto> {
    const result = await this.getCategoriesUseCase.execute({
      search: query.search,
      page: query.page,
      limit: query.limit,
    });

    return CategoriesListResponseDto.fromFindCategoriesResult(result);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Get a category by ID",
    description: "Retrieves a single category by its unique identifier.",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The unique identifier of the category",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Category retrieved successfully",
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: createSwaggerErrorCodesDescription([
      ErrorCode.RESOURCE_NOT_FOUND,
    ]),
    type: HttpErrorDto,
  })
  async getCategoryById(
    @Param("id", ParseIntPipe) id: number
  ): Promise<CategoryResponseDto> {
    const category = await this.getCategoryByIdUseCase.execute({ id });

    return CategoryResponseDto.fromEntity(category);
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Update a category",
    description:
      "Updates an existing category. Only provided fields will be updated.",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The unique identifier of the category to update",
  })
  @ApiBody({ type: UpdateCategoryRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Category updated successfully",
    type: CategoryResponseDto,
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
    description: "A category with the same name already exists",
    type: HttpErrorDto,
  })
  async updateCategory(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryRequestDto
  ): Promise<CategoryResponseDto> {
    const category = await this.updateCategoryUseCase.execute({
      id,
      name: dto.name,
    });

    return CategoryResponseDto.fromEntity(category);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Delete a category",
    description: "Soft deletes a category by setting its deletedAt timestamp.",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The unique identifier of the category to delete",
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: "Category deleted successfully",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: createSwaggerErrorCodesDescription([
      ErrorCode.RESOURCE_NOT_FOUND,
    ]),
    type: HttpErrorDto,
  })
  async deleteCategory(@Param("id", ParseIntPipe) id: number): Promise<void> {
    await this.deleteCategoryUseCase.execute({ id });
  }
}
