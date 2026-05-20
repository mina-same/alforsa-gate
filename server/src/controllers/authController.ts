import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
};

// POST /api/auth/login
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 403);
    }

    const accessToken  = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Persist refresh token hash
    user.refreshToken = refreshToken;
    user.lastLogin    = new Date();
    await user.save({ validateBeforeSave: false });

    res
      .cookie('accessToken', accessToken, {
        ...COOKIE_OPTS,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
      })
      .cookie('refreshToken', refreshToken, {
        ...COOKIE_OPTS,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30d
      })
      .status(200)
      .json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id:    user._id,
            name:  user.name,
            email: user.email,
            role:  user.role,
          },
          accessToken,
        },
      });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/refresh
export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refreshToken || req.body.refreshToken;
    if (!token) throw new AppError('No refresh token', 401);

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as { id: string };
    const user    = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token || !user.isActive) {
      throw new AppError('Invalid refresh token', 401);
    }

    const accessToken  = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res
      .cookie('accessToken', accessToken, {
        ...COOKIE_OPTS,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .cookie('refreshToken', refreshToken, {
        ...COOKIE_OPTS,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .json({ success: true, data: { accessToken } });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
    }

    res
      .clearCookie('accessToken')
      .clearCookie('refreshToken')
      .json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) throw new AppError('User not found', 404);

    res.json({
      success: true,
      data: {
        user: {
          id:        user._id,
          name:      user.name,
          email:     user.email,
          role:      user.role,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/create-admin  (superadmin only — used to seed first admin)
export const createAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role = 'admin' } = req.body;

    if (!name || !email || !password) {
      throw new AppError('name, email and password are required', 400);
    }

    const existing = await User.findOne({ email });
    if (existing) throw new AppError('Email already registered', 409);

    const user = await User.create({ name, email, password, role });

    res.status(201).json({
      success: true,
      message: 'Admin created',
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (err) {
    next(err);
  }
};
