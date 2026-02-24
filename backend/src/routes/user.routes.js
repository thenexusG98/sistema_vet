import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticate, authorize, ensureClinic } from '../middlewares/auth.js';
import { tenantParamGuard } from '../middlewares/tenantGuard.js';

const router = Router();

router.use(authenticate, ensureClinic);

router.get('/', authorize('ADMIN'), userController.getAll);
router.get('/vets', userController.getVets);
router.get('/:id', authorize('ADMIN'), tenantParamGuard('user'), userController.getById);
router.put('/:id', authorize('ADMIN'), tenantParamGuard('user'), userController.update);
router.patch('/:id/toggle-active', authorize('ADMIN'), tenantParamGuard('user'), userController.toggleActive);

export default router;
