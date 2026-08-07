import { Controller, Post, Body, UseGuards, Request, Put } from '@nestjs/common';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

class LoginDto {
  @IsEmail()
  email: string;
  @IsString()
  password: string;
}

class ChangePasswordDto {
  @IsString()
  currentPassword: string;
  @IsString()
  @MinLength(8)
  newPassword: string;
}

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60_000 } }) // brute-force protection: 5 attempts/min/IP
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Put('change-password')
  changePassword(@Request() req, @Body() dto: ChangePasswordDto) {
    return this.auth.changePassword(req.user.id, dto.currentPassword, dto.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me')
  me(@Request() req) {
    return req.user;
  }
}
