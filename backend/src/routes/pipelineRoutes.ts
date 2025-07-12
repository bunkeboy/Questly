import express from 'express';
import { 
  getPipeline, 
  getHealthScores, 
  updatePipeline, 
  getPipelineStats 
} from '../controllers/pipelineController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All pipeline routes require authentication
router.use(protect);

router.get('/', getPipeline);
router.get('/health', getHealthScores);
router.get('/stats', getPipelineStats);
router.put('/', updatePipeline);

export default router; 