import { Router } from 'express';
import { appointmentController } from '../controllers/appointment.controller.js';
import { authenticate, authorize, ensureClinic } from '../middlewares/auth.js';
import { validateBody } from '../middlewares/validate.js';
import { createAppointmentSchema, updateAppointmentSchema } from '../validators/appointment.validator.js';
import { activityLogger } from '../middlewares/activityLogger.js';
import { tenantGuard, tenantParamGuard } from '../middlewares/tenantGuard.js';

const router = Router();

router.use(authenticate, ensureClinic);

router.get('/', appointmentController.getAll);
router.get('/today', appointmentController.getToday);
router.get('/calendar', appointmentController.getCalendar);
router.get('/:id', tenantParamGuard('appointment'), appointmentController.getById);
router.post('/', authorize('ADMIN', 'RECEPCION', 'VETERINARIO'), validateBody(createAppointmentSchema), tenantGuard(['petId', 'pet'], ['vetId', 'user']), activityLogger('CREATE', 'Appointment'), appointmentController.create);
router.put('/:id', authorize('ADMIN', 'RECEPCION', 'VETERINARIO'), tenantParamGuard('appointment'), validateBody(updateAppointmentSchema), activityLogger('UPDATE', 'Appointment'), appointmentController.update);
router.patch('/:id/cancel', authorize('ADMIN', 'RECEPCION'), tenantParamGuard('appointment'), activityLogger('CANCEL', 'Appointment'), appointmentController.cancel);

export default router;
