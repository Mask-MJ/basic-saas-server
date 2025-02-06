import { Transform, Type } from 'class-transformer';
import { IsNumber, IsPositive, IsString } from 'class-validator';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import dayjs from 'dayjs';

export class PaginateDto<TData> {
  /**
   * 页码
   * @example 1
   */
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  page: number = 1;

  /**
   * 每页数量
   * @example 10
   */
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  pageSize: number = 10;

  total: number;

  @ApiProperty()
  rows: TData[];
}

export class TimeDto {
  /**
   * 开始时间
   * @example 1714752000000
   */
  @Type(() => Number)
  @Transform(({ value }: { value: number }) => dayjs(value).format(), {
    toClassOnly: true,
  })
  beginTime: Date;

  /**
   * 结束时间
   * @example 1716048000000
   */
  @Type(() => Number)
  @Transform(({ value }: { value: number }) => dayjs(value).format(), {
    toClassOnly: true,
  })
  endTime: Date;
}

export class BaseDto extends IntersectionType(PaginateDto, TimeDto) {}

export class uploadDto {
  @IsString()
  fileName: string;
  file: Express.Multer.File;
}
