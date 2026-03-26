import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import * as ctrl from '../controllers/horarios.controller.js';

const router = Router();
router.get   ('/',    authenticate,                               ctrl.listar);
router.post  ('/',    authenticate, authorize('admin','operador'), ctrl.crear);
router.delete('/:id', authenticate, authorize('admin','operador'), ctrl.eliminar);
export default router;