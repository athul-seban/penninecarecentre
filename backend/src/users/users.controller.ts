import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permissions.decorator';
import { UsersService } from './users.service';

class CreateUserDto {
  @IsString()
  @MaxLength(150)
  name: string;

  @IsEmail()
  @MaxLength(200)
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  role: string;
}

class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsString()
  role?: string;
}

@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermission('users')
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get()
  findAll() {
    return this.users.findAllSafe();
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.users.createUser(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.users.updateUser(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.users.removeUser(id, req.user.id);
  }
}
