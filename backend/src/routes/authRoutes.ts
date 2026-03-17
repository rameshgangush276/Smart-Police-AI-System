import { Router } from 'express';
import { login, seedOfficer, getProfile, updateProfile } from '../controllers/authController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.post('/login', login);
// In a real app, seeding should be secured or removed. We'll leave it for testing.
router.post('/seed', seedOfficer);
router.get('/profile', authenticateJWT, getProfile);
router.put('/profile', authenticateJWT, updateProfile);

export default router;
