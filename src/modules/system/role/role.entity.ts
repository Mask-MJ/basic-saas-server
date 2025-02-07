import { Role } from '@prisma/client';
import { UserEntity } from '../user/user.entity';

export class RoleEntity implements Role {
  id: number;
  name: string;
  value: string;
  sort: number;
  remark: string;
  createBy: string;
  updateBy: string;
  createdAt: Date;
  updatedAt: Date;
  menus: number[];
  users: UserEntity[];
}
