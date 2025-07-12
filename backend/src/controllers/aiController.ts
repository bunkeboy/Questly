import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import Challenge from '../models/Challenge';
import Pipeline from '../models/Pipeline';
import aiService from '../services/aiService';

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

// @desc    Get AI-powered insights
// @route   GET /api/ai/insights
// @access  Private
export const getAiInsights = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    
    // Get user's pipeline and recent challenges
    const pipeline = await Pipeline.findOne({ userId: user._id });
    const recentChallenges = await Challenge.find({ 
      userId: user._id, 
      completed: true,
      completedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    // Generate AI insights
    const insights = await aiService.generatePersonalizedInsights(user, pipeline, recentChallenges);

    res.status(200).json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Get AI insights error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Generate daily challenges using AI
// @route   POST /api/ai/challenges/generate
// @access  Private
export const generateDailyChallenges = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const pipeline = await Pipeline.findOne({ userId: user._id });
    
    // Generate AI-powered challenges
    const challenges = await aiService.generatePersonalizedChallenges(user, pipeline);

    res.status(200).json({
      success: true,
      data: challenges,
      message: 'AI-generated challenges created successfully'
    });
  } catch (error) {
    console.error('Generate AI challenges error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get personalized tips
// @route   GET /api/ai/tips
// @access  Private
export const getPersonalizedTips = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    
    // Get user's performance data
    const pipeline = await Pipeline.findOne({ userId: user._id });
    const completedChallenges = await Challenge.find({ 
      userId: user._id, 
      completed: true 
    }).sort({ completedAt: -1 }).limit(10);

    // Generate AI tips
    const tips = await aiService.generatePersonalizedTips(user, pipeline, completedChallenges);

    res.status(200).json({
      success: true,
      data: tips
    });
  } catch (error) {
    console.error('Get personalized tips error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Predict goal progress
// @route   GET /api/ai/predict/goals
// @access  Private
export const predictGoalProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    
    // Get user's pipeline data
    const pipeline = await Pipeline.findOne({ userId: user._id });
    
    // Generate AI prediction
    const prediction = await aiService.generateGoalPrediction(user, pipeline);

    res.status(200).json({
      success: true,
      data: prediction
    });
  } catch (error) {
    console.error('Predict goal progress error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
}; 