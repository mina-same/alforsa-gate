"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const connectDB = async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri)
        throw new Error('MONGODB_URI is not defined');
    mongoose_1.default.connection.on('connected', () => console.log('MongoDB connected'));
    mongoose_1.default.connection.on('disconnected', () => console.warn('MongoDB disconnected'));
    mongoose_1.default.connection.on('error', (err) => console.error('MongoDB error:', err));
    await mongoose_1.default.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    });
};
exports.default = connectDB;
//# sourceMappingURL=db.js.map