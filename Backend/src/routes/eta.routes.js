import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import * as ctrl from '../controllers/eta.controller.js';

const router = Router();
router.get('/calcular',  authenticate, ctrl.calcular);
router.get('/historial', authenticate, ctrl.historial);
export default router;