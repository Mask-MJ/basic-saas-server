import { Controller, Sse } from '@nestjs/common';
import { InfoService } from './info.service';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';
import { InfoEntity } from './info.entity';

export interface MessageEvent {
  data: string | object;
  id?: string;
  type?: string;
  retry?: number;
}

@ApiTags('服务器运行状态')
@ApiBearerAuth('bearer')
@Controller('info')
export class InfoController {
  constructor(private readonly infoService: InfoService) {}

  @Sse()
  @ApiOperation({ summary: '运行信息' })
  @ApiOkResponse({ type: InfoEntity })
  systemInfo() {
    return this.infoService.systemInfo();
  }
}
