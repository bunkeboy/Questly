import express from 'express';
import { 
  getTodaysPlan,
  generateDailyPlan,
  updateTaskProgress,
  completeTask,
  getStreakInfo,
  getTaskAnalytics,
  evaluateDailyCompletion,
  getTaskHistory,
  swapTaskSelection
} from '../controllers/dailyTaskController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes are protected (require authentication)
router.use(protect);

// Daily Task Plan Routes
router.get('/today', getTodaysPlan);
router.post('/generate', generateDailyPlan);

// Task Progress Routes
router.put('/:taskId/progress', updateTaskProgress);
router.post('/:taskId/complete', completeTask);

// Task Management Routes
router.post('/swap', swapTaskSelection);
router.post('/evaluate', evaluateDailyCompletion);

// Analytics and History Routes
router.get('/streak', getStreakInfo);
router.get('/analytics', getTaskAnalytics);
router.get('/history', getTaskHistory);

export default router; 