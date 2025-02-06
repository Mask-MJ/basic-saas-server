import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import type { ExtendedPrismaClient } from 'src/common/pagination/prisma.extension';
import { CreateUserDto, UpdateUserDto, QueryUserDto } from './user.dto';
import { ActiveUserData } from 'src/modules/iam/interfaces/active-user-data.interface';
import { HashingService } from 'src/modules/iam/hashing/hashing.service';
import { MinioService } from 'src/common/minio/minio.service';
import { uploadDto } from 'src/common/dto/base.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import isoWeek from 'dayjs/plugin/isoWeek';

@Injectable()
export class UserService {
  constructor(
    @Inject('PrismaService')
    private readonly prismaService: CustomPrismaService<ExtendedPrismaClient>,
    private readonly hashingService: HashingService,
    private readonly minioClient: MinioService,
    @Inject(EventEmitter2) private readonly eventEmitter: EventEmitter2,
  ) {}

  // Exclude keys from user
  // https://www.prisma.io/docs/orm/prisma-client/queries/excluding-fields
  private exclude<User, Key extends keyof User>(
    user: User,
    keys: Key[],
  ): Omit<User, Key> {
    return Object.fromEntries(
      Object.entries(user).filter(([key]) => !keys.includes(key as Key)),
    ) as Omit<User, Key>;
  }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prismaService.client.user.findUnique({
      where: { username: createUserDto.username },
    });
    if (existingUser) {
      throw new ConflictException('账号已存在');
    }
    const { roleIds, ...rest } = createUserDto;
    return this.prismaService.client.user.create({
      data: {
        ...rest,
        password: await this.hashingService.hash(createUserDto.password),
        roles: { connect: roleIds?.map((id) => ({ id })) },
      },
    });
  }

  findSelf(id: number) {
    return this.prismaService.client.user.findUniqueOrThrow({
      where: { id },
      include: {
        roles: { include: { menus: { include: { permissions: true } } } },
      },
    });
  }

  async findCharts(user: ActiveUserData) {
    const factoryTotal = await this.prismaService.client.factory.count();
    const valveTotal = await this.prismaService.client.valve.count();
    const taskTotal = await this.prismaService.client.analysisTask.count();
    // 获取用户本周的创建的任务数量， 从周一开始，到周日结束
    // 根据当前时间获取本周周一到周日所有的日期
    dayjs.extend(isoWeek);
    const weekDays = Array.from({ length: 7 }).map((_, index) => {
      return dayjs().startOf('isoWeek').add(index, 'day').toISOString();
    });
    console.log(weekDays);
    const taskCount = await Promise.all(
      weekDays.map(async (day) => {
        const analysisTask =
          await this.prismaService.client.analysisTask.findMany({
            where: { createBy: user.account, createdAt: { gte: day } },
          });
        return {
          name: dayjs(day).locale('zh-cn').format('dddd'),
          value: analysisTask.length,
        };
      }),
    );
    // 查询最新的10条操作日志
    const operationLog = (
      await this.prismaService.client.operationLog.findMany({
        where: { account: user.account, module: '分析任务' },
        orderBy: { createdAt: 'desc' },
        take: 10,
      })
    ).map((log) => {
      return {
        ...log,
        createdAt: dayjs(log.createdAt).format('YYYY-MM-DD HH:mm:ss'),
      };
    });

    // 根据省份分组统计工厂数量
    const factoryProvinceGroup = (
      await this.prismaService.client.factory.groupBy({
        by: ['province'],
        _count: true,
        where: { NOT: { province: '' } },
      })
    ).map((item) => ({ name: item.province, value: item._count }));

    // 根据工厂行业分组统计工厂数量
    const factoryIndustryGroup = (
      await this.prismaService.client.factory.groupBy({
        by: ['industry'],
        _count: true,
        where: { NOT: { industry: '' } },
      })
    ).map((item) => ({ name: item.industry, value: item._count }));

    // 根据阀门品牌分组统计阀门数量
    const valveBrandGroup = (
      await this.prismaService.client.valve.groupBy({
        by: ['valveBrand'],
        _count: true,
        where: { NOT: { valveBrand: '' } },
      })
    ).map((item) => ({ name: item.valveBrand, value: item._count }));
    // 根据阀门型号分组统计阀门数量
    const valveModelGroup = (
      await this.prismaService.client.valve.groupBy({
        by: ['valveSeries'],
        _count: true,
        where: { NOT: { valveSeries: '' } },
      })
    ).map((item) => ({ name: item.valveSeries, value: item._count }));

    const positionerModelGroup = (
      await this.prismaService.client.valve.groupBy({
        by: ['positionerModel'],
        _count: true,
        where: { NOT: { positionerModel: '' } },
      })
    ).map((item) => ({ name: item.positionerModel, value: item._count }));

    return {
      factoryTotal,
      factoryProvinceGroup,
      factoryIndustryGroup,
      valveBrandGroup,
      valveModelGroup,
      positionerModelGroup,
      valveTotal,
      taskTotal,
      taskCount,
      operationLog,
    };
  }

  async findAll(queryUserDto: QueryUserDto) {
    const {
      account,
      nickname,
      email,
      phoneNumber,
      page,
      pageSize,
      beginTime,
      endTime,
    } = queryUserDto;

    const [rows, meta] = await this.prismaService.client.user
      .paginate({
        where: {
          account: { contains: account },
          nickname: { contains: nickname },
          email: { contains: email },
          phoneNumber: { contains: phoneNumber },
          createdAt: { gte: beginTime, lte: endTime },
        },
        include: { role: true },
      })
      .withPages({ limit: pageSize, page, includePageCount: true });

    return {
      rows: rows.map((user) => this.exclude(user, ['password'])),
      ...meta,
    };
  }

  async findOne(id: number) {
    const user = await this.prismaService.client.user.findUniqueOrThrow({
      where: { id },
      include: { role: true },
    });
    const userWithoutPassword = this.exclude(user, ['password']);
    return {
      ...userWithoutPassword,
      roleIds: user.role.map((role) => role.id),
    };
  }

  async changePassword(id: number, password: string, oldPassword: string) {
    const user = await this.prismaService.client.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new ConflictException('用户不存在');
    }
    // 判断是否是管理员权限 如果是管理员权限则不需要验证原密码
    if (user.isAdmin) {
      return this.prismaService.client.user.update({
        where: { id },
        data: { password: await this.hashingService.hash(password) },
      });
    }
    const isPasswordValid = await this.hashingService.compare(
      oldPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new ConflictException('原密码错误');
    }
    const newPassword = await this.hashingService.hash(password);
    return this.prismaService.client.user.update({
      where: { id },
      data: { password: newPassword },
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    const { roleIds, ...rest } = updateUserDto;
    return this.prismaService.client.user.update({
      where: { id },
      data: {
        ...rest,
        roles: { connect: roleIds?.map((id) => ({ id })) },
      },
    });
  }

  async remove(user: ActiveUserData, id: number, ip: string) {
    // 判断是否是管理员账号, 如果是管理员账号则不允许删除
    const userInfo = await this.prismaService.client.user.findUnique({
      where: { id },
    });
    if (userInfo.isAdmin) {
      throw new ConflictException('管理员账号不允许删除');
    }
    await this.prismaService.client.user.delete({ where: { id } });
    this.eventEmitter.emit('delete', {
      title: `删除ID为${id}, 账号为${userInfo.account}的用户`,
      businessType: 2,
      module: '用户管理',
      account: user.account,
      ip,
    });
    return '删除成功';
  }

  async uploadAvatar(
    user: ActiveUserData,
    file: Express.Multer.File,
    body: uploadDto,
  ) {
    console.log(body.fileName);
    await this.minioClient.uploadFile('avatar', file.originalname, file.buffer);
    const url = await this.minioClient.getUrl('avatar', file.originalname);
    return this.prismaService.client.user.update({
      where: { id: user.sub },
      data: { avatar: url },
    });
  }
}
