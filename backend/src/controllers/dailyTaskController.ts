import { Request, Response } from 'express';
import { IUser } from '../models/User';
import dailyTaskService from '../services/dailyTaskService';
import { DailyTaskPlan, GeneratedDailyTask, StreakData } from '../services/dailyTaskService';

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

// @desc    Get today's daily task plan
// @route   GET /api/daily-tasks/today
// @access  Private
export const getTodaysPlan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    console.log(`📋 Getting today's plan for user ${user.email}`);
    
    const plan = await dailyTaskService.getTodaysPlan(user._id.toString());
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'No plan found for today'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        plan,
        summary: {
          totalTasks: plan.candidateTasks.length,
          selectedTasks: plan.selectedTasks.length,
          completedTasks: plan.completedTasks,
          completedPoints: plan.completedPoints,
          requiredPoints: plan.requiredPoints,
          trackStatus: plan.trackStatus,
          completionRate: plan.selectedTasks.length > 0 ? 
            (plan.completedTasks / plan.selectedTasks.length * 100).toFixed(1) : 0
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting today\'s plan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get today\'s plan'
    });
  }
};

// @desc    Generate new daily plan
// @route   POST /api/daily-tasks/generate
// @access  Private
export const generateDailyPlan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { date } = req.body;
    
    // Ensure user has required fields for task generation
    if (!user.commissionGoal || user.commissionGoal === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please set your commission goal first in your profile settings to generate daily tasks'
      });
    }
    
    console.log(`🎯 Generating daily plan for user ${user.email}`);
    
    const planDate = date ? new Date(date) : new Date();
    const plan = await dailyTaskService.generateDailyPlan(user._id.toString(), planDate);
    
    res.status(200).json({
      success: true,
      data: {
        plan,
        insights: {
          trackStatus: plan.trackStatus,
          focusAreas: plan.candidateTasks
            .filter(task => task.priority > 0.7)
            .map(task => task.category),
          totalPoints: plan.totalPossiblePoints,
          streakDays: plan.streak.currentStreak
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error generating daily plan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate daily plan'
    });
  }
};

// @desc    Update task progress
// @route   PUT /api/daily-tasks/:taskId/progress
// @access  Private
export const updateTaskProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { taskId } = req.params;
    const { progress } = req.body;
    
    console.log(`📊 Updating task ${taskId} progress to ${progress}% for user ${user.email}`);
    
    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        error: 'Progress must be a number between 0 and 100'
      });
    }
    
    const success = await dailyTaskService.updateTaskProgress(
      user._id.toString(),
      taskId,
      progress
    );
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Task not found or cannot be updated'
      });
    }
    
    // Get updated plan to return current status
    const plan = await dailyTaskService.getTodaysPlan(user._id.toString());
    
    res.status(200).json({
      success: true,
      data: {
        taskId,
        progress,
        planSummary: plan ? {
          completedTasks: plan.completedTasks,
          completedPoints: plan.completedPoints,
          requiredPoints: plan.requiredPoints,
          remainingPoints: Math.max(0, plan.requiredPoints - plan.completedPoints)
        } : null
      }
    });
    
  } catch (error) {
    console.error('❌ Error updating task progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update task progress'
    });
  }
};

// @desc    Complete a task
// @route   POST /api/daily-tasks/:taskId/complete
// @access  Private
export const completeTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { taskId } = req.params;
    
    console.log(`✅ Completing task ${taskId} for user ${user.email}`);
    
    const success = await dailyTaskService.updateTaskProgress(
      user._id.toString(),
      taskId,
      100
    );
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Task not found or cannot be completed'
      });
    }
    
    // Get updated plan
    const plan = await dailyTaskService.getTodaysPlan(user._id.toString());
    
    res.status(200).json({
      success: true,
      data: {
        taskId,
        completed: true,
        planSummary: plan ? {
          completedTasks: plan.completedTasks,
          completedPoints: plan.completedPoints,
          requiredPoints: plan.requiredPoints,
          tasksRemaining: Math.max(0, 5 - plan.completedTasks),
          pointsRemaining: Math.max(0, plan.requiredPoints - plan.completedPoints)
        } : null
      }
    });
    
  } catch (error) {
    console.error('❌ Error completing task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete task'
    });
  }
};

