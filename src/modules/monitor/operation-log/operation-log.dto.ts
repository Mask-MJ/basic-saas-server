import { PartialType, IntersectionType, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';
import { BaseDto } from 'src/common/dto/base.dto';
import type { BusinessType } from '@prisma/client';

export class CreateOperationLogDto {
  @IsString()
  title: string;

  @IsString()
  username: string;

  @IsNumber()
  @Type(() => Number)
  businessType: BusinessType;

  @IsString()
  module: string;

  @IsString()
  ip: string;
}

// export class QueryOperationLogDto extends PartialType(
//   IntersectionType(
//     PickType(CreateOperationLogDto, ['account', 'businessType', 'module']),
//     BaseDto,
//   ),
// ) {}
export class QueryOperationLogDto extends IntersectionType(
  PartialType(
    PickType(CreateOperationLogDto, [
      'title',
      'username',
      'businessType',
      'module',
      'ip',
    ]),
  ),
  BaseDto,
) {}
