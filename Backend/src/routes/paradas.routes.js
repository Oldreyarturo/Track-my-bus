import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import * as ctrl from '../controllers/paradas.controller.js';

const router = Router();
router.get   ('/',    authenticate,                               ctrl.listar);
router.post  ('/',    authenticate, authorize('admin','operador'), ctrl.crear);
router.put   ('/:id', authenticate, authorize('admin','operador'), ctrl.actualizar);
router.delete('/:id', authenticate, authorize('admin','operador'), ctrl.eliminar);
export default router;