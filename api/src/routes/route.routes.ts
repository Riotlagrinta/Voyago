import { Router } from 'express';
import {
  getRoutes, getRouteById, createRoute,
  updateRoute, deleteRoute, addRouteStop, removeRouteStop,
} from '../controllers/route.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Public
router.get('/', getRoutes);
router.get('/:id', getRouteById);

// Protégé — company_admin
router.post('/', authenticate, authorize('company_admin', 'super_admin'), createRoute);
router.put('/:id', authenticate, authorize('company_admin', 'super_admin'), updateRoute);
router.delete('/:id', authenticate, authorize('company_admin', 'super_admin'), deleteRoute);

// Escales
router.post('/:id/stops', authenticate, authorize('company_admin', 'super_admin'), addRouteStop);
router.delete('/:id/stops/:stopId', authenticate, authorize('company_admin', 'super_admin'), removeRouteStop);

export default router;
