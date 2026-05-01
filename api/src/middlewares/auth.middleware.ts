import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createError } from './error.middleware';
import { JWT_SECRET } from '../lib/secrets';

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

  next(createError('Token manquant ou invalide.', 401));
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
