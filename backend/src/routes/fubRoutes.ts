import express from 'express';
import { 
  syncFubData, 
  getFubContacts, 
  getFubDeals, 
  getFubActivities 
} from '../controllers/fubController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All FUB routes require authentication
router.use(protect);

router.post('/sync', syncFubData);
router.get('/contacts', getFubContacts);
router.get('/deals', getFubDeals);
router.get('/activities', getFubActivities);

export default router; 