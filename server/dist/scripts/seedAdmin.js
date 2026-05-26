"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const seed = async () => {
    await mongoose_1.default.connect(process.env.MONGODB_URI);
    const existing = await User_1.default.findOne({ email: 'admin@example.com' });
    if (existing) {
        console.log('Admin already exists — updating password...');
        existing.password = 'Admin@1234';
        await existing.save();
        console.log('Password updated.');
    }
    else {
        await User_1.default.create({
            name: 'Admin',
            email: 'admin@example.com',
            password: 'Admin@1234',
            role: 'superadmin',
        });
        console.log('Admin created.');
    }
    console.log('  Email:    admin@example.com');
    console.log('  Password: Admin@1234');
    await mongoose_1.default.disconnect();
};
seed().catch((err) => { console.error(err); process.exit(1); });
//# sourceMappingURL=seedAdmin.js.map