"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/login', authController_1.login);
router.post('/refresh', authController_1.refresh);
router.post('/logout', auth_1.protect, authController_1.logout);
router.get('/me', auth_1.protect, authController_1.getMe);
router.post('/create-admin', auth_1.protect, (0, auth_1.requireRole)('superadmin'), authController_1.createAdmin);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map