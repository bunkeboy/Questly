import { Request, Response } from 'express';
import Pipeline, { IPipeline } from '../models/Pipeline';
import Challenge from '../models/Challenge';
import User, { IUser } from '../models/User';

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

// @desc    Get pipeline data
// @route   GET /api/pipeline
// @access  Private
export const getPipeline = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    
    let pipeline = await Pipeline.findOne({ userId: user._id });
    
    // If no pipeline exists, create one with default values
    if (!pipeline) {
      pipeline = await Pipeline.create({
        userId: user._id,
        data: {
          leads: 243,
          opportunities: 87,
          underContract: 12,
          closed: 8,
          totalValue: 9600000,
          averageValue: 1200000,
          conversionRate: 0.07
        }
      });
    }

    res.status(200).json({
      success: true,
      data: pipeline
    });
  } catch (error) {
    console.error('Get pipeline error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get health scores
// @route   GET /api/pipeline/health
// @access  Private
export const getHealthScores = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    
    let pipeline = await Pipeline.findOne({ userId: user._id });
    
    if (!pipeline) {
      // Calculate health scores based on activity
      const healthScores = await calculateHealthScores(user._id.toString());
      
      pipeline = await Pipeline.create({
        userId: user._id,
        healthScore: healthScores
      });
    } else {
      // Recalculate health scores based on recent activity
      const healthScores = await calculateHealthScores(user._id.toString());
      pipeline.healthScore = healthScores;
      pipeline.lastUpdated = new Date();
      await pipeline.save();
    }

    res.status(200).json({
      success: true,
      data: pipeline.healthScore
    });
  } catch (error) {
    console.error('Get health scores error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update pipeline data
// @route   PUT /api/pipeline
// @access  Private
export const updatePipeline = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { leads, opportunities, underContract, closed, totalValue } = req.body;
    
    let pipeline = await Pipeline.findOne({ userId: user._id });
    
    if (!pipeline) {
      pipeline = await Pipeline.create({
        userId: user._id
      });
    }

    // Update pipeline data
    if (leads !== undefined) pipeline.data.leads = leads;
    if (opportunities !== undefined) pipeline.data.opportunities = opportunities;
    if (underContract !== undefined) pipeline.data.underContract = underContract;
    if (closed !== undefined) pipeline.data.closed = closed;
    if (totalValue !== undefined) pipeline.data.totalValue = totalValue;
    
    // Calculate derived values
    pipeline.data.averageValue = closed > 0 ? totalValue / closed : 0;
    pipeline.data.conversionRate = leads > 0 ? closed / leads : 0;
    
    pipeline.lastUpdated = new Date();
    await pipeline.save();

    res.status(200).json({
      success: true,
      data: pipeline
    });
  } catch (error) {
    console.error('Update pipeline error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get pipeline statistics
// @route   GET /api/pipeline/stats
// @access  Private
export const getPipelineStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    
    const pipeline = await Pipeline.findOne({ userId: user._id });
    
    if (!pipeline) {
      return res.status(404).json({
        success: false,
        error: 'Pipeline data not found'
      });
    }

    // Get additional stats
    const totalChallenges = await Challenge.countDocuments({ userId: user._id });
    const completedChallenges = await Challenge.countDocuments({ 
      userId: user._id, 
      completed: true 
    });
    
    const completionRate = totalChallenges > 0 ? (completedChallenges / totalChallenges) * 100 : 0;

    const stats = {
      pipeline: pipeline.data,
      healthScore: pipeline.healthScore,
      gameStats: {
        totalChallenges,
        completedChallenges,
        completionRate: Math.round(completionRate),
        points: user.gameState.points,
        streak: user.gameState.streak,
        level: user.gameState.level
      },
      goals: user.calculateGoals(),
      lastUpdated: pipeline.lastUpdated
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get pipeline stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Helper function to calculate health scores
async function calculateHealthScores(userId: string) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  
  // Get completed challenges in the last 30 days by category
  const challenges = await Challenge.find({
    userId,
    completed: true,
    completedAt: { $gte: thirtyDaysAgo }
  });

  const challengesByCategory = {
    prospecting: challenges.filter(c => c.category === 'prospecting').length,
    nurturing: challenges.filter(c => c.category === 'nurturing').length,
    managing_clients: challenges.filter(c => c.category === 'managing_clients').length,
    administrative: challenges.filter(c => c.category === 'administrative').length
  };

  // Calculate health scores based on activity (simplified algorithm)
  const maxChallengesPerCategory = 10; // Assume 10 challenges per category in 30 days is "perfect"
  
  const prospectingScore = Math.min((challengesByCategory.prospecting / maxChallengesPerCategory) * 100, 100);
  const nurturingScore = Math.min((challengesByCategory.nurturing / maxChallengesPerCategory) * 100, 100);
  const managingClientsScore = Math.min((challengesByCategory.managing_clients / maxChallengesPerCategory) * 100, 100);
  const administrativeScore = Math.min((challengesByCategory.administrative / maxChallengesPerCategory) * 100, 100);
  
  const overallScore = (prospectingScore + nurturingScore + managingClientsScore + administrativeScore) / 4;

  return {
    overall: Math.round(overallScore),
    prospecting: Math.round(prospectingScore),
    nurturing: Math.round(nurturingScore),
    managingClients: Math.round(managingClientsScore),
    administrative: Math.round(administrativeScore)
  };
} 