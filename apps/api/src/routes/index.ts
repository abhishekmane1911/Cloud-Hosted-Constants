import { Router } from 'express';
import authRouter from './auth.routes';
import projectsRouter from './projects.routes';
import analyticsRouter from './analytics.routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/projects', projectsRouter);
router.use('/analytics', analyticsRouter);

export default router;
