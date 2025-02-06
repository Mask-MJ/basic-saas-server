import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto, QueryRoleDto, UpdateRoleDto } from './role.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';
import { RoleEntity } from './role.entity';
import { ActiveUser } from 'src/modules/iam/decorators/active-user.decorator';
import { ActiveUserData } from 'src/modules/iam/interfaces/active-user-data.interface';
import { ApiPaginatedResponse } from 'src/common/response/paginated.response';
import { Permissions } from 'src/modules/iam/authorization/decorators/permissions.decorator';

@ApiTags('权限管理')
@ApiBearerAuth('bearer')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @ApiOperation({ summary: '创建权限' })
  @ApiCreatedResponse({ type: RoleEntity })
  @Permissions('system:role:create')
  create(
    @ActiveUser() user: ActiveUserData,
    @Body() createRoleDto: CreateRoleDto,
  ) {
    return this.roleService.create(user, createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: '获取权限列表' })
  @ApiPaginatedResponse(RoleEntity)
  @Permissions('system:role:query')
  findAll(@Query() queryRoleDto: QueryRoleDto) {
    return this.roleService.findAll(queryRoleDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取权限详情' })
  @ApiOkResponse({ type: RoleEntity })
  @Permissions('system:role:query')
  findOne(@Param('id') id: number) {
    return this.roleService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新权限' })
  @ApiOkResponse({ type: RoleEntity })
  @Permissions('system:role:update')
  update(
    @Param('id') id: number,
    @ActiveUser() user: ActiveUserData,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.roleService.update(id, user, updateRoleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除权限' })
  @Permissions('system:role:delete')
  remove(@Param('id') id: number) {
    return this.roleService.remove(id);
  }
}
