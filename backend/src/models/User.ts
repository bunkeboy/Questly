import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type LeadSource = 
  | 'web_leads'
  | 'doorknocking'
  | 'open_houses'
  | 'sphere_influence'
  | 'referrals'
  | 'social_media'
  | 'paid_ads'
  | 'networking';

export type ThemeType = 'professional' | 'space' | 'medieval';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum';
  earnedAt: Date;
}

export interface GameState {
  points: number;
  streak: number;
  level: number;
  badges: Badge[];
  completedChallenges: number;
  totalChallenges: number;
  lastActiveDate: Date;
}

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'agent' | 'team_leader' | 'admin';
  teamId?: mongoose.Types.ObjectId;
  avatar?: string;
  
  // Profile fields
  commissionGoal: number;
  averageSalesPrice: number;
  commissionRate: number;
  conversionRate: number;
  leadSources: LeadSource[];
  theme: ThemeType;
  fubConnected: boolean;
  fubApiKey?: string;
  
  // Game state
  gameState: GameState;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  calculateGoals(): {
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
  };
}

const BadgeSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  rarity: { 
    type: String, 
    enum: ['bronze', 'silver', 'gold', 'platinum'], 
    required: true 
  },
  earnedAt: { type: Date, default: Date.now }
});

const GameStateSchema = new Schema({
  points: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  badges: [BadgeSchema],
  completedChallenges: { type: Number, default: 0 },
  totalChallenges: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: Date.now }
});

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  role: {
    type: String,
    enum: ['agent', 'team_leader', 'admin'],
    default: 'agent'
  },
  teamId: {
    type: Schema.Types.ObjectId,
    ref: 'Team'
  },
  avatar: String,
  
  // Profile fields
  commissionGoal: {
    type: Number,
    default: 0
  },
  averageSalesPrice: {
    type: Number,
    default: 1200000
  },
  commissionRate: {
    type: Number,
    default: 0.025
  },
  conversionRate: {
    type: Number,
    default: 0.07
  },
  leadSources: [{
    type: String,
    enum: ['web_leads', 'doorknocking', 'open_houses', 'sphere_influence', 'referrals', 'social_media', 'paid_ads', 'networking']
  }],
  theme: {
    type: String,
    enum: ['professional', 'space', 'medieval'],
    default: 'professional'
  },
  fubConnected: {
    type: Boolean,
    default: false
  },
  fubApiKey: String,
  
  // Game state
  gameState: {
    type: GameStateSchema,
    default: () => ({
      points: 0,
      streak: 0,
      level: 1,
      badges: [],
      completedChallenges: 0,
      totalChallenges: 0,
      lastActiveDate: new Date()
    })
  }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Calculate goals method
UserSchema.methods.calculateGoals = function() {
  const { commissionGoal, averageSalesPrice, commissionRate, conversionRate } = this;
  
  const closingsNeeded = Math.ceil(commissionGoal / (averageSalesPrice * commissionRate));
  const leadsNeeded = Math.ceil(closingsNeeded / conversionRate);
  const monthlyClosings = Math.ceil(closingsNeeded / 12);
  const monthlyLeads = Math.ceil(leadsNeeded / 12);
  const weeklyClosings = Math.ceil(closingsNeeded / 52);
  const weeklyLeads = Math.ceil(leadsNeeded / 52);
  const dailyLeads = Math.ceil(leadsNeeded / 365);

  return {
    annualGoal: commissionGoal,
    averageSalesPrice,
    commissionRate,
    conversionRate,
    closingsNeeded,
    leadsNeeded,
    monthlyClosings,
    monthlyLeads,
    weeklyClosings,
    weeklyLeads,
    dailyLeads
  };
};

export default mongoose.model<IUser>('User', UserSchema); 