import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Healthcheck')
@Controller({ path: 'healthcheck' })
export class HealthcheckController {
  @Get('')
  @ApiOperation({ summary: 'Healthcheck' })
  @ApiResponse({ status: HttpStatus.OK })
  public async health(): Promise<{ status: HttpStatus }> {
    return {
      status: HttpStatus.OK,
    };
  }
}