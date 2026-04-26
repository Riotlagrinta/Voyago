import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createError } from './error.middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'voyago-dev-secret';

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as Request['user'];
      req.user = decoded;
      next();
      return;
    } catch {
      next(createError('Token invalide.', 401));
      return;
    }
  }

  // Fallback démo si aucun token n'est fourni.
  req.user = {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Voyago Guest Admin',
    email: 'guest@voyago.tg',
    role: 'super_admin',
    companyId: 'demo-company-id',
  };
  next();
};

export const authorize = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(createError('Non authentifié.', 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(createError('Accès interdit.', 403));
      return;
    }

    next();
  };
};

export const belongsToCompany = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    next(createError('Non authentifié.', 401));
    return;
  }

  if (req.user.role === 'super_admin') {
    next();
    return;
  }

  const targetCompanyId = req.params.companyId;
  if (!targetCompanyId || req.user.companyId === targetCompanyId) {
    next();
    return;
  }

  next(createError('Accès interdit à cette compagnie.', 403));
};
