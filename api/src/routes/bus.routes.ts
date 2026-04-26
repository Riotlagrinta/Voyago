import { Router } from 'express';
import {
  getBuses, getBusById, createBus,
  updateBus, deleteBus, initializeBusSeats,
} from '../controllers/bus.controller';
import { authenticate, authorize, belongsToCompany } from '../middlewares/auth.middleware';

const router = Router();

router.get('/company/:companyId', authenticate, authorize('company_admin', 'super_admin'), belongsToCompany, getBuses);
router.get('/:id', authenticate, getBusById);
router.post('/company/:companyId', authenticate, authorize('company_admin', 'super_admin'), belongsToCompany, createBus);
router.put('/:id', authenticate, authorize('company_admin', 'super_admin'), updateBus);
router.post('/:id/seats/initialize', authenticate, authorize('company_admin', 'super_admin'), initializeBusSeats);
router.delete('/:id', authenticate, authorize('company_admin', 'super_admin'), deleteBus);

export default router;
