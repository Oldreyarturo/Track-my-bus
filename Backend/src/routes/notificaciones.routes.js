import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import * as ctrl from '../controllers/notificaciones.controller.js';

const router = Router();
router.get   ('/',                   authenticate, ctrl.listar);
router.patch ('/leidas',             authenticate, ctrl.marcarTodasLeidas);
router.patch ('/:id/leida',          authenticate, ctrl.marcarLeida);
router.post  ('/push',               authenticate, ctrl.suscribirPush);
router.get   ('/favoritos',          authenticate, ctrl.listarFavoritos);
router.post  ('/favoritos',          authenticate, ctrl.agregarFavorito);
router.delete('/favoritos/:ruta_id', authenticate, ctrl.eliminarFavorito);
export default router;