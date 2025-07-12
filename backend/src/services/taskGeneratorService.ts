import { ActivityDeltas, ActivityGaps, SubScores } from './scoringService';
import { ActionPlan } from './gapAnalysisService';
import { LeadSource } from '../models/User';
import { ChallengeCategory } from '../models/Challenge';

export interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  unit: 'leads' | 'calls' | 'emails' | 'appointments' | 'touches' | 'updates' | 'reviews' | 'analyses';
  baseTarget: number;
  maxAutoScale: number;
  difficulty: 'easy' | 'medium' | 'hard';
  basePoints: number;
  leadSources: LeadSource[];
  isScalable: boolean;
}

export interface GeneratedTask {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  target: number;
  unit: string;
  relatedLeadSources: LeadSource[];
  priority: number;
  focusArea: boolean;
}

// Task templates with blueprint specifications
const TASK_TEMPLATES: TaskTemplate[] = [
  // Prospecting Templates
  {
    id: 'prospect-calls',
    title: 'Make {target} prospecting calls',
    description: 'Contact {target} new prospects to generate interest and schedule appointments',
    category: 'prospecting',
    unit: 'calls',
    baseTarget: 5,
    maxAutoScale: 20,
    difficulty: 'medium',
    basePoints: 10,
    leadSources: ['web_leads', 'doorknocking', 'sphere_influence'],
    isScalable: true
  },
  {
    id: 'prospect-leads',
    title: 'Add {target} new leads to pipeline',
    description: 'Source and qualify {target} new potential clients for your pipeline',
    category: 'prospecting',
    unit: 'leads',
    baseTarget: 3,
    maxAutoScale: 15,
    difficulty: 'hard',
    basePoints: 15,
    leadSources: ['web_leads', 'networking', 'referrals'],
    isScalable: true
  },
  {
    id: 'prospect-social',
    title: 'Engage with {target} prospects on social media',
    description: 'Connect and engage with {target} potential clients on social platforms',
    category: 'prospecting',
    unit: 'touches',
    baseTarget: 8,
    maxAutoScale: 25,
    difficulty: 'easy',
    basePoints: 5,
    leadSources: ['social_media', 'sphere_influence'],
    isScalable: true
  },
  {
    id: 'prospect-doorknock',
    title: 'Door knock {target} homes',
    description: 'Visit {target} homes in your target neighborhoods for direct outreach',
    category: 'prospecting',
    unit: 'touches',
    baseTarget: 10,
    maxAutoScale: 30,
    difficulty: 'hard',
    basePoints: 20,
    leadSources: ['doorknocking'],
    isScalable: true
  },
  
  // Nurturing Templates
  {
    id: 'nurture-followup',
    title: 'Follow up with {target} warm prospects',
    description: 'Make {target} follow-up calls to prospects who have shown interest',
    category: 'nurturing',
    unit: 'calls',
    baseTarget: 6,
    maxAutoScale: 18,
    difficulty: 'medium',
    basePoints: 8,
    leadSources: ['web_leads', 'referrals', 'sphere_influence'],
    isScalable: true
  },
  {
    id: 'nurture-emails',
    title: 'Send {target} personalized emails',
    description: 'Send {target} personalized follow-up emails to nurture prospects',
    category: 'nurturing',
    unit: 'emails',
    baseTarget: 10,
    maxAutoScale: 30,
    difficulty: 'easy',
    basePoints: 3,
    leadSources: ['web_leads', 'social_media', 'networking'],
    isScalable: true
  },
  {
    id: 'nurture-appointments',
    title: 'Schedule {target} appointments',
    description: 'Set up {target} appointments with qualified prospects',
    category: 'nurturing',
    unit: 'appointments',
    baseTarget: 2,
    maxAutoScale: 8,
    difficulty: 'medium',
    basePoints: 15,
    leadSources: ['web_leads', 'referrals', 'sphere_influence'],
    isScalable: true
  },
  {
    id: 'nurture-coffee',
    title: 'Schedule {target} coffee meetings',
    description: 'Arrange {target} informal coffee meetings with potential clients',
    category: 'nurturing',
    unit: 'appointments',
    baseTarget: 1,
    maxAutoScale: 4,
    difficulty: 'medium',
    basePoints: 12,
    leadSources: ['sphere_influence', 'referrals'],
    isScalable: true
  },
  
  // Client Care Templates
  {
    id: 'client-showings',
    title: 'Schedule {target} property showings',
    description: 'Arrange {target} property viewings for active clients',
    category: 'managing_clients',
    unit: 'appointments',
    baseTarget: 3,
    maxAutoScale: 12,
    difficulty: 'medium',
    basePoints: 12,
    leadSources: ['web_leads', 'referrals'],
    isScalable: true
  },
  {
    id: 'client-updates',
    title: 'Send {target} market updates',
    description: 'Share market insights and updates with {target} active clients',
    category: 'managing_clients',
    unit: 'touches',
    baseTarget: 5,
    maxAutoScale: 15,
    difficulty: 'easy',
    basePoints: 6,
    leadSources: ['sphere_influence', 'referrals'],
    isScalable: true
  },
  {
    id: 'client-consultations',
    title: 'Complete {target} buyer consultations',
    description: 'Conduct {target} detailed buyer consultation meetings',
    category: 'managing_clients',
    unit: 'appointments',
    baseTarget: 1,
    maxAutoScale: 4,
    difficulty: 'hard',
    basePoints: 20,
    leadSources: ['web_leads', 'referrals'],
    isScalable: true
  },
  {
    id: 'client-offers',
    title: 'Prepare {target} offers',
    description: 'Draft and submit {target} competitive offers for ready buyers',
    category: 'managing_clients',
    unit: 'updates',
    baseTarget: 1,
    maxAutoScale: 3,
    difficulty: 'hard',
    basePoints: 25,
    leadSources: ['web_leads', 'referrals'],
    isScalable: true
  },
  
  // Administrative Templates
  {
    id: 'admin-crm',
    title: 'Update {target} CRM records',
    description: 'Add or update {target} contact records in your CRM system',
    category: 'administrative',
    unit: 'updates',
    baseTarget: 15,
    maxAutoScale: 50,
    difficulty: 'easy',
    basePoints: 2,
    leadSources: [],
    isScalable: true
  },
  {
    id: 'admin-contracts',
    title: 'Review {target} contracts',
    description: 'Review and organize {target} client contracts or agreements',
    category: 'administrative',
    unit: 'reviews',
    baseTarget: 2,
    maxAutoScale: 8,
    difficulty: 'medium',
    basePoints: 8,
    leadSources: [],
    isScalable: true
  },
  {
    id: 'admin-cma',
    title: 'Complete {target} market analyses',
    description: 'Prepare {target} comparative market analyses for clients',
    category: 'administrative',
    unit: 'analyses',
    baseTarget: 1,
    maxAutoScale: 4,
    difficulty: 'medium',
    basePoints: 12,
    leadSources: [],
    isScalable: true
  },
  {
    id: 'admin-compliance',
    title: 'Complete {target} compliance tasks',
    description: 'Handle {target} regulatory or compliance requirements',
    category: 'administrative',
    unit: 'updates',
    baseTarget: 2,
    maxAutoScale: 6,
    difficulty: 'easy',
    basePoints: 5,
    leadSources: [],
    isScalable: true
  }
];

