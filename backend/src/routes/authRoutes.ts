import express from 'express';
import { register, login, logout, getProfile, updateProfile, connectFub, disconnectFub } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/connect-fub', protect, connectFub);
router.post('/disconnect-fub', protect, disconnectFub);

export default router; 