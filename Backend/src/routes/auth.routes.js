import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import * as ctrl from '../controllers/auth.controller.js';

const router = Router();

router.post('/registro',                   ctrl.registro);
router.post('/login',                      ctrl.login);
router.post('/logout',                     ctrl.logout);
router.get ('/me',        authenticate,    ctrl.me);
router.patch('/credencial', authenticate,  ctrl.subirCredencial);
router.patch('/credencial/:id/validar', authenticate, authorize('admin'), ctrl.validarCredencial);

export default router;