// Point values per unit by difficulty
const UNIT_POINT_VALUES = {
  easy: { leads: 3, calls: 2, emails: 1, appointments: 8, touches: 1, updates: 1, reviews: 4, analyses: 6 },
  medium: { leads: 5, calls: 3, emails: 2, appointments: 12, touches: 2, updates: 2, reviews: 6, analyses: 10 },
  hard: { leads: 8, calls: 5, emails: 3, appointments: 18, touches: 3, updates: 3, reviews: 10, analyses: 15 }
};

// Difficulty multipliers
const DIFFICULTY_MULTIPLIERS = {
  easy: 1.0,
  medium: 1.5,
  hard: 2.0
};

class TaskGeneratorService {
  
  /**
   * Generate personalized tasks based on gaps and action plan
   */
  generateTasks(actionPlan: ActionPlan, userLeadSources: LeadSource[], subscores: SubScores): GeneratedTask[] {
    const tasks: GeneratedTask[] = [];
    const { deltas, focusAreas } = actionPlan;
    
    // Step 1: Seed array with relevant task templates
    const relevantTemplates = this.getRelevantTemplates(focusAreas, userLeadSources, subscores);
    
    // Step 2: Scale templates based on deltas
    const scaledTasks = this.scaleTemplates(relevantTemplates, deltas, focusAreas);
    
    // Step 3: Cap at 10 tasks with category requirements
    const cappedTasks = this.capAndBalanceTasks(scaledTasks, subscores);
    
    // Step 4: Assign points based on formula
    const tasksWithPoints = this.assignPoints(cappedTasks);
    
    // Step 5: Sort by priority (focus areas first, then by gap size)
    const sortedTasks = this.sortTasksByPriority(tasksWithPoints, focusAreas);
    
    return sortedTasks;
  }
  
