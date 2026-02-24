import { Router } from 'express';
import { supplierController } from '../controllers/supplier.controller.js';
import { authenticate, authorize, ensureClinic } from '../middlewares/auth.js';
import { tenantParamGuard } from '../middlewares/tenantGuard.js';

const router = Router();

router.use(authenticate, ensureClinic);

router.get('/', supplierController.getAll);
router.get('/:id', tenantParamGuard('supplier'), supplierController.getById);
router.post('/', authorize('ADMIN'), supplierController.create);
router.put('/:id', authorize('ADMIN'), tenantParamGuard('supplier'), supplierController.update);
router.delete('/:id', authorize('ADMIN'), tenantParamGuard('supplier'), supplierController.delete);

export default router;
