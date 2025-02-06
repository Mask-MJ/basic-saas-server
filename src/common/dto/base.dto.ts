import { Transform, Type } from 'class-transformer';
import { IsNumber, IsPositive, IsString } from 'class-validator';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import dayjs from 'dayjs';

export class PaginateDto {
  /**
   * 页码
   * @example 1
   */
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  @ApiProperty({ required: false })
  page: number = 1;

  /**
   * 每页数量
   * @example 10
   */
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  @ApiProperty({ required: false })
  pageSize: number = 10;
}

export class Paginate<TData> extends PaginateDto {
  @ApiProperty({ required: false })
  total: number;

  @ApiProperty({ required: false })
  rows: TData[];
}

export class TimeDto {
  /**
   * 开始时间
   * @example 1714752000000
   */
  @ApiProperty({ required: false, type: 'number' })
  @Type(() => Number)
  @Transform(({ value }) => dayjs(value).format())
  // 时间戳类型
  beginTime: Date;

  /**
   * 结束时间
   * @example 1716048000000
   */
  @ApiProperty({ required: false, type: 'number' })
  @Type(() => Number)
  @Transform(({ value }) => dayjs(value).format())
  endTime: Date;
}

export class BaseDto extends IntersectionType(PaginateDto, TimeDto) {}

export class uploadDto {
  @IsString()
  fileName: string;
  file: Express.Multer.File;
}
