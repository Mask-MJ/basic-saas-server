import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import type { ExtendedPrismaClient } from 'src/common/pagination/prisma.extension';
import { CreateUserDto, UpdateUserDto, QueryUserDto } from './user.dto';
import { ActiveUserData } from 'src/modules/iam/interfaces/active-user-data.interface';
import { HashingService } from 'src/modules/iam/hashing/hashing.service';
import { MinioService } from 'src/common/minio/minio.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

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
  private exclude<User extends Record<string, any>, Key extends keyof User>(
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

  async findSelf(id: number) {
    const user = await this.prismaService.client.user.findUniqueOrThrow({
      where: { id },
      include: {
        roles: { include: { menus: { include: { permissions: true } } } },
      },
    });
    const userWithoutPassword = this.exclude(user, ['password']);
    return {
      ...userWithoutPassword,
      roleIds: user.roles.map((role) => role.id),
    };
  }

  async findAll(queryUserDto: QueryUserDto) {
    const {
      username,
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
          username: { contains: username },
          nickname: { contains: nickname },
          email: { contains: email },
          phoneNumber: { contains: phoneNumber },
          createdAt: { gte: beginTime, lte: endTime },
        },
        include: { roles: true },
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
      include: { roles: true },
    });
    const userWithoutPassword = this.exclude(user, ['password']);
    return {
      ...userWithoutPassword,
      roleIds: user.roles.map((role) => role.id),
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

  async remove(user: ActiveUserData, id: number, ip?: string) {
    // 判断是否是管理员账号, 如果是管理员账号则不允许删除
    const userInfo = await this.prismaService.client.user.findUniqueOrThrow({
      where: { id },
    });
    if (userInfo.isAdmin) {
      throw new ConflictException('管理员账号不允许删除');
    }
    await this.prismaService.client.user.delete({ where: { id } });
    this.eventEmitter.emit('delete', {
      title: `删除ID为${id}, 账号为${userInfo.username}的用户`,
      businessType: 2,
      module: '用户管理',
      username: user.username,
      ip,
    });
    return '删除成功';
  }

  async uploadAvatar(user: ActiveUserData, file: Express.Multer.File) {
    await this.minioClient.uploadFile('avatar', file.originalname, file.buffer);
    const url = await this.minioClient.getUrl('avatar', file.originalname);
    return this.prismaService.client.user.update({
      where: { id: user.sub },
      data: { avatar: url },
    });
  }
}
