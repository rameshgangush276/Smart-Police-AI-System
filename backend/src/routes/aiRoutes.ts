import { Router } from 'express';
import { extractComplaintDetails, processComplaintDocument } from '../controllers/aiController';
import { authenticateJWT } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// AI Information Extraction
router.post('/auto-extract', authenticateJWT, extractComplaintDetails);

// Document Processing (Simulated OCR)
router.post('/ocr-process', authenticateJWT, upload.single('file'), processComplaintDocument);

export default router;
