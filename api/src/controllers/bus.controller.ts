import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { prisma as prismaClient } from '../lib/prisma';
import { createError } from '../middlewares/error.middleware';
import { SeatType } from '@prisma/client';

const busCreateSchema = z.object({
  plateNumber: z.string().trim().min(3, 'L’immatriculation est requise.').max(20),
  name: z.string().trim().max(100).optional(),
  type: z.enum(['standard', 'vip', 'climatise', 'minibus']).default('standard'),
  capacity: z.number().int().min(1, 'La capacité doit être supérieure à 0.'),
  status: z.enum(['active', 'maintenance', 'inactive']).default('active'),
  photoUrl: z.string().trim().url('URL photo invalide.').optional(),
  amenities: z.array(z.string().trim().min(1).max(50)).default([]),
  manufactureYear: z.number().int().min(1980).max(2100).optional(),
});

const busUpdateSchema = busCreateSchema.partial();

type BusCreateInput = z.infer<typeof busCreateSchema>;
type BusUpdateInput = z.infer<typeof busUpdateSchema>;

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
  }

  next(createError('Erreur interne du serveur.', 500));
};

const formatBus = (bus: any) => ({
  id: bus.id,
  companyId: bus.companyId,
  plateNumber: bus.plateNumber,
  name: bus.name ?? null,
  type: bus.type,
  capacity: bus.capacity,
  status: bus.status,
  photoUrl: bus.photoUrl ?? null,
  amenities: bus.amenities ?? [],
  manufactureYear: bus.manufactureYear ?? null,
  createdAt: bus.createdAt,
  updatedAt: bus.updatedAt,
  company: bus.company
    ? {
        id: bus.company.id,
        name: bus.company.name,
        slug: bus.company.slug,
      }
    : undefined,
  seatsCount: bus._count?.seats,
  schedulesCount: bus._count?.schedules,
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

export const getBuses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const buses = await prismaClient.bus.findMany({
      where: { companyId: req.params.companyId },
      orderBy: [{ createdAt: 'desc' }],
      include: {
        _count: {
          select: {
            seats: true,
            schedules: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: buses.map(formatBus),
    });
  } catch (error) {
    handlePrismaError(error, next);
  }
};

export const getBusById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const bus = await prismaClient.bus.findUnique({
      where: { id: req.params.id },
      include: {
        company: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: {
            seats: true,
            schedules: true,
          },
        },
      },
    });

    if (!bus) {
      return next(createError('Bus introuvable.', 404));
    }

    const allowed = await canAccessCompanyResource(bus.companyId, req.user);
    if (!allowed) {
      return next(createError('Accès interdit à ce bus.', 403));
    }

    res.json({
      success: true,
      data: formatBus(bus),
    });
  } catch (error) {
    handlePrismaError(error, next);
  }
};

export const createBus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const input = parseBody<BusCreateInput>(busCreateSchema, req.body, next);
  if (!input) return;

  try {
    const company = await prismaClient.company.findUnique({
      where: { id: req.params.companyId },
      select: { id: true },
    });

    if (!company) {
      return next(createError('Compagnie introuvable.', 404));
    }

    const bus = await prismaClient.bus.create({
      data: {
        companyId: req.params.companyId,
        ...sanitizePayload(input),
      },
      include: {
        _count: {
          select: {
            seats: true,
            schedules: true,
          },
        },
      },
    });

    // Auto-initialiser les sièges (4 colonnes, disposition 2+allée+2)
    const cols = 4;
    const rows = Math.ceil(bus.capacity / cols);
    const seatsData = [];
    let seatNumber = 1;
    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        if (seatNumber <= bus.capacity) {
          seatsData.push({
            busId: bus.id,
            seatNumber: seatNumber++,
            rowPos: r,
            colPos: c,
            type: SeatType.standard,
          });
        }
      }
    }
    if (seatsData.length > 0) {
      await prismaClient.seat.createMany({ data: seatsData });
    }

    res.status(201).json({
      success: true,
      message: 'Bus créé avec succès.',
      data: formatBus({ ...bus, _count: { seats: seatsData.length, schedules: 0 } }),
    });
  } catch (error) {
    handlePrismaError(error, next);
  }
};

export const updateBus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const input = parseBody<BusUpdateInput>(busUpdateSchema, req.body, next);
  if (!input) return;

  const payload = sanitizePayload(input);

  if (Object.keys(payload).length === 0) {
    return next(createError('Aucune donnée à mettre à jour.', 400));
  }

  try {
    const existingBus = await prismaClient.bus.findUnique({
      where: { id: req.params.id },
      select: { id: true, companyId: true },
    });

    if (!existingBus) {
      return next(createError('Bus introuvable.', 404));
    }

    const allowed = await canAccessCompanyResource(existingBus.companyId, req.user);
    if (!allowed) {
      return next(createError('Accès interdit à ce bus.', 403));
    }

    const bus = await prismaClient.bus.update({
      where: { id: req.params.id },
      data: payload,
      include: {
        _count: {
          select: {
            seats: true,
            schedules: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Bus mis à jour.',
      data: formatBus(bus),
    });
  } catch (error) {
    handlePrismaError(error, next);
  }
};

export const initializeBusSeats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const schema = z.object({
    rows: z.number().int().min(1).max(20),
    cols: z.number().int().min(1).max(10),
  });

  const input = parseBody<any>(schema, req.body, next);
  if (!input) return;

  try {
    const bus = await prismaClient.bus.findUnique({
      where: { id: req.params.id },
      select: { id: true, companyId: true, capacity: true },
    });

    if (!bus) {
      return next(createError('Bus introuvable.', 404));
    }

    const allowed = await canAccessCompanyResource(bus.companyId, req.user);
    if (!allowed) {
      return next(createError('Accès interdit à ce bus.', 403));
    }

    // Supprimer les anciens sièges
    await prismaClient.seat.deleteMany({
      where: { busId: bus.id },
    });

    // Créer les nouveaux sièges
    const seatsData = [];
    let seatNumber = 1;

    for (let r = 1; r <= input.rows; r++) {
      for (let c = 1; c <= input.cols; c++) {
        // Optionnel: On peut sauter des cases pour l'allée centrale par exemple
        // Pour l'instant on fait simple: une grille complète
        if (seatNumber <= bus.capacity) {
          seatsData.push({
            busId: bus.id,
            seatNumber: seatNumber++,
            rowPos: r,
            colPos: c,
            type: SeatType.standard,
          });
        }
      }
    }

    await prismaClient.seat.createMany({
      data: seatsData,
    });

    res.json({
      success: true,
      message: `${seatsData.length} sièges initialisés pour ce bus.`,
      data: seatsData,
    });
  } catch (error) {
    handlePrismaError(error, next);
  }
};

export const deleteBus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const existingBus = await prismaClient.bus.findUnique({
      where: { id: req.params.id },
      select: { id: true, companyId: true },
    });

    if (!existingBus) {
      return next(createError('Bus introuvable.', 404));
    }

    const allowed = await canAccessCompanyResource(existingBus.companyId, req.user);
    if (!allowed) {
      return next(createError('Accès interdit à ce bus.', 403));
    }

    await prismaClient.bus.delete({
      where: { id: req.params.id },
    });

    res.json({
      success: true,
      message: 'Bus supprimé.',
    });
  } catch (error) {
    handlePrismaError(error, next);
  }
};
