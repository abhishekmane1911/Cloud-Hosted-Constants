import AnalyticsEvent, { IAnalyticsEvent } from '../models/analyticsEvent.model';
import { Types } from 'mongoose';

interface LogEventOptions {
  project?: string | Types.ObjectId;
  user?: string | Types.ObjectId;
  data?: any;
}

/**
 * Logs an analytics event. This is a "fire and forget" function,
 * meaning it runs in the background without being awaited, so it doesn't
 * block the main execution flow.
 * @param type - The type of event to log.
 * @param options - Additional data for the event.
 */
export const logEvent = (type: string, options: LogEventOptions = {}): void => {
  const { project, user, data } = options;

  const event = new AnalyticsEvent({
    type,
    project,
    user,
    data,
  });

  event.save().catch(err => {
    // We catch errors here to prevent unhandled promise rejections,
    // but we don't want to block anything, so we just log it.
    console.error('Failed to log analytics event:', err);
  });
};

interface AnalyticsQuery {
  projectId?: string;
  type?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export const getAnalytics = async (query: AnalyticsQuery) => {
  const { projectId, type, from, to, page = 1, limit = 20 } = query;
  const filter: any = {};

  if (projectId) filter.project = projectId;
  if (type) filter.type = type;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const events = await AnalyticsEvent.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('user', 'name email')
    .populate('project', 'name');

  const total = await AnalyticsEvent.countDocuments(filter);

  return {
    events,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};