  /**
   * Get relevant templates based on focus areas and user lead sources
   */
  private getRelevantTemplates(focusAreas: string[], userLeadSources: LeadSource[], subscores: SubScores): TaskTemplate[] {
    const relevantTemplates: TaskTemplate[] = [];
    
    // Filter templates by focus areas and lead sources
    TASK_TEMPLATES.forEach(template => {
      const categoryName = this.mapCategoryToFocusArea(template.category);
      
      // Include if it's in focus areas or score is below 90
      const shouldInclude = focusAreas.includes(categoryName) || 
                           subscores[categoryName as keyof SubScores] < 90;
      
      if (shouldInclude) {
        // Check lead source compatibility
        if (template.leadSources.length === 0 || 
            template.leadSources.some(source => userLeadSources.includes(source))) {
          relevantTemplates.push(template);
        }
      }
    });
    
    return relevantTemplates;
  }
  
  /**
   * Scale templates based on activity deltas
   */
  private scaleTemplates(templates: TaskTemplate[], deltas: ActivityDeltas, focusAreas: string[]): GeneratedTask[] {
    const scaledTasks: GeneratedTask[] = [];
    
    templates.forEach(template => {
      const categoryName = this.mapCategoryToFocusArea(template.category);
      const scaleFactor = this.calculateScaleFactor(template, deltas, categoryName);
      
      // Calculate scaled target
      const scaledTarget = Math.min(
        template.baseTarget + Math.round(template.baseTarget * scaleFactor),
        template.maxAutoScale
      );
      
      // Only include if scaled target is meaningful
      if (scaledTarget > 0) {
        const task: GeneratedTask = {
          id: `${template.id}-${Date.now()}`,
          title: template.title.replace('{target}', scaledTarget.toString()),
          description: template.description.replace('{target}', scaledTarget.toString()),
          category: template.category,
          points: 0, // Will be calculated later
          difficulty: template.difficulty,
          target: scaledTarget,
          unit: template.unit,
          relatedLeadSources: template.leadSources,
          priority: focusAreas.includes(categoryName) ? 1 : 2,
          focusArea: focusAreas.includes(categoryName)
        };
        
        scaledTasks.push(task);
      }
    });
    
    return scaledTasks;
  }
  
  /**
   * Calculate scale factor based on deltas
   */
  private calculateScaleFactor(template: TaskTemplate, deltas: ActivityDeltas, categoryName: string): number {
    let deltaValue = 0;
    
    switch (categoryName) {
      case 'prospecting':
        if (template.unit === 'calls') deltaValue = deltas.prospecting.calls;
        else if (template.unit === 'leads') deltaValue = deltas.prospecting.newLeads;
        else if (template.unit === 'touches') deltaValue = deltas.prospecting.socialEngagements;
        break;
      case 'nurturing':
        if (template.unit === 'calls') deltaValue = deltas.nurturing.followUpCalls;
        else if (template.unit === 'emails') deltaValue = deltas.nurturing.emails;
        else if (template.unit === 'appointments') deltaValue = deltas.nurturing.appointments;
        break;
      case 'clientCare':
        if (template.unit === 'touches') deltaValue = deltas.clientCare.weeklyTouches;
        else if (template.unit === 'appointments') deltaValue = deltas.clientCare.showings;
        else if (template.unit === 'updates') deltaValue = deltas.clientCare.offers;
        break;
      case 'administrative':
        if (template.unit === 'updates') deltaValue = deltas.administrative.crmUpdates;
        else if (template.unit === 'reviews') deltaValue = deltas.administrative.contractReviews;
        else if (template.unit === 'analyses') deltaValue = deltas.administrative.marketAnalyses;
        break;
    }
    
    return Math.max(0, deltaValue / template.baseTarget);
  }
  
