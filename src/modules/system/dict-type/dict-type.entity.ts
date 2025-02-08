import { DictType } from '@prisma/client';
export class DictTypeEntity implements DictType {
  id: number;
  name: string;
  value: string;
  sort: number;
  createBy: string;
  updateBy: string | null;
  remark: string;
  createdAt: Date;
  updatedAt: Date;
}
