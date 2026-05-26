"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All user routes require authentication
router.use(auth_1.protect);
// Any authenticated admin can list/view users
router.get('/', userController_1.listUsers);
router.get('/:id', userController_1.getUser);
// Mutating operations restricted to superadmin
router.post('/', (0, auth_1.requireRole)('superadmin'), userController_1.createUser);
router.put('/:id', (0, auth_1.requireRole)('superadmin'), userController_1.updateUser);
router.patch('/:id/toggle-active', (0, auth_1.requireRole)('superadmin'), userController_1.toggleUserActive);
router.delete('/:id', (0, auth_1.requireRole)('superadmin'), userController_1.deleteUser);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map