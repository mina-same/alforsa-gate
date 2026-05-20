import { Response, NextFunction } from 'express';
import User from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// GET /api/users
export const listUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip  = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (req.query.role)     filter.role     = req.query.role;
    if (req.query.isActive) filter.isActive  = req.query.isActive === 'true';
    if (req.query.search) {
      const re = new RegExp(String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: re }, { email: re }];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id
export const getUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

// POST /api/users  (superadmin only)
export const createUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role = 'admin' } = req.body;

    if (!name || !email || !password) {
      throw new AppError('name, email and password are required', 400);
    }

    const existing = await User.findOne({ email });
    if (existing) throw new AppError('Email already in use', 409);

    const user = await User.create({ name, email, password, role });

    res.status(201).json({
      success: true,
      message: 'User created',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/:id  (superadmin only)
export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, email, role, password } = req.body;
    const user = await User.findById(req.params.id).select('+password');
    if (!user) throw new AppError('User not found', 404);

    // Prevent demoting the last superadmin
    if (role && role !== 'superadmin' && user.role === 'superadmin') {
      const superadminCount = await User.countDocuments({ role: 'superadmin', isActive: true });
      if (superadminCount <= 1) {
        throw new AppError('Cannot change the role of the last active superadmin', 400);
      }
    }

    if (name)     user.name  = name;
    if (email)    user.email = email;
    if (role)     user.role  = role;
    if (password) user.password = password;

    await user.save();

    res.json({ success: true, message: 'User updated', data: { user } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/:id/toggle-active  (superadmin only)
export const toggleUserActive = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new AppError('User not found', 404);

    // Prevent deactivating self
    if (String(user._id) === String(req.user?._id)) {
      throw new AppError('You cannot deactivate your own account', 400);
    }

    // Prevent deactivating the last superadmin
    if (user.role === 'superadmin' && user.isActive) {
      const activeCount = await User.countDocuments({ role: 'superadmin', isActive: true });
      if (activeCount <= 1) {
        throw new AppError('Cannot deactivate the last active superadmin', 400);
      }
    }

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:id  (superadmin only)
export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new AppError('User not found', 404);

    if (String(user._id) === String(req.user?._id)) {
      throw new AppError('You cannot delete your own account', 400);
    }

    if (user.role === 'superadmin') {
      const count = await User.countDocuments({ role: 'superadmin' });
      if (count <= 1) throw new AppError('Cannot delete the last superadmin', 400);
    }

    await user.deleteOne();

    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};
