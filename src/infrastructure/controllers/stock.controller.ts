import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
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
  CheckOnboardingViolationsUseCase,
  DeletePaletteUseCase,
  GetPalettesUseCase,
  GetPaletteViolationsUseCase,
  UpdatePalettePositionUseCase,
} from "@application/use-cases/stock";
import {
  CheckPlacementViolationsRequestDto,
  GetPalettesQueryDto,
  PaletteListItemResponseDto,
  PlacementViolationWarningResponseDto,
  UpdatePalettePositionRequestDto,
} from "@infrastructure/dto/stock";
import { RuleViolationResponseDto } from "@infrastructure/dto/rule";
import { HttpErrorDto } from "@infrastructure/dto/general";
import { createSwaggerErrorCodesDescription, ErrorCode } from "@domain/types";

@ApiTags("Stock")
@Controller({ path: "palettes" })
export class StockController {
  constructor(
    private readonly getPalettesUseCase: GetPalettesUseCase,
    private readonly getPaletteViolationsUseCase: GetPaletteViolationsUseCase,
    private readonly checkOnboardingViolationsUseCase: CheckOnboardingViolationsUseCase,
    private readonly updatePalettePositionUseCase: UpdatePalettePositionUseCase,
    private readonly deletePaletteUseCase: DeletePaletteUseCase
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Get all palettes with details",
    description:
      "Retrieves all palettes with their products, quantities, positions, and expiry dates. Supports filtering by palettier and product name search.",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "List of palettes retrieved successfully",
    type: [PaletteListItemResponseDto],
  })
  async getPalettes(
    @Query() query: GetPalettesQueryDto
  ): Promise<PaletteListItemResponseDto[]> {
    const palettes = await this.getPalettesUseCase.execute({
      palettierId: query.palettierId,
      search: query.search,
    });

    return palettes.map((p) => PaletteListItemResponseDto.fromDomain(p));
  }

  @Get("violations")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Get palette rule violations",
    description:
      "Returns all active rule violations across palettes. Empty array means no violations.",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "List of palette rule violations",
    type: [RuleViolationResponseDto],
  })
  async getViolations(): Promise<RuleViolationResponseDto[]> {
    const violations = await this.getPaletteViolationsUseCase.execute();

    return violations.map((v) => RuleViolationResponseDto.fromDomain(v));
  }

  @Post("check-placement-violations")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Check placement violations for onboarding",
    description:
      "Checks whether placing products on a specific palettier would violate any placement rules. Returns advisory warnings only — violations do not block registration.",
  })
  @ApiBody({ type: CheckPlacementViolationsRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      "Array of placement violation warnings (empty array means no violations)",
    type: [PlacementViolationWarningResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: createSwaggerErrorCodesDescription([
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
  async checkPlacementViolations(
    @Body() dto: CheckPlacementViolationsRequestDto
  ): Promise<PlacementViolationWarningResponseDto[]> {
    const warnings = await this.checkOnboardingViolationsUseCase.execute({
      productIds: dto.productIds,
      palettierId: dto.palettierId,
    });

    return warnings.map((w) =>
      PlacementViolationWarningResponseDto.fromDomain(w)
    );
  }

  @Put(":id/position")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Update palette position",
    description:
      "Updates the palettier and position of an existing palette. Validates that the target position is within bounds and not already occupied.",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The unique identifier of the palette to update",
  })
  @ApiBody({ type: UpdatePalettePositionRequestDto })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: "Palette position updated successfully",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: createSwaggerErrorCodesDescription([
      ErrorCode.PALETTE_NOT_FOUND,
      ErrorCode.PALETTIER_NOT_FOUND,
    ]),
    type: HttpErrorDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: createSwaggerErrorCodesDescription([
      ErrorCode.POSITION_OCCUPIED,
    ]),
    type: HttpErrorDto,
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: createSwaggerErrorCodesDescription([
      ErrorCode.POSITION_OUT_OF_BOUNDS,
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
  async updatePalettePosition(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdatePalettePositionRequestDto
  ): Promise<void> {
    await this.updatePalettePositionUseCase.execute({
      paletteId: id,
      palettierId: dto.palettierId,
      positionX: dto.positionX,
      positionY: dto.positionY,
      positionZ: dto.positionZ,
    });
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Delete a palette",
    description: "Soft-deletes a palette by ID.",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The unique identifier of the palette to delete",
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: "Palette deleted successfully",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: createSwaggerErrorCodesDescription([
      ErrorCode.PALETTE_NOT_FOUND,
    ]),
    type: HttpErrorDto,
  })
  async deletePalette(
    @Param("id", ParseIntPipe) id: number
  ): Promise<void> {
    await this.deletePaletteUseCase.execute({ paletteId: id });
  }
}
