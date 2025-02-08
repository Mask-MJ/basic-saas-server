import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { BaseDto } from 'src/common/dto/base.dto';

export class CreateDictDataDto {
  /**
   * 字典数据名称
   * @example '性别'
   */
  @IsString()
  name: string;

  /**
   * 字典数据值
   * @example '1'
   */
  @IsString()
  value: string;

  /**
   * 排序
   * @example 1
   */
  @IsOptional()
  @IsNumber()
  sort?: number;

  /**
   * 类型 0: 配置 1: 参数 2: 诊断
   * @example '0'
   */
  @IsString()
  @IsOptional()
  type?: string;

  /**
   * 状态 false: 禁用 true: 启用
   * @example true
   */
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  status?: number = 1;

  /**
   * 字典类型ID
   * @example 1
   */
  @IsNumber()
  @Type(() => Number)
  dictTypeId: number;

  /**
   * 备注
   * @example '备注'
   */
  @IsString()
  @IsOptional()
  remark?: string;

  /**
   * 父级菜单id
   * @example 0
   */
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  parentId?: number;

  /**
   * treeId
   * @example 1
   */
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  treeId?: number;
}

export class QueryDictDataDto extends IntersectionType(
  PartialType(PickType(CreateDictDataDto, ['name', 'value', 'dictTypeId'])),
  BaseDto,
) {
  /**
   * 字典类型值
   * @example 'chart'
   */
  @IsString()
  @IsOptional()
  dictTypeValue?: string;
}

export class UpdateDictDataDto extends PartialType(CreateDictDataDto) {
  @IsNumber()
  id: number;
}
