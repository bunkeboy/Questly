import { Request, Response } from 'express';
import { IUser } from '../models/User';
import Challenge from '../models/Challenge';
import metricsService from '../services/metricsService';
import scoringService from '../services/scoringService';
import gapAnalysisService from '../services/gapAnalysisService';
import taskGeneratorService from '../services/taskGeneratorService';

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export interface TaskGenerationOptions {
  forceRegeneration?: boolean;
  holidayMode?: boolean;
  megaGoalThrottling?: boolean;
  customScaleFactor?: number;
}

// @desc    Generate personalized tasks based on scoring algorithm
// @route   POST /api/tasks/generate
// @access  Private
export const generateTasks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const options: TaskGenerationOptions = req.body;
    
    console.log(`🎯 Generating tasks for user ${user.email} with options:`, options);
    
    // Step 1: Collect raw metrics
    const rawMetrics = await metricsService.collectRawMetrics(user._id.toString());
    console.log(`📊 Raw metrics collected:`, {
      prospecting: rawMetrics.pipelineCounts.prospecting,
      nurturing: rawMetrics.pipelineCounts.nurturing,
      clientCare: rawMetrics.pipelineCounts.clientCare,
      administrative: rawMetrics.pipelineCounts.closed
    });
    
    // Step 2: Calculate scores with quarterly weights
    const weights = scoringService.getQuarterlyWeights(new Date());
    const subscores = scoringService.calculateAllScores(rawMetrics, weights);
    console.log(`📈 Scores calculated:`, subscores);
    
    // Step 3: Analyze gaps
    const gaps = scoringService.calculateGaps(subscores);
    const actionPlan = gapAnalysisService.createActionPlan(user._id.toString(), gaps);
    console.log(`🎯 Action plan created:`, {
      priority: actionPlan.priorityLevel,
      focusAreas: actionPlan.focusAreas,
      totalActivities: actionPlan.totalActivitiesNeeded
    });
    
    // Step 4: Handle edge cases
    let generatedTasks;
    
    // Edge case: Sparse data (< 5 activities yesterday)
    const yesterdayActivities = rawMetrics.activityVolume.prospecting.callsLogged + 
                               rawMetrics.activityVolume.nurturing.followUpCalls + 
                               rawMetrics.activityVolume.clientCare.clientTouches + 
                               rawMetrics.activityVolume.administrative.crmUpdates;
    
    if (yesterdayActivities < 5) {
      console.log(`⚠️  Sparse data detected (${yesterdayActivities} activities), using default tasks`);
      generatedTasks = taskGeneratorService.createDefaultTasks(user.leadSources);
    } else {
      // Generate tasks based on scoring algorithm
      generatedTasks = taskGeneratorService.generateTasks(actionPlan, user.leadSources, subscores);
    }
    
    // Step 5: Apply edge case adjustments
    if (options.holidayMode) {
      console.log(`🏖️  Applying holiday adjustments`);
      generatedTasks = taskGeneratorService.applyHolidayAdjustments(generatedTasks);
    }
    
    // Check if user has mega goals (97th percentile)
    const isMegaGoal = user.commissionGoal > 1000000; // Over $1M goal
    if (isMegaGoal && !options.megaGoalThrottling) {
      console.log(`🚀 Mega goal detected ($${user.commissionGoal.toLocaleString()}), applying throttling`);
      generatedTasks = taskGeneratorService.applyMegaGoalThrottling(generatedTasks, true);
    }
    
    // Step 6: Save generated tasks to database
    const savedTasks = await saveTasksToDatabase(generatedTasks, user._id.toString());
    
    // Step 7: Save metrics and action plan for historical analysis
    await metricsService.saveMetrics(rawMetrics);
    await gapAnalysisService.saveActionPlan(actionPlan);
    
    console.log(`✅ Generated ${savedTasks.length} tasks successfully`);
    
    res.status(200).json({
      success: true,
      data: {
        tasks: savedTasks,
        metrics: {
          scores: subscores,
          gaps,
          actionPlan: {
            priorityLevel: actionPlan.priorityLevel,
            focusAreas: actionPlan.focusAreas,
            totalActivitiesNeeded: actionPlan.totalActivitiesNeeded
          }
        },
        insights: {
          yesterdayActivities,
          sparseData: yesterdayActivities < 5,
          megaGoal: isMegaGoal,
          adjustments: {
            holidayMode: options.holidayMode,
            megaGoalThrottling: options.megaGoalThrottling
          }
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Task generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate tasks'
    });
  }
};

