import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import * as ctrl from '../controllers/asignaciones.controller.js';

const router = Router();
router.get   ('/',            authenticate, authorize('admin','operador'), ctrl.listar);
router.post('/', authenticate, authorize('admin','operador','conductor'), ctrl.crear);
router.patch ('/:id/cerrar',  authenticate, authorize('admin','operador'), ctrl.cerrar);
export default router;