import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { DictDataService } from './dict-data.service';
import {
  CreateDictDataDto,
  QueryDictDataDto,
  UpdateDictDataDto,
} from './dict-data.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ActiveUser } from 'src/modules/iam/decorators/active-user.decorator';
import { ActiveUserData } from 'src/modules/iam/interfaces/active-user-data.interface';
import { DictDataEntity } from './dict-data.entity';
import { ApiPaginatedResponse } from 'src/common/response/paginated.response';
import { Permissions } from 'src/modules/iam/authorization/decorators/permissions.decorator';

@ApiTags('字典数据管理')
@ApiBearerAuth('bearer')
@Controller('dict-data')
export class DictDataController {
  constructor(private readonly dictDataService: DictDataService) {}

  @Post()
  @ApiOperation({ summary: '创建字典数据' })
  @ApiCreatedResponse({ type: DictDataEntity })
  @Permissions('system:dictData:create')
  create(
    @ActiveUser() user: ActiveUserData,
    @Body() createDictDataDto: CreateDictDataDto,
  ) {
    return this.dictDataService.create(user, createDictDataDto);
  }

  @Get()
  @ApiOperation({ summary: '获取字典数据列表' })
  @ApiPaginatedResponse(DictDataEntity)
  @Permissions('system:dictData:query')
  findAll(@Query() queryDictDataDto: QueryDictDataDto) {
    return this.dictDataService.findAll(queryDictDataDto);
  }

  @Get('charts')
  @ApiOperation({ summary: '获取字典数据图表列表' })
  @ApiOkResponse({ type: DictDataEntity, isArray: true })
  @Permissions('system:dictData:query')
  findAllEcharts(@Query() queryDictDataDto: QueryDictDataDto) {
    return this.dictDataService.findAllCharts(queryDictDataDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取字典数据详情' })
  @ApiOkResponse({ type: DictDataEntity })
  @Permissions('system:dictData:query')
  findOne(@Param('id') id: number) {
    return this.dictDataService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新字典数据' })
  @ApiOkResponse({ type: DictDataEntity })
  @Permissions('system:dictData:update')
  update(
    @Param('id') id: number,
    @ActiveUser() user: ActiveUserData,
    @Body() updateDictDataDto: UpdateDictDataDto,
  ) {
    return this.dictDataService.update(id, user, updateDictDataDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除字典数据' })
  @Permissions('system:dictData:delete')
  remove(@Param('id') id: number) {
    return this.dictDataService.remove(id);
  }
}
