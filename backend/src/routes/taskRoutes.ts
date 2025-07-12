import express from 'express';
import { 
  generateTasks, 
  getTaskAnalytics, 
  testScoringAlgorithm, 
  getTaskHistory 
} from '../controllers/taskController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All task routes require authentication
router.use(protect);

// Main task generation endpoint
router.post('/generate', generateTasks);

// Analytics and insights
router.get('/analytics', getTaskAnalytics);
router.get('/history', getTaskHistory);

// Testing and debugging
router.post('/test-scoring', testScoringAlgorithm);

export default router; 