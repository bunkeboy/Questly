// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'agent' | 'team_leader' | 'admin';
  teamId?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  commissionGoal: number;
  averageSalesPrice: number;
  commissionRate: number;
  conversionRate: number;
  leadSources: LeadSource[];
  theme: ThemeType;
  fubConnected: boolean;
  fubApiKey?: string;
  gameState: GameState;
}

// Theme types
export type ThemeType = 'professional' | 'space' | 'medieval';

export interface ThemeConfig {
  name: string;
  displayName: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  icons: {
    task: string;
    reward: string;
    streak: string;
    level: string;
  };
  terminology: {
    task: string;
    reward: string;
    streak: string;
    level: string;
  };
}

// Lead source types
export type LeadSource = 
  | 'web_leads'
  | 'doorknocking'
  | 'open_houses'
  | 'sphere_influence'
  | 'referrals'
  | 'social_media'
  | 'paid_ads'
  | 'networking';

export interface LeadSourceConfig {
  id: LeadSource;
  name: string;
  description: string;
  icon: string;
  priority: number;
}

// Game state types
export interface GameState {
  points: number;
  streak: number;
  level: number;
  badges: Badge[];
  completedChallenges: number;
  totalChallenges: number;
  lastActiveDate: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum';
  earnedAt: Date;
}

// Challenge types
export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  dueDate: Date;
  completed: boolean;
  completedAt?: Date;
  relatedLeadSources?: LeadSource[];
}

export type ChallengeCategory = 'prospecting' | 'nurturing' | 'managing_clients' | 'administrative';

// Pipeline types
export interface PipelineData {
  leads: number;
  opportunities: number;
  underContract: number;
  closed: number;
  totalValue: number;
  averageValue: number;
  conversionRate: number;
}

export interface HealthScore {
  overall: number;
  prospecting: number;
  nurturing: number;
  managingClients: number;
  administrative: number;
}

// Goal calculation types
export interface GoalCalculation {
  annualGoal: number;
  averageSalesPrice: number;
  commissionRate: number;
  conversionRate: number;
  closingsNeeded: number;
  leadsNeeded: number;
  monthlyClosings: number;
  monthlyLeads: number;
  weeklyClosings: number;
  weeklyLeads: number;
  dailyLeads: number;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Team types
export interface Team {
  id: string;
  name: string;
  leaderId: string;
  members: User[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamStats {
  totalMembers: number;
  averageHealthScore: number;
  totalPoints: number;
  completedChallenges: number;
  topPerformers: User[];
}

// Follow Up Boss types
export interface FubContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FubDeal {
  id: string;
  name: string;
  value: number;
  stage: string;
  probability: number;
  expectedCloseDate: Date;
  contactId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FubActivity {
  id: string;
  type: string;
  description: string;
  contactId: string;
  dealId?: string;
  createdAt: Date;
  completedAt?: Date;
}

// Daily Task System Types
export interface DailyTask {
  id: string;
  title: string;
  description: string;
  category: 'prospecting' | 'nurturing' | 'clientCare' | 'administrative';
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  completedAt?: Date;
  progress?: number;
  preSelected?: boolean;
  source?: string;
  estimatedDuration?: number;
}

export interface DailyPlan {
  date: Date;
  selectedTasks: DailyTask[];
  candidateTasks: DailyTask[];
  completedTasks: number;
  completedPoints: number;
  totalPossiblePoints: number;
  trackStatus: 'on_track' | 'behind' | 'ahead';
  gapAnalysis?: {
    prospecting: number;
    nurturing: number;
    clientCare: number;
    administrative: number;
  };
  lastUpdated: Date;
}

export interface TaskAnalytics {
  avgCompletionRate: number;
  avgPointsPerDay: number;
  streakInfo: {
    current: number;
    longest: number;
    lastCompletionDate?: Date;
  };
  categoryPerformance: {
    prospecting: { completed: number; total: number; avgPoints: number };
    nurturing: { completed: number; total: number; avgPoints: number };
    clientCare: { completed: number; total: number; avgPoints: number };
    administrative: { completed: number; total: number; avgPoints: number };
  };
}

export interface HealthScores {
  overall: number;
  prospecting: number;
  nurturing: number;
  clientCare: number;
  administrative: number;
}

export interface TaskHistory {
  date: Date;
  trackStatus: 'on_track' | 'behind' | 'ahead';
  completedTasks: number;
  completedPoints: number;
  totalTasks: number;
  totalPoints: number;
  completionRate: string;
} 