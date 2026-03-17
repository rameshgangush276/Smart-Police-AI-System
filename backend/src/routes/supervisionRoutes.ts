import { Router } from 'express';
import { getOfficerWorkload } from '../controllers/supervisionController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.get('/workload', authenticateJWT, getOfficerWorkload);

export default router;
