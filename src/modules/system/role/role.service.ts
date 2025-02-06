import { Inject, Injectable } from '@nestjs/common';
import { CreateRoleDto, QueryRoleDto, UpdateRoleDto } from './role.dto';
import { CustomPrismaService } from 'nestjs-prisma';
import { ExtendedPrismaClient } from 'src/common/pagination/prisma.extension';
import { ActiveUserData } from 'src/modules/iam/interfaces/active-user-data.interface';

@Injectable()
export class RoleService {
  constructor(
    @Inject('PrismaService')
    private readonly prismaService: CustomPrismaService<ExtendedPrismaClient>,
  ) {}
  create(user: ActiveUserData, createRoleDto: CreateRoleDto) {
    const { menuIds, ...rest } = createRoleDto;
    return this.prismaService.client.role.create({
      data: {
        ...rest,
        createBy: user.username,
        menus: { connect: menuIds.map((id) => ({ id })) },
      },
    });
  }

  async findAll(queryRoleDto: QueryRoleDto) {
    const { name, value, page, pageSize } = queryRoleDto;
    const [rows, meta] = await this.prismaService.client.role
      .paginate({
        where: { name: { contains: name }, value: { contains: value } },
        orderBy: { sort: 'asc' },
      })
      .withPages({ page, limit: pageSize, includePageCount: true });
    return { rows, ...meta };
  }

  findOne(id: number) {
    return this.prismaService.client.role.findUnique({
      where: { id },
      include: { menus: true },
    });
  }

  update(id: number, user: ActiveUserData, updateRoleDto: UpdateRoleDto) {
    const { menuIds, ...rest } = updateRoleDto;
    return this.prismaService.client.role.update({
      where: { id },
      data: {
        ...rest,
        updateBy: user.username,
        menus: { connect: menuIds?.map((id) => ({ id })) },
      },
    });
  }

  remove(id: number) {
    return this.prismaService.client.role.delete({ where: { id } });
  }
}
