import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.middleware';

import * as ConstantsController from '../controllers/constants.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router({ mergeParams: true }); // mergeParams is important for nested routes like /projects/:projectId/constants

// All routes in this file are protected
router.use(protect);

router
  .route('/')
  .post(authorize('admin', 'editor'), ConstantsController.createConstant)
  .get(ConstantsController.getConstants);

router
  .route('/:constantId')
  .get(ConstantsController.getConstantById)
  .put(authorize('admin', 'editor'), ConstantsController.updateConstant)
  .delete(authorize('admin', 'editor'), ConstantsController.deleteConstant);

router.get('/:constantId/history', ConstantsController.getConstantHistory);
router.post('/:constantId/rollback', authorize('admin', 'editor'), ConstantsController.rollbackConstant);

export default router;
