"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tourController_1 = require("../controllers/tourController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/slug/:slug', tourController_1.getTourBySlug);
router.use(auth_1.protect);
router.get('/stats', (0, auth_1.requireRole)('admin', 'superadmin'), tourController_1.getTourStats);
router.get('/', (0, auth_1.requireRole)('admin', 'superadmin'), tourController_1.getTours);
router.get('/:id', (0, auth_1.requireRole)('admin', 'superadmin'), tourController_1.getTourById);
router.post('/', (0, auth_1.requireRole)('admin', 'superadmin'), tourController_1.createTour);
router.put('/:id', (0, auth_1.requireRole)('admin', 'superadmin'), tourController_1.updateTour);
router.delete('/:id', (0, auth_1.requireRole)('superadmin'), tourController_1.deleteTour);
router.patch('/:id/toggle-active', (0, auth_1.requireRole)('admin', 'superadmin'), tourController_1.toggleActive);
router.patch('/:id/toggle-featured', (0, auth_1.requireRole)('admin', 'superadmin'), tourController_1.toggleFeatured);
exports.default = router;
//# sourceMappingURL=tourRoutes.js.map