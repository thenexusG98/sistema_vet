import { Router } from 'express';
import { medicalRecordController } from '../controllers/medicalRecord.controller.js';
import { authenticate, authorize, ensureClinic } from '../middlewares/auth.js';
import { validateBody } from '../middlewares/validate.js';
import { createMedicalRecordSchema, updateMedicalRecordSchema } from '../validators/medicalRecord.validator.js';
import { activityLogger } from '../middlewares/activityLogger.js';
import { tenantGuard, tenantParamGuard } from '../middlewares/tenantGuard.js';

const router = Router();

router.use(authenticate, ensureClinic);

router.get('/', medicalRecordController.getAll);
router.get('/:id', tenantParamGuard('medicalRecord'), medicalRecordController.getById);
router.get('/pet/:petId', medicalRecordController.getByPet);
router.post('/', authorize('ADMIN', 'VETERINARIO'), validateBody(createMedicalRecordSchema), tenantGuard(['petId', 'pet'], ['appointmentId', 'appointment']), activityLogger('CREATE', 'MedicalRecord'), medicalRecordController.create);
router.put('/:id', authorize('ADMIN', 'VETERINARIO'), tenantParamGuard('medicalRecord'), validateBody(updateMedicalRecordSchema), activityLogger('UPDATE', 'MedicalRecord'), medicalRecordController.update);

export default router;
