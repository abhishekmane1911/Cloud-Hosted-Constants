import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import constantsRouter from './constants.routes';

// Placeholder for the controller we will create next
const placeholderController = (req: any, res: any) => res.status(501).json({ message: 'Not Implemented' });

const router = Router();

// All routes in this file are protected
router.use(protect);

// Nest the constants router
router.use('/:projectId/constants', constantsRouter);

router
  .route('/')
  .post(authorize('admin', 'editor'), placeholderController) // Create a project
  .get(placeholderController); // Get all projects for the user

router
  .route('/:projectId')
  .get(placeholderController) // Get a single project
  .put(authorize('admin', 'editor'), placeholderController) // Update a project
  .delete(authorize('admin', 'editor'), placeholderController); // Delete a project

export default router;
