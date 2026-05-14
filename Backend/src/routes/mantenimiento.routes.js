import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import * as ctrl from '../controllers/mantenimiento.controller.js';

const router = Router();
router.get   ('/tipos',       authenticate,                                        ctrl.listarTipos);
router.get   ('/ordenes',     authenticate, authorize('admin','operador'),          ctrl.listarOrdenes);
router.post  ('/ordenes',     authenticate, authorize('admin','operador','conductor'), ctrl.crearOrden);
router.patch ('/ordenes/:id', authenticate, authorize('admin','operador'),          ctrl.actualizarEstado);
router.get   ('/alertas',     authenticate, authorize('admin','operador'),          ctrl.alertas);
export default router;