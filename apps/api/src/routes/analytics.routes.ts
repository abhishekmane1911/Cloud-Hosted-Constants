import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.middleware';

import * as AnalyticsController from '../controllers/analytics.controller';

const router = Router();

// All routes are protected and restricted to admin/editor
router.use(protect, authorize('admin', 'editor'));

router.get('/', AnalyticsController.getAnalytics); // Get analytics data

export default router;
