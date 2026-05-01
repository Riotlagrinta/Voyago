import { Router } from 'express';
import {
  getSchedules, getScheduleById, createSchedule,
  updateSchedule, deleteSchedule, getScheduleSeats,
  getLatestScheduleLocation
} from '../controllers/schedule.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Public
router.get('/', getSchedules);
router.get('/:id', getScheduleById);
router.get('/:id/seats', getScheduleSeats);

// Protégé - GPS position (passager authentifié uniquement)
router.get('/:id/location', authenticate, getLatestScheduleLocation);

// Protégé - company_admin
router.post('/', authenticate, authorize('company_admin', 'super_admin'), createSchedule);
router.put('/:id', authenticate, authorize('company_admin', 'super_admin'), updateSchedule);
router.delete('/:id', authenticate, authorize('company_admin', 'super_admin'), deleteSchedule);

export default router;
