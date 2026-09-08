import { Router } from 'express';
import { getApps, createApp, deployApp, startApp, stopApp, deleteApp } from '../controllers/appController';
import { authenticate } from '../middlewares/auth';
import { requireRole } from '../middlewares/roles';

const router = Router();

router.use(authenticate);
router.use(requireRole(['OWNER', 'ADMIN']));

router.get('/', getApps);
router.post('/', createApp);
router.post('/:id/deploy', deployApp);
router.post('/:id/start', startApp);
router.post('/:id/stop', stopApp);
router.delete('/:id', deleteApp);

export default router;
