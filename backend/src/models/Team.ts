import mongoose, { Document, Schema } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  leaderId: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new Schema<ITeam>({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
    unique: true
  },
  leaderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Team leader ID is required']
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
TeamSchema.index({ leaderId: 1 });

export default mongoose.model<ITeam>('Team', TeamSchema); 