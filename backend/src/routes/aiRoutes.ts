import express from 'express';
import { 
  getAiInsights, 
  generateDailyChallenges, 
  getPersonalizedTips, 
  predictGoalProgress 
} from '../controllers/aiController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All AI routes require authentication
router.use(protect);

router.get('/insights', getAiInsights);
router.post('/challenges/generate', generateDailyChallenges);
router.get('/tips', getPersonalizedTips);
router.get('/predictions', predictGoalProgress);

export default router; 