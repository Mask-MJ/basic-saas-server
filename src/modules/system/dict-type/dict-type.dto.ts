import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { BaseDto } from 'src/common/dto/base.dto';

export class CreateDictTypeDto {
  /**
   * 字典名称
   * @example '性别'
   */
  @IsString()
  name: string;

  /**
   * 字典值
   * @example '1'
   */
  @IsString()
  value: string;

  /**
   * 备注
   * @example '备注'
   */
  @IsString()
  @IsOptional()
  remark?: string;
}

export class QueryDictTypeDto extends IntersectionType(
  PartialType(PickType(CreateDictTypeDto, ['name', 'value'])),
  BaseDto,
) {}

export class UpdateDictTypeDto extends PartialType(CreateDictTypeDto) {
  @IsNumber()
  id: number;
}
