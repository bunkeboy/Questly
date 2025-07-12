import express from 'express';
import { 
  getTeamOverview, 
  getTeamMembers, 
  getTeamStats, 
  getTeamLeaderboard 
} from '../controllers/teamController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// All team routes require authentication
router.use(protect);

router.get('/overview', authorize('team_leader', 'admin'), getTeamOverview);
router.get('/members', authorize('team_leader', 'admin'), getTeamMembers);
router.get('/stats', authorize('team_leader', 'admin'), getTeamStats);
router.get('/leaderboard', getTeamLeaderboard);

export default router; 