import { Router } from 'express';
import { createComplaint, getMyComplaints, updateComplaint, uploadEvidence, searchComplaints, getInvestigationTimeline, addWitnessStatement, generateDocument, getComplaintById } from '../controllers/complaintController';
import { authenticateJWT } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Notice we apply authenticateJWT middleware to these routes
router.post('/register', authenticateJWT, createComplaint);
router.get('/my-cases', authenticateJWT, getMyComplaints);
router.get('/search', authenticateJWT, searchComplaints);
router.put('/:id', authenticateJWT, updateComplaint);
router.post('/:id/evidence', authenticateJWT, upload.single('file'), uploadEvidence);
router.get('/:id/timeline', authenticateJWT, getInvestigationTimeline);
router.post('/:id/statements', authenticateJWT, addWitnessStatement);
router.get('/:id', authenticateJWT, getComplaintById);
router.get('/:id/generate-document', authenticateJWT, generateDocument);

export default router;
