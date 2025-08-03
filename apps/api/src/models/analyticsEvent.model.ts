import { Schema, model, Document, Types } from 'mongoose';

export interface IAnalyticsEvent extends Document {
  project?: Types.ObjectId;
  user?: Types.ObjectId;
  type: string;
  data?: any;
  createdAt: Date;
}

const AnalyticsEventSchema = new Schema<IAnalyticsEvent>({
  project: { type: Schema.Types.ObjectId, ref: 'Project' },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, required: true, index: true },
  data: { type: Schema.Types.Mixed },
}, { timestamps: { createdAt: true, updatedAt: false } }); // Only care about creation time

// TTL index to automatically remove documents after 30 days
AnalyticsEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // 30 days

const AnalyticsEvent = model<IAnalyticsEvent>('AnalyticsEvent', AnalyticsEventSchema);

export default AnalyticsEvent;
