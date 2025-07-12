import fs from 'fs';
import path from 'path';
import { IUser } from '../models/User';
import Challenge from '../models/Challenge';
import metricsService from './metricsService';
import scoringService from './scoringService';
import gapAnalysisService from './gapAnalysisService';

// Task Library Schema
interface TaskLibraryItem {
  id: string;
  title: string;
  category: string;
  base_target: number;
  unit: string;
  difficulty: number;
  impact_weights: {
    prospecting: number;
    nurturing: number;
    client_care: number;
    admin: number;
  };
  max_scale: number;
  cooldown: number;
}

interface TaskLibrary {
  prospecting: TaskLibraryItem[];
  nurturing: TaskLibraryItem[];
  client_care: TaskLibraryItem[];
  admin: TaskLibraryItem[];
}

// Daily Task Plan Schema
interface DailyTaskPlan {
  userId: string;
  date: string;
  trackStatus: 'Ahead' | 'On-Track' | 'Behind';
  candidateTasks: GeneratedDailyTask[];
  selectedTasks: GeneratedDailyTask[];
  totalPossiblePoints: number;
  requiredPoints: number;
  completedTasks: number;
  completedPoints: number;
  streak: StreakData;
  createdAt: Date;
  lastUpdated: Date;
}

interface GeneratedDailyTask {
  id: string;
  taskId: string;
  title: string;
  description: string;
  category: string;
  target: number;
  unit: string;
  difficulty: number;
  points: number;
  priority: number;
  preSelected: boolean;
  progress: number;
  completed: boolean;
  completedAt?: Date;
  cooldownUntil?: Date;
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletionDate: string;
  totalDays: number;
  streakBroken: boolean;
  penaltyApplied: number;
  milestoneRewards: number[];
}

class DailyTaskService {
  private taskLibrary!: TaskLibrary;
  private plansDir: string;
  private streakDir: string;

  constructor() {
    this.plansDir = path.join(__dirname, '../data/plans');
    this.streakDir = path.join(__dirname, '../data/streaks');
    this.ensureDirectories();
    this.loadTaskLibrary();
  }

  private ensureDirectories(): void {
    if (!fs.existsSync(this.plansDir)) {
      fs.mkdirSync(this.plansDir, { recursive: true });
    }
    if (!fs.existsSync(this.streakDir)) {
      fs.mkdirSync(this.streakDir, { recursive: true });
    }
  }

  private loadTaskLibrary(): void {
    try {
      const libraryPath = path.join(__dirname, '../data/tasksLibrary.json');
      const libraryData = fs.readFileSync(libraryPath, 'utf-8');
      this.taskLibrary = JSON.parse(libraryData);
    } catch (error) {
      console.error('Failed to load task library:', error);
      throw new Error('Task library not found or invalid');
    }
  }