// @desc    Get streak information
// @route   GET /api/daily-tasks/streak
// @access  Private
export const getStreakInfo = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    
    const analytics = await dailyTaskService.getTaskAnalytics(user._id.toString());
    
    res.status(200).json({
      success: true,
      data: {
        streak: analytics.streakInfo,
        performance: {
          avgCompletionRate: analytics.avgCompletionRate,
          avgPointsPerDay: analytics.avgPointsPerDay
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting streak info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get streak information'
    });
  }
};

// @desc    Get task analytics
// @route   GET /api/daily-tasks/analytics
// @access  Private
export const getTaskAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { days = 30 } = req.query;
    
    const daysNumber = typeof days === 'string' ? parseInt(days) : days as number;
    const analytics = await dailyTaskService.getTaskAnalytics(
      user._id.toString(),
      daysNumber
    );
    
    res.status(200).json({
      success: true,
      data: analytics
    });
    
  } catch (error) {
    console.error('❌ Error getting task analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get task analytics'
    });
  }
};

// @desc    Evaluate daily completion (normally run by cron)
// @route   POST /api/daily-tasks/evaluate
// @access  Private
export const evaluateDailyCompletion = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { date } = req.body;
    
    console.log(`🔍 Evaluating daily completion for user ${user.email}`);
    
    const evaluationDate = date ? new Date(date) : new Date();
    await dailyTaskService.evaluateDailyCompletion(user._id.toString(), evaluationDate);
    
    res.status(200).json({
      success: true,
      message: 'Daily completion evaluated successfully'
    });
    
  } catch (error) {
    console.error('❌ Error evaluating daily completion:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to evaluate daily completion'
    });
  }
};

// @desc    Get historical daily plans
// @route   GET /api/daily-tasks/history
// @access  Private
export const getTaskHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { days = 7 } = req.query;
    
    const history = [];
    const daysToQuery = parseInt(days.toString());
    
    for (let i = 0; i < daysToQuery; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const plan = await dailyTaskService.loadDailyPlan(user._id.toString(), date);
      if (plan) {
        history.push({
          date: plan.date,
          trackStatus: plan.trackStatus,
          completedTasks: plan.completedTasks,
          completedPoints: plan.completedPoints,
          totalTasks: plan.selectedTasks.length,
          totalPoints: plan.totalPossiblePoints,
          completionRate: plan.selectedTasks.length > 0 ? 
            (plan.completedTasks / plan.selectedTasks.length * 100).toFixed(1) : '0'
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: {
        history,
        summary: {
          totalDays: history.length,
                     avgCompletionRate: history.length > 0 ? 
             (history.reduce((sum, day) => sum + parseFloat(day.completionRate), 0) / history.length).toFixed(1) : '0',
                     avgPointsPerDay: history.length > 0 ? 
             (history.reduce((sum, day) => sum + day.completedPoints, 0) / history.length).toFixed(1) : '0'
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting task history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get task history'
    });
  }
};

// @desc    Swap task selection (user can swap pre-selected tasks)
// @route   POST /api/daily-tasks/swap
// @access  Private
export const swapTaskSelection = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { removeTaskId, addTaskId } = req.body;
    
    console.log(`🔄 Swapping tasks for user ${user.email}: remove ${removeTaskId}, add ${addTaskId}`);
    
    const plan = await dailyTaskService.getTodaysPlan(user._id.toString());
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'No plan found for today'
      });
    }
    
    // Find tasks
    const taskToRemove = plan.selectedTasks.find(t => t.id === removeTaskId);
    const taskToAdd = plan.candidateTasks.find(t => t.id === addTaskId);
    
    if (!taskToRemove || !taskToAdd) {
      return res.status(400).json({
        success: false,
        error: 'Invalid task IDs provided'
      });
    }
    
    // Swap tasks
    const removeIndex = plan.selectedTasks.findIndex(t => t.id === removeTaskId);
    if (removeIndex !== -1) {
      plan.selectedTasks[removeIndex] = taskToAdd;
      taskToAdd.preSelected = true;
      taskToRemove.preSelected = false;
    }
    
    // Save updated plan
    plan.lastUpdated = new Date();
    await dailyTaskService.saveDailyPlan(plan);
    
    res.status(200).json({
      success: true,
      data: {
        swappedOut: {
          id: taskToRemove.id,
          title: taskToRemove.title
        },
        swappedIn: {
          id: taskToAdd.id,
          title: taskToAdd.title
        },
        selectedTasks: plan.selectedTasks
      }
    });
    
  } catch (error) {
    console.error('❌ Error swapping task selection:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to swap task selection'
    });
  }
}; 