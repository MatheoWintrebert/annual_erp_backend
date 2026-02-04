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
  CreatePalettierTypeUseCase,
  GetPalettierTypeByIdUseCase,
  GetPalettierTypesUseCase,
  UpdatePalettierTypeUseCase,
} from "@application/use-cases";
import {
  CreatePalettierTypeRequestDto,
  PalettierTypeResponseDto,
  UpdatePalettierTypeRequestDto,
} from "@infrastructure/dto";
import { HttpErrorDto } from "@infrastructure/dto/general";
import { createSwaggerErrorCodesDescription, ErrorCode } from "@domain/types";

@ApiTags("Palettier Types")
@Controller({ path: "palettier-types" })
export class PalettierTypeController {
  constructor(
    private readonly createPalettierTypeUseCase: CreatePalettierTypeUseCase,
    private readonly getPalettierTypesUseCase: GetPalettierTypesUseCase,
    private readonly getPalettierTypeByIdUseCase: GetPalettierTypeByIdUseCase,
    private readonly updatePalettierTypeUseCase: UpdatePalettierTypeUseCase
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Get all palettier types",
    description:
      "Retrieves a list of all palettier types ordered by creation date.",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "List of palettier types retrieved successfully",
    type: [PalettierTypeResponseDto],
  })
  async getPalettierTypes(): Promise<PalettierTypeResponseDto[]> {
    const palettierTypes = await this.getPalettierTypesUseCase.execute();
    return palettierTypes.map((palettierType) =>
      PalettierTypeResponseDto.fromEntity(palettierType)
    );
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Get a palettier type by ID",
    description: "Retrieves a single palettier type by its unique identifier.",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The unique identifier of the palettier type",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Palettier type retrieved successfully",
    type: PalettierTypeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: createSwaggerErrorCodesDescription([
      ErrorCode.RESOURCE_NOT_FOUND,
    ]),
    type: HttpErrorDto,
  })
  async getPalettierTypeById(
    @Param("id", ParseIntPipe) id: number
  ): Promise<PalettierTypeResponseDto> {
    const palettierType = await this.getPalettierTypeByIdUseCase.execute({
      id,
    });
    return PalettierTypeResponseDto.fromEntity(palettierType);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Create a palettier type",
    description:
      "Creates a new palettier type that can be used when creating palettiers. " +
      "Validates that the name is unique before creation.",
  })
  @ApiBody({ type: CreatePalettierTypeRequestDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Palettier type created successfully",
    type: PalettierTypeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: createSwaggerErrorCodesDescription([
      ErrorCode.DTO_VALIDATION_FAILED,
    ]),
    type: HttpErrorDto,
  })
  async createPalettierType(
    @Body() dto: CreatePalettierTypeRequestDto
  ): Promise<PalettierTypeResponseDto> {
    const palettierType = await this.createPalettierTypeUseCase.execute({
      name: dto.name,
      description: dto.description,
    });

    return PalettierTypeResponseDto.fromEntity(palettierType);
  }

  @Put(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Update a palettier type",
    description:
      "Updates an existing palettier type. Only provided fields will be updated. " +
      "Validates that the name is unique if being changed.",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "The unique identifier of the palettier type to update",
  })
  @ApiBody({ type: UpdatePalettierTypeRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Palettier type updated successfully",
    type: PalettierTypeResponseDto,
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
  async updatePalettierType(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdatePalettierTypeRequestDto
  ): Promise<PalettierTypeResponseDto> {
    const palettierType = await this.updatePalettierTypeUseCase.execute({
      id,
      name: dto.name,
      description: dto.description,
    });

    return PalettierTypeResponseDto.fromEntity(palettierType);
  }
}
