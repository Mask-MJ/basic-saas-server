import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { TimeDto } from 'src/common/dto/base.dto';
export class CreateMenuDto {
  /**
   * 菜单名称
   * @example '系统管理'
   */
  @IsString()
  name: string;

  /**
   * 菜单路径
   * @example '/system'
   */
  @IsString()
  path: string;

  /**
   * 菜单图标
   * @example 'i-line-md:external-link'
   */
  @IsString()
  icon: string;

  /**
   * 是否隐藏
   * @example false
   */
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  hidden?: boolean = false;

  /**
   * 状态 0: 禁用 1: 启用
   * @example true
   */
  @IsOptional()
  @IsBoolean()
  @Type(() => Number)
  status?: number = 1;

  /**
   * 排序
   * @example 0
   */
  @IsNumber()
  @Type(() => Number)
  sort?: number = 0;

  /**
   * 父级菜单id
   * @example 0
   */
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  parentId?: number;
}

export class QueryMenuDto extends PartialType(
  IntersectionType(PickType(CreateMenuDto, ['name', 'hidden']), TimeDto),
) {}

export class UpdateMenuDto extends PartialType(CreateMenuDto) {
  @IsNumber()
  id: number;
}
