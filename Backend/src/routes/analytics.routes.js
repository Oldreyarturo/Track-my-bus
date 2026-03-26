import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import * as ctrl from '../controllers/analytics.controller.js';

const router = Router();
router.get('/diario',      authenticate, authorize('admin','operador'), ctrl.diario);
router.get('/demanda',     authenticate, authorize('admin','operador'), ctrl.demanda);
router.get('/resumen',     authenticate, authorize('admin','operador'), ctrl.resumen);
router.get('/velocidades', authenticate, authorize('admin','operador'), ctrl.velocidades);
export default router;