  /**
   * Cap at 10 tasks and ensure category balance
   */
  private capAndBalanceTasks(tasks: GeneratedTask[], subscores: SubScores): GeneratedTask[] {
    // Sort by priority and points potential
    const sortedTasks = tasks.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return b.target - a.target; // Higher targets first
    });
    
    // Ensure at least 1 task from each category (unless score >= 90)
    const categoryCounts = { prospecting: 0, nurturing: 0, clientCare: 0, administrative: 0 };
    const selectedTasks: GeneratedTask[] = [];
    
    // First pass: ensure category requirements
    sortedTasks.forEach(task => {
      if (selectedTasks.length >= 10) return;
      
      const categoryName = this.mapCategoryToFocusArea(task.category);
      const categoryScore = subscores[categoryName as keyof SubScores];
      
      if (categoryScore < 90 && categoryCounts[categoryName as keyof typeof categoryCounts] === 0) {
        selectedTasks.push(task);
        categoryCounts[categoryName as keyof typeof categoryCounts]++;
      }
    });
    
    // Second pass: fill remaining slots
    sortedTasks.forEach(task => {
      if (selectedTasks.length >= 10) return;
      if (!selectedTasks.find(t => t.id === task.id)) {
        selectedTasks.push(task);
      }
    });
    
    return selectedTasks.slice(0, 10);
  }
  
  /**
   * Assign points based on formula: points = target * unit_point_value * difficulty_multiplier
   */
  private assignPoints(tasks: GeneratedTask[]): GeneratedTask[] {
    return tasks.map(task => {
      const unitValues = UNIT_POINT_VALUES[task.difficulty];
      const unitPointValue = unitValues[task.unit as keyof typeof unitValues] || 1;
      const difficultyMultiplier = DIFFICULTY_MULTIPLIERS[task.difficulty];
      
      const calculatedPoints = Math.round(task.target * unitPointValue * difficultyMultiplier);
      
      return {
        ...task,
        points: Math.max(5, Math.min(calculatedPoints, 100)) // Cap between 5-100 points
      };
    });
  }
  
  /**
   * Sort tasks by priority (focus areas first, then by gap size)
   */
  private sortTasksByPriority(tasks: GeneratedTask[], focusAreas: string[]): GeneratedTask[] {
    return tasks.sort((a, b) => {
      // Focus areas first
      if (a.focusArea && !b.focusArea) return -1;
      if (!a.focusArea && b.focusArea) return 1;
      
      // Then by points (higher first)
      if (a.points !== b.points) return b.points - a.points;
      
      // Then by target (higher first)
      return b.target - a.target;
    });
  }
  
  /**
   * Map challenge category to focus area name
   */
  private mapCategoryToFocusArea(category: ChallengeCategory): string {
    switch (category) {
      case 'prospecting': return 'prospecting';
      case 'nurturing': return 'nurturing';
      case 'managing_clients': return 'clientCare';
      case 'administrative': return 'administrative';
      default: return 'administrative';
    }
  }
  
  /**
   * Create default tasks for sparse data scenarios
   */
  createDefaultTasks(userLeadSources: LeadSource[]): GeneratedTask[] {
    const defaultTemplates = TASK_TEMPLATES.filter(t => 
      t.category === 'prospecting' && 
      (t.leadSources.length === 0 || t.leadSources.some(source => userLeadSources.includes(source)))
    ).slice(0, 3);
    
    return defaultTemplates.map(template => ({
      id: `default-${template.id}-${Date.now()}`,
      title: template.title.replace('{target}', template.baseTarget.toString()),
      description: template.description.replace('{target}', template.baseTarget.toString()),
      category: template.category,
      points: template.basePoints,
      difficulty: template.difficulty,
      target: template.baseTarget,
      unit: template.unit,
      relatedLeadSources: template.leadSources,
      priority: 1,
      focusArea: true
    }));
  }
  
  /**
   * Apply holiday adjustments (halve targets)
   */
  applyHolidayAdjustments(tasks: GeneratedTask[]): GeneratedTask[] {
    return tasks.map(task => ({
      ...task,
      target: Math.max(1, Math.floor(task.target / 2)),
      points: Math.max(5, Math.floor(task.points / 2))
    }));
  }
  
  /**
   * Apply mega goal throttling for high achievers
   */
  applyMegaGoalThrottling(tasks: GeneratedTask[], isHighAchiever: boolean): GeneratedTask[] {
    if (!isHighAchiever) return tasks;
    
    const throttleFactor = 0.8; // 20% reduction for mega goals
    
    return tasks.map(task => ({
      ...task,
      target: Math.max(1, Math.floor(task.target * throttleFactor)),
      points: Math.max(5, Math.floor(task.points * throttleFactor))
    }));
  }
}

export default new TaskGeneratorService(); 