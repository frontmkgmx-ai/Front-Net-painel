import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth';
import { getContainers, getContainerInfo, getContainerStats, startContainer, stopContainer, restartContainer, getContainerLogs } from '../controllers/dockerController';

const router = Router();
router.use(authenticate);

// We need a specific permission or role for Docker management. Admin and Owner should have it.
const dockerRoles = ['SUPER_ADMIN', 'ADMIN', 'OWNER', 'OPERATOR'];

router.get('/containers', requireRole(dockerRoles), getContainers);
router.get('/containers/:id', requireRole(dockerRoles), getContainerInfo);
router.get('/containers/:id/stats', requireRole(dockerRoles), getContainerStats);
router.get('/containers/:id/logs', requireRole(dockerRoles), getContainerLogs);
router.post('/containers/:id/start', requireRole(dockerRoles), startContainer);
router.post('/containers/:id/stop', requireRole(dockerRoles), stopContainer);
router.post('/containers/:id/restart', requireRole(dockerRoles), restartContainer);

export default router;
