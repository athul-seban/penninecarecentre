import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permissions.decorator';
import { RolesService } from './roles.service';
import { PERMISSION_KEYS, PERMISSION_LABELS } from './permissions';

class CreateRoleDto {
  @IsString()
  @MaxLength(60)
  name: string;

  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}

class UpdateRoleDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  name?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}

@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermission('users')
@Controller('roles')
export class RolesController {
  constructor(private roles: RolesService) {}

  @Get('permissions')
  listPermissionKeys() {
    return PERMISSION_KEYS.map((key) => ({ key, label: PERMISSION_LABELS[key] }));
  }

  @Get()
  findAll() {
    return this.roles.findAll();
  }

  @Post()
  create(@Body() dto: CreateRoleDto) {
    return this.roles.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.roles.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roles.remove(id);
  }
}
