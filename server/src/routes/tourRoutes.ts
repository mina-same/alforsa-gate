import { Router } from 'express';
import {
  getTours,
  getTourById,
  getTourBySlug,
  createTour,
  updateTour,
  deleteTour,
  toggleActive,
  toggleFeatured,
  getTourStats,
} from '../controllers/tourController';
import { protect, requireRole } from '../middleware/auth';

const router = Router();

// Public
router.get('/slug/:slug', getTourBySlug);

// Protected (admin+)
router.use(protect);

router.get('/stats',    requireRole('admin', 'superadmin'), getTourStats);
router.get('/',         requireRole('admin', 'superadmin'), getTours);
router.get('/:id',      requireRole('admin', 'superadmin'), getTourById);
router.post('/',        requireRole('admin', 'superadmin'), createTour);
router.put('/:id',      requireRole('admin', 'superadmin'), updateTour);
router.delete('/:id',   requireRole('superadmin'),          deleteTour);
router.patch('/:id/toggle-active',   requireRole('admin', 'superadmin'), toggleActive);
router.patch('/:id/toggle-featured', requireRole('admin', 'superadmin'), toggleFeatured);

export default router;
