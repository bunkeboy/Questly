import { Request, Response } from 'express';
import Challenge, { IChallenge } from '../models/Challenge';
import User, { IUser } from '../models/User';
import { LeadSource } from '../models/User';
import Pipeline from '../models/Pipeline';
import aiService from '../services/aiService';

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

// Challenge templates for generating daily challenges
const challengeTemplates = {
  prospecting: [
    {
      title: 'Call {count} new leads',
      description: 'Make outbound calls to {count} new prospects from your lead list',
      points: 50,
      difficulty: 'medium' as const,
      leadSources: ['web_leads', 'doorknocking', 'sphere_influence'] as LeadSource[]
    },
    {
      title: 'Door knock {count} homes',
      description: 'Visit {count} homes in your target neighborhood',
      points: 60,
      difficulty: 'hard' as const,
      leadSources: ['doorknocking'] as LeadSource[]
    },
    {
      title: 'Connect with {count} people on social media',
      description: 'Engage with {count} potential clients on social platforms',
      points: 30,
      difficulty: 'easy' as const,
      leadSources: ['social_media'] as LeadSource[]
    }
  ],
  nurturing: [
    {
      title: 'Follow up with {count} warm prospects',
      description: 'Reach out to {count} prospects who have shown interest',
      points: 40,
      difficulty: 'medium' as const,
      leadSources: ['web_leads', 'referrals', 'sphere_influence'] as LeadSource[]
    },
    {
      title: 'Send {count} personalized emails',
      description: 'Send personalized follow-up emails to {count} prospects',
      points: 25,
      difficulty: 'easy' as const,
      leadSources: ['web_leads', 'social_media'] as LeadSource[]
    },
    {
      title: 'Schedule {count} coffee meetings',
      description: 'Set up {count} informal meetings with potential clients',
      points: 45,
      difficulty: 'medium' as const,
      leadSources: ['sphere_influence', 'referrals'] as LeadSource[]
    }
  ],
  managing_clients: [
    {
      title: 'Schedule {count} property showings',
      description: 'Arrange {count} property viewings for active clients',
      points: 50,
      difficulty: 'medium' as const,
      leadSources: ['web_leads', 'referrals'] as LeadSource[]
    },
    {
      title: 'Send {count} market updates',
      description: 'Share market insights with {count} active clients',
      points: 30,
      difficulty: 'easy' as const,
      leadSources: ['sphere_influence', 'referrals'] as LeadSource[]
    },
    {
      title: 'Complete {count} buyer consultations',
      description: 'Conduct {count} detailed buyer consultation meetings',
      points: 60,
      difficulty: 'hard' as const,
      leadSources: ['web_leads', 'referrals'] as LeadSource[]
    }
  ],
  administrative: [
    {
      title: 'Update CRM with {count} contact details',
      description: 'Add or update {count} contact records in your CRM system',
      points: 20,
      difficulty: 'easy' as const,
      leadSources: []
    },
    {
      title: 'Review {count} contracts',
      description: 'Review and organize {count} client contracts or agreements',
      points: 35,
      difficulty: 'medium' as const,
      leadSources: []
    },
    {
      title: 'Prepare {count} market analyses',
      description: 'Complete {count} comparative market analyses for clients',
      points: 40,
      difficulty: 'medium' as const,
      leadSources: []
    }
  ]
};

// @desc    Get all challenges
// @route   GET /api/challenges
// @access  Private
export const getChallenges = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const challenges = await Challenge.find({ userId: user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: challenges.length,
      data: challenges
    });
  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get daily challenges
