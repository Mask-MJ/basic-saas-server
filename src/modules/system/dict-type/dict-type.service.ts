import { Inject, Injectable } from '@nestjs/common';
import {
  CreateDictTypeDto,
  QueryDictTypeDto,
  UpdateDictTypeDto,
} from './dict-type.dto';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from 'src/common/pagination/prisma.extension';
import { ActiveUserData } from 'src/modules/iam/interfaces/active-user-data.interface';

@Injectable()
export class DictTypeService {
  constructor(
    @Inject('PrismaService')
    private readonly prismaService: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  create(user: ActiveUserData, createDictTypeDto: CreateDictTypeDto) {
    return this.prismaService.client.dictType.create({
      data: { ...createDictTypeDto, createBy: user.username },
    });
  }

  async findAll(queryDictTypeDto: QueryDictTypeDto) {
    const { name, value, page, pageSize } = queryDictTypeDto;
    const [rows, meta] = await this.prismaService.client.dictType
      .paginate({
        where: { name: { contains: name }, value: { contains: value } },
      })
      .withPages({ page, limit: pageSize, includePageCount: true });
    return { rows, ...meta };
  }

  findOne(id: number) {
    return this.prismaService.client.dictType.findUnique({ where: { id } });
  }

  update(
    id: number,
    user: ActiveUserData,
    updateDictTypeDto: UpdateDictTypeDto,
  ) {
    return this.prismaService.client.dictType.update({
      where: { id },
      data: { ...updateDictTypeDto, updateBy: user.username },
    });
  }

  remove(id: number) {
    return this.prismaService.client.dictType.delete({ where: { id } });
  }
}
