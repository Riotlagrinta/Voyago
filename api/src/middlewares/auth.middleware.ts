import { Request, Response, NextFunction } from 'express';

// MODE DÉMONSTRATION TOTALE : Plus aucune vérification de token
export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  // Injecter systématiquement un utilisateur Super Admin
  req.user = {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Voyago Guest Admin',
    email: 'guest@voyago.tg',
    role: 'super_admin'
  };
  next();
};

export const authorize = (..._roles: string[]) => {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    next(); // Toujours autorisé
  };
};

export const belongsToCompany = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  next(); // Toujours autorisé
};
