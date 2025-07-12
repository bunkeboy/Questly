import mongoose, { Document, Schema } from 'mongoose';
import { LeadSource } from './User';

export type ChallengeCategory = 'prospecting' | 'nurturing' | 'managing_clients' | 'administrative';

export interface IChallenge extends Document {
  title: string;
  description: string;
  category: ChallengeCategory;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  dueDate: Date;
  completed: boolean;
  completedAt?: Date;
  relatedLeadSources?: LeadSource[];
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ChallengeSchema = new Schema<IChallenge>({
  title: {
    type: String,
    required: [true, 'Challenge title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Challenge description is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['prospecting', 'nurturing', 'managing_clients', 'administrative'],
    required: [true, 'Challenge category is required']
  },
  points: {
    type: Number,
    required: [true, 'Points are required'],
    min: [1, 'Points must be at least 1']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: [true, 'Difficulty is required'],
    default: 'medium'
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  relatedLeadSources: [{
    type: String,
    enum: ['web_leads', 'doorknocking', 'open_houses', 'sphere_influence', 'referrals', 'social_media', 'paid_ads', 'networking']
  }],
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  }
}, {
  timestamps: true,
  toJSON: { 
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Index for efficient queries
ChallengeSchema.index({ userId: 1, dueDate: 1 });
ChallengeSchema.index({ userId: 1, completed: 1 });

export default mongoose.model<IChallenge>('Challenge', ChallengeSchema); 