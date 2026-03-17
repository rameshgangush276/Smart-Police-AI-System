import { Router } from 'express';
import { generateDocument, getDocumentsByCase } from '../controllers/documentController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.post('/generate', authenticateJWT, generateDocument);
router.get('/case/:caseId', authenticateJWT, getDocumentsByCase);

export default router;
