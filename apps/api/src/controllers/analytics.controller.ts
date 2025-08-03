import { Request, Response } from 'express';
import * as AnalyticsService from '../services/analytics.service';

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const data = await AnalyticsService.getAnalytics(req.query);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
