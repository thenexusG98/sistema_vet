import { Router } from 'express';
import { saleController } from '../controllers/sale.controller.js';
import { authenticate, authorize, ensureClinic } from '../middlewares/auth.js';
import { validateBody } from '../middlewares/validate.js';
import { createSaleSchema } from '../validators/product.validator.js';
import { activityLogger } from '../middlewares/activityLogger.js';
import { tenantGuard, tenantParamGuard } from '../middlewares/tenantGuard.js';

const router = Router();

router.use(authenticate, ensureClinic);

router.get('/', saleController.getAll);
router.get('/cash-cut', authorize('ADMIN', 'CAJA'), saleController.cashCut);
router.get('/:id', tenantParamGuard('sale'), saleController.getById);
router.post('/', authorize('ADMIN', 'CAJA'), validateBody(createSaleSchema), tenantGuard('clientId', 'client'), activityLogger('CREATE', 'Sale'), saleController.create);
router.patch('/:id/cancel', authorize('ADMIN'), tenantParamGuard('sale'), activityLogger('CANCEL', 'Sale'), saleController.cancel);

export default router;
