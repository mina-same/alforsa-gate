"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.toggleUserActive = exports.updateUser = exports.createUser = exports.getUser = exports.listUsers = void 0;
const User_1 = require("../models/User");
const errorHandler_1 = require("../middleware/errorHandler");
const listUsers = async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
        const skip = (page - 1) * limit;
        const filter = {};
        if (req.query.role)
            filter.role = req.query.role;
        if (req.query.isActive)
            filter.isActive = req.query.isActive === 'true';
        if (req.query.search) {
            const re = new RegExp(String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            filter.$or = [{ name: re }, { email: re }];
        }
        const [users, total] = await Promise.all([
            User_1.default.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            User_1.default.countDocuments(filter),
        ]);
        res.json({
            success: true,
            data: {
                users,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.listUsers = listUsers;
const getUser = async (req, res, next) => {
    try {
        const user = await User_1.default.findById(req.params.id);
        if (!user)
            throw new errorHandler_1.AppError('User not found', 404);
        res.json({ success: true, data: { user } });
    }
    catch (err) {
        next(err);
    }
};
exports.getUser = getUser;
const createUser = async (req, res, next) => {
    try {
        const { name, email, password, role = 'admin' } = req.body;
        if (!name || !email || !password) {
            throw new errorHandler_1.AppError('name, email and password are required', 400);
        }
        const existing = await User_1.default.findOne({ email });
        if (existing)
            throw new errorHandler_1.AppError('Email already in use', 409);
        const user = await User_1.default.create({ name, email, password, role });
        res.status(201).json({
            success: true,
            message: 'User created',
            data: { user },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.createUser = createUser;
const updateUser = async (req, res, next) => {
    try {
        const { name, email, role, password } = req.body;
        const user = await User_1.default.findById(req.params.id).select('+password');
        if (!user)
            throw new errorHandler_1.AppError('User not found', 404);
        if (role && role !== 'superadmin' && user.role === 'superadmin') {
            const superadminCount = await User_1.default.countDocuments({ role: 'superadmin', isActive: true });
            if (superadminCount <= 1) {
                throw new errorHandler_1.AppError('Cannot change the role of the last active superadmin', 400);
            }
        }
        if (name)
            user.name = name;
        if (email)
            user.email = email;
        if (role)
            user.role = role;
        if (password)
            user.password = password;
        await user.save();
        res.json({ success: true, message: 'User updated', data: { user } });
    }
    catch (err) {
        next(err);
    }
};
exports.updateUser = updateUser;
const toggleUserActive = async (req, res, next) => {
    try {
        const user = await User_1.default.findById(req.params.id);
        if (!user)
            throw new errorHandler_1.AppError('User not found', 404);
        if (String(user._id) === String(req.user?._id)) {
            throw new errorHandler_1.AppError('You cannot deactivate your own account', 400);
        }
        if (user.role === 'superadmin' && user.isActive) {
            const activeCount = await User_1.default.countDocuments({ role: 'superadmin', isActive: true });
            if (activeCount <= 1) {
                throw new errorHandler_1.AppError('Cannot deactivate the last active superadmin', 400);
            }
        }
        user.isActive = !user.isActive;
        await user.save({ validateBeforeSave: false });
        res.json({
            success: true,
            message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
            data: { user },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.toggleUserActive = toggleUserActive;
const deleteUser = async (req, res, next) => {
    try {
        const user = await User_1.default.findById(req.params.id);
        if (!user)
            throw new errorHandler_1.AppError('User not found', 404);
        if (String(user._id) === String(req.user?._id)) {
            throw new errorHandler_1.AppError('You cannot delete your own account', 400);
        }
        if (user.role === 'superadmin') {
            const count = await User_1.default.countDocuments({ role: 'superadmin' });
            if (count <= 1)
                throw new errorHandler_1.AppError('Cannot delete the last superadmin', 400);
        }
        await user.deleteOne();
        res.json({ success: true, message: 'User deleted' });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=userController.js.map