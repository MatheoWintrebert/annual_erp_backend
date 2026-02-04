import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from "@nestjs/common";
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  CreatePalettiersUseCase,
  GetPalettierByIdUseCase,
  GetPalettiersUseCase,
  UpdatePalettierUseCase,
} from "@application/use-cases";
import {
  CreatePalettiersRequestDto,
  CreatePalettiersResponseDto,
  PalettierResponseDto,
  UpdatePalettierRequestDto,
} from "@infrastructure/dto";
import { HttpErrorDto } from "@infrastructure/dto/general";
import { createSwaggerErrorCodesDescription, ErrorCode } from "@domain/types";

@ApiTags("Palettiers")
@Controller({ path: "palettiers" })
export class PalettierController {
  constructor(
    private readonly createPalettiersUseCase: CreatePalettiersUseCase,
    private readonly getPalettiersUseCase: GetPalettiersUseCase,
    private readonly getPalettierByIdUseCase: GetPalettierByIdUseCase,
    private readonly updatePalettierUseCase: UpdatePalettierUseCase
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Get all palettiers",
    description: "Retrieves a list of all palettiers ordered by creation date.",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "List of palettiers retrieved successfully",
    type: [PalettierResponseDto],
  })
  async getPalettiers(): Promise<PalettierResponseDto[]> {
    const palettiers = await this.getPalettiersUseCase.execute();
    return palettiers.map((palettier) =>
      PalettierResponseDto.fromEntity(palettier)
    );
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Get a palettier by ID",
    description: "Retrieves a single palettier by its unique identifier.",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The unique identifier of the palettier",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Palettier retrieved successfully",
    type: PalettierResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: createSwaggerErrorCodesDescription([
      ErrorCode.RESOURCE_NOT_FOUND,
    ]),
    type: HttpErrorDto,
  })
  async getPalettierById(
    @Param("id", ParseIntPipe) id: number
  ): Promise<PalettierResponseDto> {
    const palettier = await this.getPalettierByIdUseCase.execute({ id });
    return PalettierResponseDto.fromEntity(palettier);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create multiple palettiers",
    description:
      "Creates one or more palettiers in a single atomic operation. " +
      "Each palettier can reference an existing type (via typeId) or create a new type (via newTypeName). " +
      "If any palettier fails validation or creation, the entire operation is rolled back.",
  })
  @ApiBody({ type: CreatePalettiersRequestDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Palettiers created successfully",
    type: CreatePalettiersResponseDto,
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
  async createPalettiers(
    @Body() dto: CreatePalettiersRequestDto
  ): Promise<CreatePalettiersResponseDto> {
    const palettiers = await this.createPalettiersUseCase.execute({
      palettiers: dto.palettiers.map((item) => ({
        name: item.name,
        typeId: item.typeId,
        newTypeName: item.newTypeName,
        width: item.width,
        depth: item.depth,
        height: item.height,
      })),
    });

    return CreatePalettiersResponseDto.fromEntities(palettiers);
  }

  @Put(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Update a palettier",
    description:
      "Updates an existing palettier. Only provided fields will be updated.",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The unique identifier of the palettier to update",
  })
  @ApiBody({ type: UpdatePalettierRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Palettier updated successfully",
    type: PalettierResponseDto,
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
  async updatePalettier(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdatePalettierRequestDto
  ): Promise<PalettierResponseDto> {
    const palettier = await this.updatePalettierUseCase.execute({
      id,
      name: dto.name,
      palettierTypeId: dto.palettierTypeId,
      width: dto.width,
      depth: dto.depth,
      height: dto.height,
    });

    return PalettierResponseDto.fromEntity(palettier);
  }
}
