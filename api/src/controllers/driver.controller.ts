import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { prisma as prismaClient } from '../lib/prisma';
import { createError } from '../middlewares/error.middleware';

const togolesePhoneRegex = /^(\+228)?\d{8}$/;

const driverCreateSchema = z.object({
  name: z.string().trim().min(2, 'Le nom du chauffeur est requis.').max(100),
  phone: z
    .string()
    .trim()
    .regex(togolesePhoneRegex, 'Numéro de téléphone invalide. Utilise le format +228XXXXXXXX.'),
  licenseNumber: z.string().trim().min(4, 'Le numéro de permis est requis.').max(50),
  licenseExpiry: z.string().date('Date d’expiration invalide.'),
  experienceYears: z.number().int().min(0).max(80).default(0),
  photoUrl: z.string().trim().url('URL photo invalide.').optional(),
  isActive: z.boolean().default(true),
  userId: z.string().uuid().optional(),
});

const driverUpdateSchema = driverCreateSchema.partial();

type DriverCreateInput = z.infer<typeof driverCreateSchema>;
type DriverUpdateInput = z.infer<typeof driverUpdateSchema>;

const parseBody = <T>(
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  payload: unknown,
  next: NextFunction
): T | undefined => {
  const result = schema.safeParse(payload);

  if (!result.success) {
    next(createError(result.error.issues[0]?.message || 'Données invalides.', 400));
    return undefined;
  }

  return result.data;
};

const sanitizePayload = <T extends Record<string, unknown>>(payload: T): T =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== '')
  ) as T;

const handlePrismaError = (error: unknown, next: NextFunction): void => {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const prismaError = error as { code?: string; meta?: { target?: string[] } };

    if (prismaError.code === 'P2002') {
      const target = prismaError.meta?.target?.join(', ') || 'champ unique';
      next(createError(`Valeur déjà utilisée pour: ${target}.`, 409));
      return;
    }

    if (prismaError.code === 'P2003') {
      next(createError('Référence invalide vers un utilisateur ou une compagnie.', 400));
      return;
    }
  }

  next(createError('Erreur interne du serveur.', 500));
};

const formatDriver = (driver: any) => ({
  id: driver.id,
  companyId: driver.companyId,
  userId: driver.userId ?? null,
  name: driver.name,
  phone: driver.phone,
  licenseNumber: driver.licenseNumber,
  licenseExpiry: driver.licenseExpiry,
  experienceYears: driver.experienceYears,
  photoUrl: driver.photoUrl ?? null,
  isActive: driver.isActive,
  createdAt: driver.createdAt,
  updatedAt: driver.updatedAt,
  schedulesCount: driver._count?.schedules,
});

const canAccessCompanyResource = async (
  companyId: string,
  user?: Request['user']
): Promise<boolean> => {
  if (!user) {
    return false;
  }

  if (user.role === 'super_admin') {
    return true;
  }

  if (user.companyId === companyId) {
    return true;
  }

  const company = await prismaClient.company.findFirst({
    where: {
      id: companyId,
      adminId: user.id,
    },
    select: { id: true },
  });

  return Boolean(company);
};

export const getDrivers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const drivers = await prismaClient.driver.findMany({
      where: { companyId: req.params.companyId },
      orderBy: [{ createdAt: 'desc' }],
      include: {
        _count: {
          select: {
            schedules: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: drivers.map(formatDriver),
    });
  } catch (error) {
    handlePrismaError(error, next);
  }
};

export const getDriverById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const driver = await prismaClient.driver.findUnique({
      where: { id: req.params.id },
      include: {
        _count: {
          select: {
            schedules: true,
          },
        },
      },
    });

    if (!driver) {
      return next(createError('Chauffeur introuvable.', 404));
    }

    const allowed = await canAccessCompanyResource(driver.companyId, req.user);
    if (!allowed) {
      return next(createError('Accès interdit à ce chauffeur.', 403));
    }

    res.json({
      success: true,
      data: formatDriver(driver),
    });
  } catch (error) {
    handlePrismaError(error, next);
  }
};

export const createDriver = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const input = parseBody<DriverCreateInput>(driverCreateSchema, req.body, next);
  if (!input) return;

  try {
    const company = await prismaClient.company.findUnique({
      where: { id: req.params.companyId },
      select: { id: true },
    });

    if (!company) {
      return next(createError('Compagnie introuvable.', 404));
    }

    const driver = await prismaClient.driver.create({
      data: {
        companyId: req.params.companyId,
        ...sanitizePayload(input),
        licenseExpiry: new Date(input.licenseExpiry),
      },
      include: {
        _count: {
          select: {
            schedules: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Chauffeur créé avec succès.',
      data: formatDriver(driver),
    });
  } catch (error) {
    handlePrismaError(error, next);
  }
};

export const updateDriver = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const input = parseBody<DriverUpdateInput>(driverUpdateSchema, req.body, next);
  if (!input) return;

  const payload = sanitizePayload(input);

  if (Object.keys(payload).length === 0) {
    return next(createError('Aucune donnée à mettre à jour.', 400));
  }

  try {
    const existingDriver = await prismaClient.driver.findUnique({
      where: { id: req.params.id },
      select: { id: true, companyId: true },
    });

    if (!existingDriver) {
      return next(createError('Chauffeur introuvable.', 404));
    }

    const allowed = await canAccessCompanyResource(existingDriver.companyId, req.user);
    if (!allowed) {
      return next(createError('Accès interdit à ce chauffeur.', 403));
    }

    const driver = await prismaClient.driver.update({
      where: { id: req.params.id },
      data: {
        ...payload,
        ...(payload.licenseExpiry
          ? { licenseExpiry: new Date(payload.licenseExpiry) }
          : {}),
      },
      include: {
        _count: {
          select: {
            schedules: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Chauffeur mis à jour.',
      data: formatDriver(driver),
    });
  } catch (error) {
    handlePrismaError(error, next);
  }
};

export const deleteDriver = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const existingDriver = await prismaClient.driver.findUnique({
      where: { id: req.params.id },
      select: { id: true, companyId: true },
    });

    if (!existingDriver) {
      return next(createError('Chauffeur introuvable.', 404));
    }

    const allowed = await canAccessCompanyResource(existingDriver.companyId, req.user);
    if (!allowed) {
      return next(createError('Accès interdit à ce chauffeur.', 403));
    }

    await prismaClient.driver.delete({
      where: { id: req.params.id },
    });

    res.json({
      success: true,
      message: 'Chauffeur supprimé.',
    });
  } catch (error) {
    handlePrismaError(error, next);
  }
};
