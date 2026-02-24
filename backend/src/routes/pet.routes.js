import { Router } from 'express';
import { petController } from '../controllers/pet.controller.js';
import { authenticate, authorize, ensureClinic } from '../middlewares/auth.js';
import { validateBody } from '../middlewares/validate.js';
import { createPetSchema, updatePetSchema } from '../validators/pet.validator.js';
import { activityLogger } from '../middlewares/activityLogger.js';
import { tenantGuard, tenantParamGuard } from '../middlewares/tenantGuard.js';

const router = Router();

router.use(authenticate, ensureClinic);

router.get('/', petController.getAll);
router.get('/:id', tenantParamGuard('pet'), petController.getById);
router.get('/:id/timeline', tenantParamGuard('pet'), petController.getTimeline);
router.post('/', authorize('ADMIN', 'RECEPCION', 'VETERINARIO'), validateBody(createPetSchema), tenantGuard('clientId', 'client'), activityLogger('CREATE', 'Pet'), petController.create);
router.put('/:id', authorize('ADMIN', 'RECEPCION', 'VETERINARIO'), tenantParamGuard('pet'), validateBody(updatePetSchema), activityLogger('UPDATE', 'Pet'), petController.update);
router.delete('/:id', authorize('ADMIN'), tenantParamGuard('pet'), activityLogger('DELETE', 'Pet'), petController.delete);

export default router;
