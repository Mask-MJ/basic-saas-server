import { DictData } from '@prisma/client';
export class DictDataEntity implements DictData {
  id: number;
  name: string;
  value: string;
  sort: number;
  status: number;
  type: string;
  cnTitle: string | null;
  enTitle: string | null;
  isChart: boolean;
  chartType: string;
  upperLimit: string | null;
  lowerLimit: string | null;
  dictTypeId: number;
  treeId: number | null;
  createBy: string;
  updateBy: string | null;
  remark: string;
  createdAt: Date;
  updatedAt: Date;
}
