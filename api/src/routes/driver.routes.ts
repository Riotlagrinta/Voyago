import { Router } from 'express';
import { getDrivers, getDriverById, createDriver, updateDriver, deleteDriver } from '../controllers/driver.controller';
import { authenticate, authorize, belongsToCompany } from '../middlewares/auth.middleware';

const router = Router();

router.get('/company/:companyId', authenticate, authorize('company_admin', 'super_admin'), belongsToCompany, getDrivers);
router.get('/:id', authenticate, getDriverById);
router.post('/company/:companyId', authenticate, authorize('company_admin', 'super_admin'), belongsToCompany, createDriver);
router.put('/:id', authenticate, authorize('company_admin', 'super_admin'), updateDriver);
router.delete('/:id', authenticate, authorize('company_admin', 'super_admin'), deleteDriver);

export default router;