// @desc    Get task generation analytics
// @route   GET /api/tasks/analytics
// @access  Private
export const getTaskAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    
    // Get current scores
    const rawMetrics = await metricsService.collectRawMetrics(user._id.toString());
    const subscores = scoringService.calculateAllScores(rawMetrics);
    
    // Get recent task performance
    const recentTasks = await Challenge.find({
      userId: user._id,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    }).sort({ createdAt: -1 });
    
    const completionRate = recentTasks.length > 0 ? 
      (recentTasks.filter(t => t.completed).length / recentTasks.length) * 100 : 0;
    
    // Generate analytics
    const analytics = {
      scores: subscores,
      performance: {
        weeklyCompletionRate: Math.round(completionRate),
        totalTasksGenerated: recentTasks.length,
        averagePointsPerTask: recentTasks.length > 0 ? 
          Math.round(recentTasks.reduce((sum, task) => sum + task.points, 0) / recentTasks.length) : 0,
        streakDays: user.gameState.streak
      },
      trends: {
        improvingAreas: [], // TODO: Calculate from historical data
        strugglingAreas: [], // TODO: Calculate from historical data
        recommendedFocus: scoringService.getFocusAreas(scoringService.calculateGaps(subscores))
      }
    };
    
    res.status(200).json({
      success: true,
      data: analytics
    });
    
  } catch (error) {
    console.error('Task analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get task analytics'
    });
  }
};

// @desc    Test scoring algorithm with mock data
// @route   POST /api/tasks/test-scoring
// @access  Private
export const testScoringAlgorithm = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { mockMetrics } = req.body;
    
    // Use provided mock metrics or generate test data
    const testMetrics = mockMetrics || await metricsService.collectRawMetrics(user._id.toString());
    
    // Run through the complete scoring pipeline
    const subscores = scoringService.calculateAllScores(testMetrics);
    const gaps = scoringService.calculateGaps(subscores);
    const actionPlan = gapAnalysisService.createActionPlan(user._id.toString(), gaps);
    const testTasks = taskGeneratorService.generateTasks(actionPlan, user.leadSources, subscores);
    
    const testResults = {
      input: testMetrics,
      scores: subscores,
      gaps,
      actionPlan,
      generatedTasks: testTasks.map(task => ({
        title: task.title,
        category: task.category,
        points: task.points,
        target: task.target,
        difficulty: task.difficulty,
        focusArea: task.focusArea
      }))
    };
    
    res.status(200).json({
      success: true,
      data: testResults
    });
    
  } catch (error) {
    console.error('Scoring test error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test scoring algorithm'
    });
  }
};

// Helper function to save generated tasks to database
async function saveTasksToDatabase(generatedTasks: any[], userId: string) {
  const savedTasks = [];
  
  for (const task of generatedTasks) {
    const challenge = new Challenge({
      title: task.title,
      description: task.description,
      category: task.category,
      points: task.points,
      difficulty: task.difficulty,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Due tomorrow
      userId: userId,
      relatedLeadSources: task.relatedLeadSources || [],
      completed: false
    });
    
    await challenge.save();
    savedTasks.push(challenge);
  }
  
  return savedTasks;
}

// @desc    Get task generation history
// @route   GET /api/tasks/history
// @access  Private
export const getTaskHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { days = 30 } = req.query;
    
    const startDate = new Date(Date.now() - (Number(days) * 24 * 60 * 60 * 1000));
    
    const tasks = await Challenge.find({
      userId: user._id,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: -1 });
    
    // Group by day
    const tasksByDay = tasks.reduce((acc, task) => {
      const day = task.createdAt.toISOString().split('T')[0];
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(task);
      return acc;
    }, {} as Record<string, any[]>);
    
    res.status(200).json({
      success: true,
      data: {
        tasks: tasksByDay,
        summary: {
          totalTasks: tasks.length,
          completedTasks: tasks.filter(t => t.completed).length,
          totalPoints: tasks.reduce((sum, task) => sum + task.points, 0),
          averageTasksPerDay: Math.round(tasks.length / Number(days))
        }
      }
    });
    
  } catch (error) {
    console.error('Task history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get task history'
    });
  }
}; 