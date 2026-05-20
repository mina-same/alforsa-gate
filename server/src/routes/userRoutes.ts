import { Router } from 'express';
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  toggleUserActive,
  deleteUser,
} from '../controllers/userController';
import { protect, requireRole } from '../middleware/auth';

const router = Router();

// All user routes require authentication
router.use(protect);

// Any authenticated admin can list/view users
router.get('/',    listUsers);
router.get('/:id', getUser);

// Mutating operations restricted to superadmin
router.post('/',                    requireRole('superadmin'), createUser);
router.put('/:id',                  requireRole('superadmin'), updateUser);
router.patch('/:id/toggle-active',  requireRole('superadmin'), toggleUserActive);
router.delete('/:id',               requireRole('superadmin'), deleteUser);

export default router;
