import { Router } from 'express';
import { suggestSections, generateDraft, getSOP } from '../controllers/legalController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.post('/suggest-sections', authenticateJWT, suggestSections);
router.post('/generate-draft', authenticateJWT, generateDraft);
router.get('/sops/:category', authenticateJWT, getSOP);

export default router;
