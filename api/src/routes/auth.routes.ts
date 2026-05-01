import { Router } from 'express';
import { register, login, getMe, refreshToken, logout, guestLogin } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// POST /api/v1/auth/register
router.post('/register', register);

// POST /api/v1/auth/guest — session anonyme automatique
router.post('/guest', guestLogin);

// POST /api/v1/auth/login
router.post('/login', login);

// GET /api/v1/auth/me
router.get('/me', authenticate, getMe);

// POST /api/v1/auth/refresh
router.post('/refresh', refreshToken);

// POST /api/v1/auth/logout
router.post('/logout', authenticate, logout);

export default router;
