import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiLogsService } from './api-logs.service';

@Controller('api-logs')
export class ApiLogsController {
  constructor(private readonly apiLogsService: ApiLogsService) {}

  @Get()
  async getLogs(@Query('limit') limit = 20, @Query('offset') offset = 0) {
    return this.apiLogsService.findAll(Number(limit), Number(offset));
  }

  @Get(':id')
  async getLogById(@Param('id') id: string) {
    return this.apiLogsService.findById(id);
  }
}
