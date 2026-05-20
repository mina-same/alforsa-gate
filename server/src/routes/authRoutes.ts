import { Router } from 'express';
import { login, logout, refresh, getMe, createAdmin } from '../controllers/authController';
import { protect, requireRole } from '../middleware/auth';

const router = Router();

router.post('/login',        login);
router.post('/refresh',      refresh);
router.post('/logout',       protect, logout);
router.get('/me',            protect, getMe);
router.post('/create-admin', protect, requireRole('superadmin'), createAdmin);

export default router;
