import { Router } from 'express';
import { getAllStations, getStationById, createStation } from '../controllers/station.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Public
router.get('/', getAllStations);
router.get('/:id', getStationById);

// Protégé — super_admin
router.post('/', authenticate, authorize('super_admin'), createStation);

export default router;
