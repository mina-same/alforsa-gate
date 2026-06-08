import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { User, UserDocument } from './schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { CreateAdminDto } from './dto/create-admin.dto';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async login(dto: LoginDto, res: any) {
    const user = await this.userModel
      .findOne({ email: dto.email.toLowerCase() })
      .select('+password +refreshToken');

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await (user as any).comparePassword(dto.password);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    const accessToken = (user as any).generateAccessToken();
    const refreshToken = (user as any).generateRefreshToken();

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    this.setTokenCookies(res, accessToken, refreshToken);

    return { accessToken, user };
  }

  async refresh(token: string, res: any) {
    if (!token) throw new UnauthorizedException('Refresh token required');

    let payload: any;
    try {
      payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refresh_secret');
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userModel.findById(payload.sub).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessToken = (user as any).generateAccessToken();
    const refreshToken = (user as any).generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    this.setTokenCookies(res, accessToken, refreshToken);

    return { accessToken };
  }

  async logout(userId: string, res: any) {
    await this.userModel.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
  }

  async getMe(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async createAdmin(dto: CreateAdminDto) {
    const exists = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (exists) throw new ConflictException('Email already exists');

    const user = await this.userModel.create({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      role: dto.role || 'admin',
    });

    return user;
  }

  private setTokenCookies(res: any, accessToken: string, refreshToken: string) {
    const isProd = process.env.NODE_ENV === 'production';
    const cookieOpts = { httpOnly: true, secure: isProd, sameSite: 'strict' as const };

    res.cookie('accessToken', accessToken, {
      ...cookieOpts,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
    });
    res.cookie('refreshToken', refreshToken, {
      ...cookieOpts,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30d
    });
  }
}
