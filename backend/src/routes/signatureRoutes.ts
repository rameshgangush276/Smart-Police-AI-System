import { Router } from 'express';
import { internalSign, initiateAadhaarSign, verifyAadhaarOTP } from '../controllers/signatureController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.post('/internal', authenticateJWT, internalSign);
router.post('/aadhaar/initiate', authenticateJWT, initiateAadhaarSign);
router.post('/aadhaar/verify', authenticateJWT, verifyAadhaarOTP);

export default router;
