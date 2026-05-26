"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const db_1 = __importDefault(require("./config/db"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const tourRoutes_1 = __importDefault(require("./routes/tourRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// ==================== SECURITY ====================
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests, please try again later.',
});
app.use('/api/', limiter);
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many login attempts, please try again in 15 minutes.',
});
app.use('/api/auth/login', authLimiter);
// ==================== PARSERS ====================
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
// ==================== LOGGING ====================
if (process.env.NODE_ENV !== 'test') {
    app.use((0, morgan_1.default)(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}
// ==================== HEALTH CHECK ====================
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', env: process.env.NODE_ENV, timestamp: new Date().toISOString() });
});
// ==================== ROUTES ====================
app.use('/api/auth', authRoutes_1.default);
app.use('/api/tours', tourRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
// ==================== ERROR HANDLING ====================
app.use(errorHandler_1.notFound);
app.use(errorHandler_1.errorHandler);
// ==================== BOOT ====================
const start = async () => {
    try {
        await (0, db_1.default)();
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT} [${process.env.NODE_ENV}]`);
        });
    }
    catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};
start();
exports.default = app;
//# sourceMappingURL=index.js.map