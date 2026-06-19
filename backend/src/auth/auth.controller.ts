import { Controller, Post, Body, UseGuards, Request, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
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

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Admin login — returns JWT token' })
  @ApiBody({ schema: { example: { email: 'admin@pinnineCare.com', password: 'Admin@123' } } })
  @ApiResponse({ status: 201, description: 'Returns JWT access_token and user info' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Put('change-password')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Change admin password' })
  changePassword(@Request() req, @Body() dto: ChangePasswordDto) {
    return this.auth.changePassword(req.user.id, dto.currentPassword, dto.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get current logged-in user' })
  me(@Request() req) {
    return req.user;
  }
}
