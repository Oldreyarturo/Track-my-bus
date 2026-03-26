import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import * as ctrl from '../controllers/zonas.controller.js';

const router = Router();
router.get   ('/',    authenticate,                    ctrl.listar);
router.post  ('/',    authenticate, authorize('admin'), ctrl.crear);
router.put   ('/:id', authenticate, authorize('admin'), ctrl.actualizar);
router.delete('/:id', authenticate, authorize('admin'), ctrl.eliminar);
export default router;