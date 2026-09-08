import { Router } from 'express';
import { getTemplates, deployTemplate } from '../controllers/marketplaceController';
import { authenticate } from '../middlewares/auth';
import { requireRole } from '../middlewares/roles';

const router = Router();

router.use(authenticate);
router.use(requireRole(['OWNER', 'ADMIN']));

router.get('/templates', getTemplates);
router.post('/deploy', deployTemplate);

export default router;
