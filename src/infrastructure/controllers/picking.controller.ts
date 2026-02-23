import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
  GetAvailableStockUseCase,
  CreatePickingListUseCase,
  GeneratePickRouteUseCase,
  CompletePickingListUseCase,
  CancelPickingListUseCase,
} from "@application/use-cases";
import {
  AvailableStockQueryDto,
  AvailableStockResponseDto,
  CreatePickingListRequestDto,
  PickingListResponseDto,
  PickRouteItemResponseDto,
  CompletePickingListRequestDto,
  CompletePickingListResponseDto,
  CancelPickingListResponseDto,
} from "@infrastructure/dto/picking";

@ApiTags("Picking Lists")
@Controller({ path: "picking-lists" })
export class PickingController {
  constructor(
    private readonly getAvailableStockUseCase: GetAvailableStockUseCase,
    private readonly createPickingListUseCase: CreatePickingListUseCase,
    private readonly generatePickRouteUseCase: GeneratePickRouteUseCase,
    private readonly completePickingListUseCase: CompletePickingListUseCase,
    private readonly cancelPickingListUseCase: CancelPickingListUseCase,
  ) {}

  @Get("available-stock")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get available stock for products" })
  @ApiResponse({ status: HttpStatus.OK, type: [AvailableStockResponseDto] })
  async getAvailableStock(
    @Query() query: AvailableStockQueryDto,
  ): Promise<AvailableStockResponseDto[]> {
    const stock = await this.getAvailableStockUseCase.execute(query.productIds);
    return stock.map((s) => AvailableStockResponseDto.fromDomain(s));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new picking list" })
  @ApiResponse({ status: HttpStatus.CREATED, type: PickingListResponseDto })
  async create(
    @Body() dto: CreatePickingListRequestDto,
  ): Promise<PickingListResponseDto> {
    const list = await this.createPickingListUseCase.execute({
      items: dto.items,
    });
    return PickingListResponseDto.fromDomain(list);
  }

  @Post(":id/generate-route")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Generate FEFO-ordered pick route for a picking list" })
  @ApiResponse({ status: HttpStatus.OK, type: [PickRouteItemResponseDto] })
  async generateRoute(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<PickRouteItemResponseDto[]> {
    const route = await this.generatePickRouteUseCase.execute(id);
    return route.map((item) => PickRouteItemResponseDto.fromDomain(item));
  }

  @Post(":id/complete")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Complete a picking list and deduct stock" })
  @ApiResponse({ status: HttpStatus.OK, type: CompletePickingListResponseDto })
  async complete(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: CompletePickingListRequestDto,
  ): Promise<CompletePickingListResponseDto> {
    const result = await this.completePickingListUseCase.execute({
      pickingListId: id,
      items: dto.items,
    });
    return CompletePickingListResponseDto.fromDomain(result);
  }

  @Post(":id/cancel")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Cancel a picking list — no stock deducted" })
  @ApiResponse({ status: HttpStatus.OK, type: CancelPickingListResponseDto })
  async cancel(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<CancelPickingListResponseDto> {
    const result = await this.cancelPickingListUseCase.execute(id);
    return CancelPickingListResponseDto.fromDomain(result);
  }
}
