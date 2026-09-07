import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth';
import { getSystemStats, getAuditLogs } from '../controllers/systemController';

const router = Router();

router.use(authenticate);

router.get('/stats', requireRole(['SUPER_ADMIN', 'ADMIN']), getSystemStats);
router.get('/audit-logs', requireRole(['SUPER_ADMIN', 'ADMIN']), getAuditLogs);

export default router;
