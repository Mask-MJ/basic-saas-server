import { Controller, Get, Param, Query } from '@nestjs/common';
import { OperationLogService } from './operation-log.service';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';
import { OperationLogEntity } from './operation-log.entity';
import { QueryOperationLogDto } from './operation-log.dto';
import { ApiPaginatedResponse } from 'src/common/response/paginated.response';

@ApiTags('操作日志管理')
@ApiBearerAuth('bearer')
@Controller('operation-log')
export class OperationLogController {
  constructor(private readonly operationLogService: OperationLogService) {}

  @Get()
  @ApiOperation({ summary: '获取日志列表' })
  @ApiPaginatedResponse(OperationLogEntity)
  findAll(@Query() queryOperationLogDto: QueryOperationLogDto) {
    return this.operationLogService.findAll(queryOperationLogDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取日志详情' })
  @ApiOkResponse({ type: OperationLogEntity })
  findOne(@Param('id') id: number) {
    return this.operationLogService.findOne(id);
  }
}
