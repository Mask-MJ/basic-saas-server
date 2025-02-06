import { Role } from '@prisma/client';

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
  menu: number[];
  user: number[];
}
