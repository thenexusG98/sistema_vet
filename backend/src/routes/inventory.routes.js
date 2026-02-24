import { Router } from 'express';
import { inventoryController } from '../controllers/sale.controller.js';
import { authenticate, authorize, ensureClinic } from '../middlewares/auth.js';
import { validateBody } from '../middlewares/validate.js';
import { inventoryMovementSchema } from '../validators/product.validator.js';
import { tenantGuard } from '../middlewares/tenantGuard.js';

const router = Router();

router.use(authenticate, ensureClinic);

router.get('/movements', inventoryController.getMovements);
router.post('/movements', authorize('ADMIN'), validateBody(inventoryMovementSchema), tenantGuard('productId', 'product'), inventoryController.createMovement);

export default router;
