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
  CreateProductUseCase,
  DeleteProductUseCase,
  GetProductByIdUseCase,
  GetProductPaletteCountUseCase,
  GetProductsUseCase,
  UpdateProductUseCase,
} from "@application/use-cases";
import {
  CreateProductRequestDto,
  GetProductsQueryDto,
  ProductResponseDto,
  ProductsListResponseDto,
  UpdateProductRequestDto,
  UpdateProductResponseDto,
} from "@infrastructure/dto";
import { HttpErrorDto } from "@infrastructure/dto/general";
import { createSwaggerErrorCodesDescription, ErrorCode } from "@domain/types";

@ApiTags("Products")
@Controller({ path: "products" })
export class ProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly getProductsUseCase: GetProductsUseCase,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
    private readonly getProductPaletteCountUseCase: GetProductPaletteCountUseCase
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create a product",
    description:
      "Creates a new product with the given reference, name, unit of measure, " +
      "and optionally a minimum stock threshold and rule associations.",
  })
  @ApiBody({ type: CreateProductRequestDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Product created successfully",
    type: ProductResponseDto,
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
    description: "A product with the same reference already exists",
    type: HttpErrorDto,
  })
  async create(
    @Body() dto: CreateProductRequestDto
  ): Promise<ProductResponseDto> {
    const product = await this.createProductUseCase.execute({
      reference: dto.reference,
      name: dto.name,
      unitOfMeasureId: dto.unitOfMeasureId,
      categoryId: dto.categoryId,
      minimumStock: dto.minimumStock,
      expiryAlertThreshold: dto.expiryAlertThreshold,
      ruleIds: dto.ruleIds,
    });

    return ProductResponseDto.fromProductWithRules(product);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Get all products",
    description:
      "Retrieves a paginated list of products. Supports search by name or reference.",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "List of products retrieved successfully",
    type: ProductsListResponseDto,
  })
  async getProducts(
    @Query() query: GetProductsQueryDto
  ): Promise<ProductsListResponseDto> {
    const result = await this.getProductsUseCase.execute({
      search: query.search,
      page: query.page,
      limit: query.limit,
    });

    return ProductsListResponseDto.fromFindProductsResult(result);
  }

  @Get(":id/palette-count")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Get active palette count for a product",
    description:
      "Returns the number of active palettes that contain this product.",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The unique identifier of the product",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Palette count retrieved successfully",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: createSwaggerErrorCodesDescription([
      ErrorCode.RESOURCE_NOT_FOUND,
    ]),
    type: HttpErrorDto,
  })
  async getProductPaletteCount(
    @Param("id", ParseIntPipe) id: number
  ): Promise<{ count: number }> {
    return this.getProductPaletteCountUseCase.execute({ id });
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Get a product by ID",
    description: "Retrieves a single product by its unique identifier.",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The unique identifier of the product",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Product retrieved successfully",
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: createSwaggerErrorCodesDescription([
      ErrorCode.RESOURCE_NOT_FOUND,
    ]),
    type: HttpErrorDto,
  })
  async getProductById(
    @Param("id", ParseIntPipe) id: number
  ): Promise<ProductResponseDto> {
    const product = await this.getProductByIdUseCase.execute({ id });

    return ProductResponseDto.fromProductWithRules(product);
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Update a product",
    description:
      "Updates an existing product. Only provided fields will be updated. " +
      "If ruleIds is provided, it replaces all existing rule associations.",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The unique identifier of the product to update",
  })
  @ApiBody({ type: UpdateProductRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      "Product updated successfully. Includes violations if rule changes cause any.",
    type: UpdateProductResponseDto,
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
    description: "A product with the same reference already exists",
    type: HttpErrorDto,
  })
  async updateProduct(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateProductRequestDto
  ): Promise<UpdateProductResponseDto> {
    const { productWithRules, violations } =
      await this.updateProductUseCase.execute({
        id,
        reference: dto.reference,
        name: dto.name,
        unitOfMeasureId: dto.unitOfMeasureId,
        categoryId: dto.categoryId,
        minimumStock: dto.minimumStock,
        expiryAlertThreshold: dto.expiryAlertThreshold,
        ruleIds: dto.ruleIds,
      });

    return UpdateProductResponseDto.fromUpdateResult(
      productWithRules,
      violations
    );
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Delete a product",
    description: "Soft deletes a product by setting its deletedAt timestamp.",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The unique identifier of the product to delete",
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: "Product deleted successfully",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: createSwaggerErrorCodesDescription([
      ErrorCode.RESOURCE_NOT_FOUND,
    ]),
    type: HttpErrorDto,
  })
  async deleteProduct(@Param("id", ParseIntPipe) id: number): Promise<void> {
    await this.deleteProductUseCase.execute({ id });
  }
}
