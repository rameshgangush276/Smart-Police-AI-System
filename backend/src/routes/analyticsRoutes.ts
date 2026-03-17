import { Router } from 'express';
import { getHeatmapData, getComplaintLinkages, naturalLanguageSearch, generateKnowledgeGraph, getHotspots, getOfficerStats } from '../controllers/analyticsController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Endpoints
router.get('/heatmaps', authenticateJWT, getHeatmapData);
router.get('/linkages/:id', authenticateJWT, getComplaintLinkages);
router.get('/nl-search', authenticateJWT, naturalLanguageSearch);
router.get('/hotspots', authenticateJWT, getHotspots);
router.get('/knowledge-graph', authenticateJWT, generateKnowledgeGraph);
router.get('/officer-stats', authenticateJWT, getOfficerStats);

export default router;
