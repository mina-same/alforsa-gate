"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies?.accessToken) {
        token = req.cookies.accessToken;
    }
    if (!token) {
        res.status(401).json({ success: false, message: 'Not authorized, no token' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await User_1.default.findById(decoded.id).select('-password -refreshToken');
        if (!user || !user.isActive) {
            res.status(401).json({ success: false, message: 'User no longer exists or is inactive' });
            return;
        }
        req.user = user;
        next();
    }
    catch {
        res.status(401).json({ success: false, message: 'Token invalid or expired' });
    }
};
exports.protect = protect;
const requireRole = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        res.status(403).json({ success: false, message: 'Insufficient permissions' });
        return;
    }
    next();
};
exports.requireRole = requireRole;
//# sourceMappingURL=auth.js.map