// @route   GET /api/challenges/daily
// @access  Private
export const getDailyChallenges = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get existing challenges for today
    let challenges = await Challenge.find({
      userId: user._id,
      dueDate: { $gte: today, $lt: tomorrow }
    });

    // If no challenges exist for today, generate new ones
    if (challenges.length === 0) {
      challenges = await generateDailyChallenges(user, user.leadSources);
    }

    res.status(200).json({
      success: true,
      count: challenges.length,
      data: challenges
    });
  } catch (error) {
    console.error('Get daily challenges error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Complete a challenge
// @route   POST /api/challenges/:id/complete
// @access  Private
export const completeChallenge = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const challengeId = req.params.id;

    // Find the challenge
    const challenge = await Challenge.findOne({
      _id: challengeId,
      userId: user._id
    });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge not found'
      });
    }

    if (challenge.completed) {
      return res.status(400).json({
        success: false,
        error: 'Challenge already completed'
      });
    }

    // Mark challenge as completed
    challenge.completed = true;
    challenge.completedAt = new Date();
    await challenge.save();

    // Update user's game state
    user.gameState.points += challenge.points;
    user.gameState.completedChallenges += 1;
    user.gameState.totalChallenges += 1;
    user.gameState.lastActiveDate = new Date();

    // Update streak (simplified logic)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const lastActive = new Date(user.gameState.lastActiveDate);
    lastActive.setHours(0, 0, 0, 0);
    
    if (lastActive.getTime() === yesterday.getTime()) {
      user.gameState.streak += 1;
    } else if (lastActive.getTime() < yesterday.getTime()) {
      user.gameState.streak = 1;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: challenge,
      gameState: user.gameState
    });
  } catch (error) {
    console.error('Complete challenge error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get completed challenges
// @route   GET /api/challenges/completed
// @access  Private
export const getCompletedChallenges = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const challenges = await Challenge.find({
      userId: user._id,
      completed: true
    })
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Challenge.countDocuments({
      userId: user._id,
      completed: true
    });

    res.status(200).json({
      success: true,
      count: challenges.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: challenges
    });
  } catch (error) {
    console.error('Get completed challenges error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Helper function to generate daily challenges
async function generateDailyChallenges(user: IUser, userLeadSources: LeadSource[]) {
  const challenges: any[] = [];
  const today = new Date();
  today.setHours(23, 59, 59, 999); // Set due date to end of day

  // First, try to use AI to generate personalized challenges
  try {
    const pipeline = await Pipeline.findOne({ userId: user._id });
    const aiChallenges = await aiService.generatePersonalizedChallenges(user, pipeline, 3);
    
    // If AI generates challenges, create them in the database
    if (aiChallenges && aiChallenges.length > 0) {
      for (const aiChallenge of aiChallenges) {
        const challenge = new Challenge({
          title: aiChallenge.title,
          description: aiChallenge.description,
          category: aiChallenge.category,
          points: aiChallenge.points,
          difficulty: aiChallenge.difficulty,
          dueDate: today,
          userId: user._id,
          relatedLeadSources: aiChallenge.relatedLeadSources || []
        });
        
        await challenge.save();
        challenges.push(challenge);
      }
      
      return challenges;
    }
  } catch (error) {
    console.error('AI challenge generation failed, falling back to templates:', error);
  }

  // Fallback: Generate challenges using templates
  const categories = Object.keys(challengeTemplates) as (keyof typeof challengeTemplates)[];
  
  for (const category of categories) {
    const templates = challengeTemplates[category];
    
    // Filter templates based on user's lead sources (if applicable)
    const relevantTemplates = templates.filter(template => 
      template.leadSources.length === 0 || 
      template.leadSources.some(source => userLeadSources.includes(source))
    );
    
    if (relevantTemplates.length === 0) continue;
    
    // Pick a random template
    const template = relevantTemplates[Math.floor(Math.random() * relevantTemplates.length)];
    
    // Generate appropriate count based on difficulty
    let count = 1;
    switch (template.difficulty) {
      case 'easy': count = Math.floor(Math.random() * 3) + 1; break; // 1-3
      case 'medium': count = Math.floor(Math.random() * 3) + 2; break; // 2-4
      case 'hard': count = Math.floor(Math.random() * 2) + 3; break; // 3-4
    }
    
    // Create the challenge
    const challenge = new Challenge({
      title: template.title.replace('{count}', count.toString()),
      description: template.description.replace('{count}', count.toString()),
      category,
      points: template.points,
      difficulty: template.difficulty,
      dueDate: today,
      userId: user._id,
      relatedLeadSources: template.leadSources.filter(source => userLeadSources.includes(source))
    });
    
    await challenge.save();
    challenges.push(challenge);
  }
  
  return challenges;
} 