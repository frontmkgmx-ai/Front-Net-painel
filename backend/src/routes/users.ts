import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth';
import { listUsers, createUser, deleteUser } from '../controllers/usersController';

const router = Router();

router.use(authenticate);
router.use(requireRole(['SUPER_ADMIN', 'ADMIN'])); // Only admins manage users

router.get('/', listUsers);
router.post('/', createUser);
router.delete('/:id', deleteUser);

export default router;
