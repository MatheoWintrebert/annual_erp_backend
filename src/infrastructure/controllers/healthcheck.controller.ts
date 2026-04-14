import { Controller, Get, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Public } from "@infrastructure/decorators";

@ApiTags("Healthcheck")
@Controller({ path: "healthcheck" })
export class HealthcheckController {
  @Public()
  @Get("")
  @ApiOperation({ summary: "Healthcheck" })
  @ApiResponse({ status: HttpStatus.OK })
  public health(): { status: HttpStatus } {
    return {
      status: HttpStatus.OK,
    };
  }
}
