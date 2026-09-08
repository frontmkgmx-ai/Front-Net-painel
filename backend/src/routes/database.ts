import { Router } from 'express';
import { getDatabases, createDatabase } from '../controllers/databaseController';
import { authenticate } from '../middlewares/auth';
import { requireRole } from '../middlewares/roles';

const router = Router();

router.use(authenticate);
router.use(requireRole(['OWNER', 'ADMIN']));

router.get('/', getDatabases);
router.post('/', createDatabase);

export default router;
