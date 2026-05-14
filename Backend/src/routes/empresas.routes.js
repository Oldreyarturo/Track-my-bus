import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import * as ctrl from '../controllers/empresas.controller.js';

const router = Router();
router.get   ('/',                authenticate,                               ctrl.listar);
router.get   ('/:id',             authenticate,                               ctrl.obtener);
router.post  ('/',                authenticate, authorize('admin'),            ctrl.crear);
router.put   ('/:id',             authenticate, authorize('admin'),            ctrl.actualizar);
router.delete('/:id',             authenticate, authorize('admin'),            ctrl.desactivar);
router.get   ('/:id/operadores',  authenticate, authorize('admin','operador'), ctrl.listarOperadores);
router.post  ('/:id/operadores',  authenticate, authorize('admin'),            ctrl.asignarOperador);
export default router;