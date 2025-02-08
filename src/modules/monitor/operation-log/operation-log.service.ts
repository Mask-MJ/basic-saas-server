import { Inject, Injectable } from '@nestjs/common';
import {
  CreateOperationLogDto,
  QueryOperationLogDto,
} from './operation-log.dto';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from 'src/common/pagination/prisma.extension';
import IP2Region from 'ip2region';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class OperationLogService {
  constructor(
    @Inject('PrismaService')
    private readonly prismaService: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  create(createOperationLogDto: CreateOperationLogDto) {
    const query = new IP2Region();
    const addressInfo = query.search(createOperationLogDto.ip);
    const address = addressInfo ? addressInfo.province + addressInfo.city : '';

    return this.prismaService.client.operationLog.create({
      data: { ...createOperationLogDto, address },
    });
  }

  async findAll(queryOperationLogDto: QueryOperationLogDto) {
    const { page, pageSize, beginTime, endTime, username, businessType } =
      queryOperationLogDto;
    const [rows, meta] = await this.prismaService.client.operationLog
      .paginate({
        where: {
          username: { contains: username },
          businessType,
          createdAt: { gte: beginTime, lte: endTime },
        },
        orderBy: { createdAt: 'desc' },
      })
      .withPages({ limit: pageSize, page, includePageCount: true });

    return { rows, ...meta };
  }

  findOne(id: number) {
    return this.prismaService.client.operationLog.findUniqueOrThrow({
      where: { id },
    });
  }

  @OnEvent('create')
  async handleOperationCreateEvent(payload: CreateOperationLogDto) {
    await this.create(payload);
  }

  @OnEvent('delete')
  async handleOperationDeleteEvent(payload: CreateOperationLogDto) {
    await this.create(payload);
  }
}
