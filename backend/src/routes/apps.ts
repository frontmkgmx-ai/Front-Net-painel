import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth';
import { getProjects, createProject, getApplications, createApplication, deployApplication } from '../controllers/appController';

const router = Router();
router.use(authenticate);

const writeRoles = ['SUPER_ADMIN', 'ADMIN', 'OWNER', 'DEVELOPER'];

router.get('/projects', getProjects);
router.post('/projects', requireRole(writeRoles), createProject);

router.get('/', getApplications);
router.post('/', requireRole(writeRoles), createApplication);
router.post('/:id/deploy', requireRole(writeRoles), deployApplication);

export default router;
