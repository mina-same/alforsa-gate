"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdmin = exports.getMe = exports.logout = exports.refresh = exports.login = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const User_1 = require("../models/User");
const errorHandler_1 = require("../middleware/errorHandler");
const COOKIE_OPTS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
};
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new errorHandler_1.AppError('Email and password are required', 400);
        }
        const user = await User_1.default.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            throw new errorHandler_1.AppError('Invalid credentials', 401);
        }
        if (!user.isActive) {
            throw new errorHandler_1.AppError('Account is deactivated', 403);
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        user.lastLogin = new Date();
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
            .status(200)
            .json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                accessToken,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.login = login;
const refresh = async (req, res, next) => {
    try {
        const token = req.cookies?.refreshToken || req.body.refreshToken;
        if (!token)
            throw new errorHandler_1.AppError('No refresh token', 401);
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User_1.default.findById(decoded.id).select('+refreshToken');
        if (!user || user.refreshToken !== token || !user.isActive) {
            throw new errorHandler_1.AppError('Invalid refresh token', 401);
        }
        const accessToken = user.generateAccessToken();
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
    }
    catch (err) {
        next(err);
    }
};
exports.refresh = refresh;
const logout = async (req, res, next) => {
    try {
        if (req.user) {
            await User_1.default.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
        }
        res
            .clearCookie('accessToken')
            .clearCookie('refreshToken')
            .json({ success: true, message: 'Logged out successfully' });
    }
    catch (err) {
        next(err);
    }
};
exports.logout = logout;
const getMe = async (req, res, next) => {
    try {
        const user = await User_1.default.findById(req.user?._id);
        if (!user)
            throw new errorHandler_1.AppError('User not found', 404);
        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    lastLogin: user.lastLogin,
                    createdAt: user.createdAt,
                },
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getMe = getMe;
const createAdmin = async (req, res, next) => {
    try {
        const { name, email, password, role = 'admin' } = req.body;
        if (!name || !email || !password) {
            throw new errorHandler_1.AppError('name, email and password are required', 400);
        }
        const existing = await User_1.default.findOne({ email });
        if (existing)
            throw new errorHandler_1.AppError('Email already registered', 409);
        const user = await User_1.default.create({ name, email, password, role });
        res.status(201).json({
            success: true,
            message: 'Admin created',
            data: {
                user: { id: user._id, name: user.name, email: user.email, role: user.role },
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.createAdmin = createAdmin;
//# sourceMappingURL=authController.js.map