  // 1 — Daily Decision Loop
  async generateDailyPlan(userId: string, date: Date = new Date()): Promise<DailyTaskPlan> {
    const dateStr = date.toISOString().split('T')[0];
    
    console.log(`🎯 Generating daily plan for user ${userId} on ${dateStr}`);

    // Step 1: Pull fresh metrics
    const rawMetrics = await metricsService.collectRawMetrics(userId);
    
    // Step 2: Determine Track Status
    const trackStatus = this.determineTrackStatus(rawMetrics);
    
    // Step 3: Generate Candidate Tasks
    const candidateTasks = await this.generateCandidateTasks(userId, rawMetrics, date);
    
    // Step 4: Score & Rank Tasks
    const rankedTasks = this.scoreAndRankTasks(candidateTasks, trackStatus, rawMetrics);
    
    // Step 5: Pre-select five highest-ranked tasks
    const selectedTasks = this.preSelectTasks(rankedTasks);
    
    // Step 6: Load streak data
    const streakData = await this.loadStreakData(userId);
    
    // Create daily plan
    const dailyPlan: DailyTaskPlan = {
      userId,
      date: dateStr,
      trackStatus,
      candidateTasks: rankedTasks,
      selectedTasks,
      totalPossiblePoints: rankedTasks.reduce((sum, task) => sum + task.points, 0),
      requiredPoints: 70,
      completedTasks: 0,
      completedPoints: 0,
      streak: streakData,
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    // Step 7: Save plan
    await this.saveDailyPlan(dailyPlan);
    
    console.log(`✅ Generated daily plan with ${rankedTasks.length} tasks, ${selectedTasks.length} pre-selected`);
    return dailyPlan;
  }

  // Step 2: Determine Track Status
  private determineTrackStatus(rawMetrics: any): 'Ahead' | 'On-Track' | 'Behind' {
    const actualGCI = rawMetrics.userTargets.actualGCI || 0;
    const targetGCI = rawMetrics.userTargets.targetGCI || 1;
    
    const paceRatio = actualGCI / targetGCI;
    
    if (paceRatio >= 1.05) return 'Ahead';
    if (paceRatio >= 0.9) return 'On-Track';
    return 'Behind';
  }

  // Step 3: Generate Candidate Tasks
  private async generateCandidateTasks(userId: string, rawMetrics: any, date: Date): Promise<GeneratedDailyTask[]> {
    const subscores = scoringService.calculateAllScores(rawMetrics);
    const gaps = scoringService.calculateGaps(subscores);
    
    const candidateTasks: GeneratedDailyTask[] = [];
    
    // Get tasks that are not on cooldown
    const availableTasks = await this.getAvailableTasks(userId, date);
    
         // Generate tasks for each category
     for (const [category, tasks] of Object.entries(this.taskLibrary)) {
       const categoryGap = (gaps as any)[category] || 0;
       
       for (const task of tasks) {
         if (availableTasks.includes(task.id)) {
           const scaledTask = this.scaleTask(task, categoryGap, subscores);
           candidateTasks.push(scaledTask);
         }
       }
     }

    // Apply diversity rule
    return this.applyDiversityRule(candidateTasks, subscores);
  }

  private scaleTask(task: TaskLibraryItem, gap: number, subscores: any): GeneratedDailyTask {
    // Map gap to activity scaling
    const scaleFactor = this.getScaleFactor(gap);
    const scaledTarget = Math.min(
      task.base_target + Math.ceil(gap / 10),
      task.base_target * task.max_scale
    );

    // Calculate points
    const points = this.calculateTaskPoints(task, scaledTarget, scaleFactor);

    return {
      id: `${task.id}-${Date.now()}`,
      taskId: task.id,
      title: task.title.replace('{target}', scaledTarget.toString()),
      description: `Complete ${scaledTarget} ${task.unit} for ${task.category}`,
      category: task.category,
      target: scaledTarget,
      unit: task.unit,
      difficulty: task.difficulty,
      points,
      priority: 0, // Will be calculated in ranking
      preSelected: false,
      progress: 0,
      completed: false
    };
  }

  private getScaleFactor(gap: number): number {
    if (gap <= 10) return 1.0;
    if (gap <= 20) return 1.2;
    if (gap <= 30) return 1.5;
    return 2.0;
  }

  private calculateTaskPoints(task: TaskLibraryItem, target: number, scaleFactor: number): number {
    const basePoints = target * (task.difficulty * 5);
    return Math.round(basePoints * scaleFactor);
  }

  private async getAvailableTasks(userId: string, date: Date): Promise<string[]> {
    // Get tasks completed in the last 30 days with their cooldowns
    const recentTasks = await Challenge.find({
      userId,
      completedAt: { $gte: new Date(date.getTime() - 30 * 24 * 60 * 60 * 1000) }
    });

    const unavailableTasks = new Set<string>();
    
    for (const completedTask of recentTasks) {
      const taskDef = this.findTaskDefinition(completedTask.title);
      if (taskDef) {
        const cooldownEnd = new Date(completedTask.completedAt!);
        cooldownEnd.setDate(cooldownEnd.getDate() + taskDef.cooldown);
        
        if (cooldownEnd > date) {
          unavailableTasks.add(taskDef.id);
        }
      }
    }

    // Return all task IDs that are not on cooldown
    const allTaskIds = Object.values(this.taskLibrary).flat().map(task => task.id);
    return allTaskIds.filter(id => !unavailableTasks.has(id));
  }

  private findTaskDefinition(title: string): TaskLibraryItem | null {
    for (const category of Object.values(this.taskLibrary)) {
      for (const task of category) {
        if (title.includes(task.title.split(' ')[0])) {
          return task;
        }
      }
    }
    return null;
  }

  private applyDiversityRule(tasks: GeneratedDailyTask[], subscores: any): GeneratedDailyTask[] {
    const categories = ['prospecting', 'nurturing', 'client_care', 'admin'];
    const diverseTasks: GeneratedDailyTask[] = [];
    
    for (const category of categories) {
      const categoryScore = subscores[category] || 0;
      const categoryTasks = tasks.filter(task => task.category === category);
      
      // Guarantee at least 1 task per category unless score >= 90
      if (categoryScore < 90 && categoryTasks.length > 0) {
        const bestTask = categoryTasks.sort((a, b) => b.points - a.points)[0];
        diverseTasks.push(bestTask);
      }
    }

    // Add remaining tasks up to reasonable limit
    const remainingTasks = tasks.filter(task => !diverseTasks.includes(task));
    diverseTasks.push(...remainingTasks.slice(0, 15 - diverseTasks.length));
    
    return diverseTasks;
  }

  // Step 4: Score & Rank Tasks
  private scoreAndRankTasks(tasks: GeneratedDailyTask[], trackStatus: string, rawMetrics: any): GeneratedDailyTask[] {
    const subscores = scoringService.calculateAllScores(rawMetrics);
    const gaps = scoringService.calculateGaps(subscores);
    
    const totalGaps = Object.values(gaps).reduce((sum: number, gap: number) => sum + gap, 0);
    
         for (const task of tasks) {
       const categoryGap = (gaps as any)[task.category] || 0;
       const gapWeight = totalGaps > 0 ? categoryGap / totalGaps : 0.25;
      
      // Pace penalty
      let pacePenalty = 0;
      if (trackStatus === 'Behind') pacePenalty = 1.0;
      else if (trackStatus === 'On-Track') pacePenalty = 0.5;
      else pacePenalty = 0;
      
      // Personal preference (future feature)
      const personalPref = 0.5;
      
      // Calculate priority score
      task.priority = (0.45 * gapWeight) + (0.35 * pacePenalty) + (0.20 * personalPref);
    }

    // Sort by priority (descending) and return top 10
    return tasks.sort((a, b) => b.priority - a.priority).slice(0, 10);
  }

  // Step 5: Pre-select Tasks
  private preSelectTasks(rankedTasks: GeneratedDailyTask[]): GeneratedDailyTask[] {
    const top5 = rankedTasks.slice(0, 5);
    top5.forEach(task => task.preSelected = true);
    return top5;
  }

  // Streak Management
  private async loadStreakData(userId: string): Promise<StreakData> {
    const streakPath = path.join(this.streakDir, `${userId}.json`);
    
    try {
      if (fs.existsSync(streakPath)) {
        const data = fs.readFileSync(streakPath, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load streak data:', error);
    }

    // Return default streak data
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastCompletionDate: '',
      totalDays: 0,
      streakBroken: false,
      penaltyApplied: 0,
      milestoneRewards: []
    };
  }

  private async saveStreakData(userId: string, streakData: StreakData): Promise<void> {
    const streakPath = path.join(this.streakDir, `${userId}.json`);
    fs.writeFileSync(streakPath, JSON.stringify(streakData, null, 2));
  }

  // Daily Plan Management
  async saveDailyPlan(plan: DailyTaskPlan): Promise<void> {
    const planPath = path.join(this.plansDir, `${plan.userId}-${plan.date}.json`);
    fs.writeFileSync(planPath, JSON.stringify(plan, null, 2));
  }

  async loadDailyPlan(userId: string, date: Date = new Date()): Promise<DailyTaskPlan | null> {
    const dateStr = date.toISOString().split('T')[0];
    const planPath = path.join(this.plansDir, `${userId}-${dateStr}.json`);
    
    try {
      if (fs.existsSync(planPath)) {
        const data = fs.readFileSync(planPath, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load daily plan:', error);
    }
    
    return null;
  }

  // Task Progress Updates
  async updateTaskProgress(userId: string, taskId: string, progress: number): Promise<boolean> {
    const today = new Date();
    const plan = await this.loadDailyPlan(userId, today);
    
    if (!plan) return false;

    const task = plan.selectedTasks.find(t => t.id === taskId);
    if (!task) return false;

    task.progress = Math.max(0, Math.min(100, progress));
    
    // Check if task is completed
    if (task.progress >= 100 && !task.completed) {
      task.completed = true;
      task.completedAt = new Date();
      
      // Update plan totals
      plan.completedTasks++;
      plan.completedPoints += task.points;
      
      // Save to database
      await this.saveTaskToDatabase(task, userId);
    }

    plan.lastUpdated = new Date();
    await this.saveDailyPlan(plan);
    
    return true;
  }

  private async saveTaskToDatabase(task: GeneratedDailyTask, userId: string): Promise<void> {
    const challenge = new Challenge({
      title: task.title,
      description: task.description,
      category: task.category,
      points: task.points,
      difficulty: task.difficulty === 1 ? 'easy' : task.difficulty === 2 ? 'medium' : 'hard',
      dueDate: new Date(),
      completed: true,
      completedAt: task.completedAt,
      userId
    });

    await challenge.save();
  }

  // Evening Evaluation (23:59)
  async evaluateDailyCompletion(userId: string, date: Date = new Date()): Promise<void> {
    const plan = await this.loadDailyPlan(userId, date);
    if (!plan) return;

    const streakData = await this.loadStreakData(userId);
    const dateStr = date.toISOString().split('T')[0];
    
    // Check completion criteria: ≥ 5 tasks and ≥ 70 points
    const meetsTaskRequirement = plan.completedTasks >= 5;
    const meetsPointRequirement = plan.completedPoints >= 70;
    
    if (meetsTaskRequirement && meetsPointRequirement) {
      // Streak continues
      streakData.currentStreak++;
      streakData.totalDays++;
      streakData.lastCompletionDate = dateStr;
      streakData.streakBroken = false;
      
      // Check for milestone rewards
      const milestones = [7, 14, 30, 60];
      for (const milestone of milestones) {
        if (streakData.currentStreak === milestone && !streakData.milestoneRewards.includes(milestone)) {
          const bonus = this.getMilestoneBonus(milestone);
          streakData.milestoneRewards.push(milestone);
          
          // Add bonus to user's score
          console.log(`🏆 Milestone reached! ${milestone} days streak, bonus: ${bonus} points`);
        }
      }
      
      // Update longest streak
      if (streakData.currentStreak > streakData.longestStreak) {
        streakData.longestStreak = streakData.currentStreak;
      }
      
    } else {
      // Streak breaks
      const penalty = 5 + Math.floor(streakData.currentStreak / 2);
      streakData.penaltyApplied = penalty;
      streakData.currentStreak = 0;
      streakData.streakBroken = true;
      
      console.log(`💔 Streak broken! Penalty: ${penalty} points`);
    }

    await this.saveStreakData(userId, streakData);
    
    // Calculate daily score delta
    const dailyScoreDelta = this.calculateDailyScoreDelta(plan, streakData);
    console.log(`📊 Daily score delta: ${dailyScoreDelta}`);
  }

     private getMilestoneBonus(milestone: number): number {
     const bonuses: { [key: number]: number } = { 7: 10, 14: 15, 30: 30, 60: 50 };
     return bonuses[milestone] || 0;
   }

  private calculateDailyScoreDelta(plan: DailyTaskPlan, streakData: StreakData): number {
    const completedPoints = plan.completedPoints;
    const unfinishedPenalty = plan.selectedTasks
      .filter(task => !task.completed)
      .reduce((sum, task) => sum + (task.difficulty * 2), 0);
    
    const streakPenalty = streakData.streakBroken ? streakData.penaltyApplied : 0;
    const milestoneBonus = streakData.milestoneRewards.length > 0 ? 
      streakData.milestoneRewards.reduce((sum, m) => sum + this.getMilestoneBonus(m), 0) : 0;
    
    return completedPoints - unfinishedPenalty - streakPenalty + milestoneBonus;
  }

  // Get Today's Plan
  async getTodaysPlan(userId: string): Promise<DailyTaskPlan | null> {
    const today = new Date();
    let plan = await this.loadDailyPlan(userId, today);
    
    if (!plan) {
      // Generate new plan for today
      plan = await this.generateDailyPlan(userId, today);
    }
    
    return plan;
  }

  // Get Task Analytics
  async getTaskAnalytics(userId: string, days: number = 30): Promise<any> {
    const analytics = {
      avgCompletionRate: 0,
      avgPointsPerDay: 0,
      streakInfo: await this.loadStreakData(userId),
      categoryBreakdown: {},
      recentTrends: []
    };

    // Get recent plans
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
    
    const plans: DailyTaskPlan[] = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const plan = await this.loadDailyPlan(userId, d);
      if (plan) plans.push(plan);
    }

    if (plans.length > 0) {
      analytics.avgCompletionRate = plans.reduce((sum, p) => sum + (p.completedTasks / Math.max(p.selectedTasks.length, 1)), 0) / plans.length * 100;
      analytics.avgPointsPerDay = plans.reduce((sum, p) => sum + p.completedPoints, 0) / plans.length;
    }

    return analytics;
  }
}

export default new DailyTaskService();
export { DailyTaskPlan, GeneratedDailyTask, StreakData }; 