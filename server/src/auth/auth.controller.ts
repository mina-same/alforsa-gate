import { Controller, Post, Get, Body, Req, Res, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email & password' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, user } = await this.authService.login(dto, res);
    // data.data.accessToken & data.data.user — matches client authService + api.ts interceptor
    return { success: true, message: 'Login successful', data: { accessToken, user } };
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    const { accessToken } = await this.authService.refresh(token, res);
    // data.data.accessToken — matches api.ts interceptor
    return { success: true, data: { accessToken } };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout current user' })
  async logout(@CurrentUser('_id') userId: string, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(userId, res);
    return { success: true, message: 'Logged out successfully' };
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  async getMe(@CurrentUser('_id') userId: string) {
    const user = await this.authService.getMe(userId);
    // data.data.user — matches client authService
    return { success: true, data: { user } };
  }

  @Post('create-admin')
  @Roles('superadmin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create admin user (superadmin only)' })
  async createAdmin(@Body() dto: CreateAdminDto) {
    const user = await this.authService.createAdmin(dto);
    return { success: true, message: 'Admin created', data: user };
  }
}
