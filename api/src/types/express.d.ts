import 'express';

export type AuthenticatedUser = {
  id: string;
  name?: string;
  email?: string;
  role: 'passenger' | 'company_admin' | 'driver' | 'super_admin';
  companyId?: string | null;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
