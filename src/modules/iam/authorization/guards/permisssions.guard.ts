import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUEST_USER_KEY } from 'src/modules/iam/iam.constants';
import { PrismaService } from 'nestjs-prisma';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { ActiveUserData } from 'src/modules/iam/interfaces/active-user-data.interface';
import { Permission } from '@prisma/client';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const contextPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!contextPermissions) return true;
    const user: ActiveUserData = context.switchToHttp().getRequest()[
      REQUEST_USER_KEY
    ];
    const userInfo = await this.prisma.user.findUniqueOrThrow({
      where: { id: user.sub },
      include: {
        roles: { include: { menus: { include: { permissions: true } } } },
      },
    });

    if (userInfo.isAdmin) return true;
    const menus = await this.prisma.menu.findMany({
      where: { users: { some: { id: user.sub } } },
      include: { permissions: true },
    });

    const permissionsName = menus
      .reduce((acc, menu) => acc.concat(menu.permissions), [] as Permission[])
      .map((p) => p.value);

    return contextPermissions.every((permission) =>
      permissionsName.includes(permission),
    );
  }
}
