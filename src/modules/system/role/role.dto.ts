import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseDto } from 'src/common/dto/base.dto';

export class CreateRoleDto {
  /**
   * 权限名称
   * @example '管理员'
   */
  @IsString()
  name: string;
  /**
   * 权限值
   * @example 'admin'
   */
  @IsString()
  value: string;
  /**
   * 排序
   * @example 0
   */
  @IsNumber()
  @Type(() => Number)
  sort?: number = 0;
  /**
   * 备注
   * @example '备注'
   */
  @IsString()
  @IsOptional()
  remark?: string;
  /**
   * 菜单ID
   * @example [1, 2]
   */
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  menuIds: number[] = [];
  /**
   * 工厂ID
   * @example [1, 2]
   */
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  factoryIds: number[] = [];
}
export class QueryRoleDto extends PartialType(
  IntersectionType(PickType(CreateRoleDto, ['name', 'value']), BaseDto),
) {}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @IsNumber()
  id: number;
}
