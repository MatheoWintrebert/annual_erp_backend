import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
  RecommendPlacementUseCase,
  RegisterConflictResolutionUseCase,
  RegisterPaletteUseCase,
} from "@application/use-cases";
import {
  PlacementResultResponseDto,
  RecommendPlacementRequestDto,
  RegisterConflictResolutionRequestDto,
  RegisterConflictResolutionResponseDto,
  RegisterPaletteRequestDto,
  RegisterPaletteResponseDto,
} from "@infrastructure/dto/intake";
import { HttpErrorDto } from "@infrastructure/dto/general";
import { createSwaggerErrorCodesDescription, ErrorCode } from "@domain/types";

@ApiTags("Intake")
@Controller({ path: "palettes/intake" })
export class IntakeController {
  constructor(
    private readonly recommendPlacementUseCase: RecommendPlacementUseCase,
    private readonly registerPaletteUseCase: RegisterPaletteUseCase,
    private readonly registerConflictResolutionUseCase: RegisterConflictResolutionUseCase
  ) {}

  @Post("recommend-placement")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Recommend placement for products",
    description:
      "Analyzes placement rules and available space to recommend the best palettier and position for the given products. Returns a conflict result with grouped recommendations if products have incompatible rules.",
  })
  @ApiBody({ type: RecommendPlacementRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      "Placement result: either a single recommendation (resolved) or conflict groups",
    type: PlacementResultResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: createSwaggerErrorCodesDescription([
      ErrorCode.RESOURCE_NOT_FOUND,
    ]),
    type: HttpErrorDto,
  })
  async recommendPlacement(
    @Body() dto: RecommendPlacementRequestDto
  ): Promise<PlacementResultResponseDto> {
    const result = await this.recommendPlacementUseCase.execute({
      productIds: dto.productIds,
    });

    return PlacementResultResponseDto.fromResult(result);
  }

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Register a palette with one or more products",
    description:
      "Creates a new palette with lots for each product at the specified position in the specified palettier.",
  })
  @ApiBody({ type: RegisterPaletteRequestDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Palette registered successfully",
    type: RegisterPaletteResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: createSwaggerErrorCodesDescription([
      ErrorCode.POSITION_OCCUPIED,
    ]),
    type: HttpErrorDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: createSwaggerErrorCodesDescription([
      ErrorCode.RESOURCE_NOT_FOUND,
      ErrorCode.PALETTIER_NOT_FOUND,
    ]),
    type: HttpErrorDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: createSwaggerErrorCodesDescription([
      ErrorCode.DTO_VALIDATION_FAILED,
    ]),
    type: HttpErrorDto,
  })
  async register(
    @Body() dto: RegisterPaletteRequestDto
  ): Promise<RegisterPaletteResponseDto> {
    const result = await this.registerPaletteUseCase.execute({
      palettierId: dto.palettierId,
      positionX: dto.positionX,
      positionY: dto.positionY,
      positionZ: dto.positionZ,
      items: dto.items.map((item) => ({
        productId: item.productId,
        lotReference: item.lotReference ?? null,
        expiryDate: item.expiryDate ?? null,
        quantity: item.quantity,
      })),
    });

    return RegisterPaletteResponseDto.fromOutput(result);
  }

  @Post("register-conflict-resolution")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Register multiple palettes from conflict resolution",
    description:
      "Creates separate palettes for each conflict group at their respective positions. All groups are validated before any creation occurs.",
  })
  @ApiBody({ type: RegisterConflictResolutionRequestDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "All conflict resolution palettes registered successfully",
    type: RegisterConflictResolutionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: createSwaggerErrorCodesDescription([
      ErrorCode.POSITION_OCCUPIED,
    ]),
    type: HttpErrorDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: createSwaggerErrorCodesDescription([
      ErrorCode.RESOURCE_NOT_FOUND,
      ErrorCode.PALETTIER_NOT_FOUND,
    ]),
    type: HttpErrorDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: createSwaggerErrorCodesDescription([
      ErrorCode.DTO_VALIDATION_FAILED,
    ]),
    type: HttpErrorDto,
  })
  async registerConflictResolution(
    @Body() dto: RegisterConflictResolutionRequestDto
  ): Promise<RegisterConflictResolutionResponseDto> {
    const result = await this.registerConflictResolutionUseCase.execute({
      groups: dto.groups.map((group) => ({
        palettierId: group.palettierId,
        positionX: group.positionX,
        positionY: group.positionY,
        positionZ: group.positionZ,
        items: group.items.map((item) => ({
          productId: item.productId,
          lotReference: item.lotReference ?? null,
          expiryDate: item.expiryDate ?? null,
          quantity: item.quantity,
        })),
      })),
    });

    return RegisterConflictResolutionResponseDto.fromOutput(result);
  }
}
