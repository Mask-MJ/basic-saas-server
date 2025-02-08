import { OperationLog, BusinessType } from '@prisma/client';

export class OperationLogEntity implements OperationLog {
  id: number;
  title: string;
  businessType: BusinessType;
  module: string;
  username: string;
  ip: string;
  address: string;
  createdAt: Date;
}
