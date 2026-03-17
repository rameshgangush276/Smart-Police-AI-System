import { Router } from 'express';
import { getComplianceAlerts, scrutinizeChallan } from '../controllers/complianceController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.get('/alerts', authenticateJWT, getComplianceAlerts);
router.post('/scrutinize', authenticateJWT, scrutinizeChallan);

export default router;
