import express from 'express';
import { 
  getChallenges, 
  getDailyChallenges, 
  completeChallenge, 
  getCompletedChallenges 
} from '../controllers/challengeController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All challenge routes require authentication
router.use(protect);

router.get('/', getChallenges);
router.get('/daily', getDailyChallenges);
router.get('/completed', getCompletedChallenges);
router.post('/:id/complete', completeChallenge);

export default router; 