import { Router } from 'express';
import { clientController } from '../controllers/client.controller.js';
import { authenticate, authorize, ensureClinic } from '../middlewares/auth.js';
import { validateBody } from '../middlewares/validate.js';
import { createClientSchema, updateClientSchema } from '../validators/client.validator.js';
import { activityLogger } from '../middlewares/activityLogger.js';
import { tenantParamGuard } from '../middlewares/tenantGuard.js';

const router = Router();

router.use(authenticate, ensureClinic);

router.get('/', clientController.getAll);
router.get('/:id', tenantParamGuard('client'), clientController.getById);
router.post('/', authorize('ADMIN', 'RECEPCION', 'VETERINARIO'), validateBody(createClientSchema), activityLogger('CREATE', 'Client'), clientController.create);
router.put('/:id', authorize('ADMIN', 'RECEPCION', 'VETERINARIO'), tenantParamGuard('client'), validateBody(updateClientSchema), activityLogger('UPDATE', 'Client'), clientController.update);
router.delete('/:id', authorize('ADMIN'), tenantParamGuard('client'), activityLogger('DELETE', 'Client'), clientController.delete);

export default router;
