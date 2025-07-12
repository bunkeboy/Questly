import mongoose, { Document, Schema } from 'mongoose';

export interface IPipelineData {
  leads: number;
  opportunities: number;
  underContract: number;
  closed: number;
  totalValue: number;
  averageValue: number;
  conversionRate: number;
}

export interface IHealthScore {
  overall: number;
  prospecting: number;
  nurturing: number;
  managingClients: number;
  administrative: number;
}

export interface IPipeline extends Document {
  userId: mongoose.Types.ObjectId;
  data: IPipelineData;
  healthScore: IHealthScore;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PipelineDataSchema = new Schema({
  leads: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  opportunities: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  underContract: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  closed: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  totalValue: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  averageValue: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  conversionRate: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 1
  }
});

const HealthScoreSchema = new Schema({
  overall: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 100
  },
  prospecting: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 100
  },
  nurturing: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 100
  },
  managingClients: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 100
  },
  administrative: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 100
  }
});

const PipelineSchema = new Schema<IPipeline>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  data: {
    type: PipelineDataSchema,
    required: true,
    default: () => ({
      leads: 0,
      opportunities: 0,
      underContract: 0,
      closed: 0,
      totalValue: 0,
      averageValue: 0,
      conversionRate: 0
    })
  },
  healthScore: {
    type: HealthScoreSchema,
    required: true,
    default: () => ({
      overall: 0,
      prospecting: 0,
      nurturing: 0,
      managingClients: 0,
      administrative: 0
    })
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
PipelineSchema.index({ userId: 1 });

export default mongoose.model<IPipeline>('Pipeline', PipelineSchema); 