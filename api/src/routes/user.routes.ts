import { Router } from 'express';
import { getProfile, updateProfile, changePassword, deleteAccount } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Toutes les routes utilisateur sont protégées
router.use(authenticate);

// GET /api/v1/users/profile
router.get('/profile', getProfile);

// PATCH /api/v1/users/profile
router.patch('/profile', updateProfile);

// PATCH /api/v1/users/change-password
router.patch('/change-password', changePassword);

// DELETE /api/v1/users/account
router.delete('/account', deleteAccount);

export default router;
