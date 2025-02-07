import { ApiProperty } from '@nestjs/swagger';
import { Menu } from '@prisma/client';
export class MenuEntity implements Menu {
  id: number;
  name: string;
  path: string;
  icon: string;
  hidden: boolean;
  status: number;
  sort: number;
  parentId: number | null;

  @ApiProperty({ type: () => [MenuEntity] })
  children: MenuEntity[];

  remark: string;
  createBy: string;
  updateBy: string;
  createdAt: Date;
  updatedAt: Date;
}
