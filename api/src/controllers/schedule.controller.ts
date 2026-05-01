import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { prisma, pool } from '../lib/prisma';
import { createError } from '../middlewares/error.middleware';

const scheduleCreateSchema = z.object({
  routeId: z.string().uuid('routeId invalide.'),
  busId: z.string().uuid('busId invalide.'),
  driverId: z.string().uuid('driverId invalide.').optional(),
  departureTime: z.string().datetime('departureTime invalide.'),
  arrivalTime: z.string().datetime('arrivalTime invalide.').optional(),
  price: z.number().positive('Le prix doit être positif.'),
  availableSeats: z.number().int().min(1, 'Il faut au moins 1 siège disponible.'),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).default('scheduled'),
});

const scheduleUpdateSchema = scheduleCreateSchema.partial();

type ScheduleCreateInput = z.infer<typeof scheduleCreateSchema>;
type ScheduleUpdateInput = z.infer<typeof scheduleUpdateSchema>;

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

const handlePrismaError = (error: unknown, next: NextFunction): void => {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const e = error as { code?: string; meta?: { target?: string[] } };
    if (e.code === 'P2002') {
      const target = e.meta?.target?.join(', ') || 'champ unique';
      next(createError(`Valeur déjà utilisée pour: ${target}.`, 409));
      return;
    }
    if (e.code === 'P2025') {
      next(createError('Ressource introuvable.', 404));
      return;
    }
  }
  next(error);
};

const includeScheduleRelations = {
  route: {
    include: {
      departureStation: true,
      arrivalStation: true,
      company: true,
    },
  },
  bus: true,
  driver: true,
} as const;

export const getSchedules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { departure, arrival, date } = req.query as Record<string, string | undefined>;

    const dateFilter = date
      ? {
          gte: new Date(`${date}T00:00:00.000Z`),
          lt: new Date(`${date}T23:59:59.999Z`),
        }
      : undefined;

    const schedules = await prisma.schedule.findMany({
      where: {
        status: { not: 'cancelled' },
        ...(dateFilter && { departureTime: dateFilter }),
        ...(departure && {
          route: {
            departureStation: {
              city: { contains: departure, mode: 'insensitive' },
            },
          },
        }),
        ...(arrival && {
          route: {
            arrivalStation: {
              city: { contains: arrival, mode: 'insensitive' },
            },
          },
        }),
      },
      include: includeScheduleRelations,
      orderBy: { departureTime: 'asc' },
    });

    res.json({
      success: true,
      data: schedules.map(s => ({ ...s, company: s.route.company })),
    });
  } catch (error) {
    next(error);
  }
};

export const getScheduleById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id: req.params.id },
      include: includeScheduleRelations,
    });

    if (!schedule) {
      return next(createError('Trajet non trouvé.', 404));
    }

    res.json({ success: true, data: { ...schedule, company: schedule.route.company } });
  } catch (error) {
    next(error);
  }
};

export const getScheduleSeats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id: req.params.id },
      select: {
        busId: true,
        bus: { select: { capacity: true } },
      },
    });

    if (!schedule) {
      return next(createError('Trajet non trouvé.', 404));
    }

    let seats = await prisma.seat.findMany({
      where: { busId: schedule.busId },
      orderBy: [{ rowPos: 'asc' }, { colPos: 'asc' }],
      include: {
        bookings: {
          where: {
            scheduleId: req.params.id,
            status: { in: ['pending', 'confirmed'] },
          },
          select: { id: true, status: true },
        },
      },
    });

    // Si le bus n'a pas de sièges, les initialiser automatiquement
    if (seats.length === 0 && schedule.bus.capacity > 0) {
      const cols = 4;
      const rows = Math.ceil(schedule.bus.capacity / cols);
      const seatsData = [];
      let seatNumber = 1;
      for (let r = 1; r <= rows; r++) {
        for (let c = 1; c <= cols; c++) {
          if (seatNumber <= schedule.bus.capacity) {
            seatsData.push({
              busId: schedule.busId,
              seatNumber: seatNumber++,
              rowPos: r,
              colPos: c,
              type: 'standard' as const,
            });
          }
        }
      }
      await prisma.seat.createMany({ data: seatsData });

      seats = await prisma.seat.findMany({
        where: { busId: schedule.busId },
        orderBy: [{ rowPos: 'asc' }, { colPos: 'asc' }],
        include: {
          bookings: {
            where: {
              scheduleId: req.params.id,
              status: { in: ['pending', 'confirmed'] },
            },
            select: { id: true, status: true },
          },
        },
      });
    }

    const formattedSeats = seats.map(seat => ({
      id: seat.id,
      seatNumber: seat.seatNumber,
      type: seat.type,
      rowPos: seat.rowPos,
      colPos: seat.colPos,
      status: seat.bookings.length > 0 ? 'occupied' : 'available',
    }));

    res.json({ success: true, data: formattedSeats });
  } catch (error) {
    next(error);
  }
};

export const getLatestScheduleLocation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;

  try {
    const query = `
      SELECT
        ST_X(location::geometry) as longitude,
        ST_Y(location::geometry) as latitude,
        speed,
        recorded_at as "recordedAt"
      FROM gps_positions
      WHERE schedule_id = $1
      ORDER BY recorded_at DESC
      LIMIT 1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return next(createError('Aucune position trouvée pour ce trajet.', 404));
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const createSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const input = parseBody<ScheduleCreateInput>(scheduleCreateSchema, req.body, next);
  if (!input) return;

  try {
    const route = await prisma.route.findUnique({
      where: { id: input.routeId },
      select: { id: true, companyId: true },
    });

    if (!route) return next(createError('Route introuvable.', 404));

    if (req.user?.role !== 'super_admin' && req.user?.companyId !== route.companyId) {
      return next(createError('Accès interdit à cette compagnie.', 403));
    }

    const bus = await prisma.bus.findUnique({
      where: { id: input.busId },
      select: { id: true, companyId: true },
    });

    if (!bus) return next(createError('Bus introuvable.', 404));
    if (bus.companyId !== route.companyId) {
      return next(createError('Le bus n\'appartient pas à la même compagnie que la route.', 400));
    }

    const schedule = await prisma.schedule.create({
      data: {
        routeId: input.routeId,
        busId: input.busId,
        driverId: input.driverId,
        departureTime: new Date(input.departureTime),
        arrivalTime: input.arrivalTime ? new Date(input.arrivalTime) : undefined,
        price: input.price,
        availableSeats: input.availableSeats,
        status: input.status,
      },
      include: includeScheduleRelations,
    });

    res.status(201).json({
      success: true,
      message: 'Trajet créé avec succès.',
      data: { ...schedule, company: schedule.route.company },
    });
  } catch (error) {
    handlePrismaError(error, next);
  }
};

export const updateSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const input = parseBody<ScheduleUpdateInput>(scheduleUpdateSchema, req.body, next);
  if (!input) return;

  if (Object.keys(input).length === 0) {
    return next(createError('Aucune donnée à mettre à jour.', 400));
  }

  try {
    const existing = await prisma.schedule.findUnique({
      where: { id: req.params.id },
      include: { route: { select: { companyId: true } } },
    });

    if (!existing) return next(createError('Trajet introuvable.', 404));

    if (req.user?.role !== 'super_admin' && req.user?.companyId !== existing.route.companyId) {
      return next(createError('Accès interdit à ce trajet.', 403));
    }

    const schedule = await prisma.schedule.update({
      where: { id: req.params.id },
      data: {
        ...(input.routeId && { routeId: input.routeId }),
        ...(input.busId && { busId: input.busId }),
        ...(input.driverId !== undefined && { driverId: input.driverId }),
        ...(input.departureTime && { departureTime: new Date(input.departureTime) }),
        ...(input.arrivalTime && { arrivalTime: new Date(input.arrivalTime) }),
        ...(input.price !== undefined && { price: input.price }),
        ...(input.availableSeats !== undefined && { availableSeats: input.availableSeats }),
        ...(input.status && { status: input.status }),
      },
      include: includeScheduleRelations,
    });

    res.json({
      success: true,
      message: 'Trajet mis à jour.',
      data: { ...schedule, company: schedule.route.company },
    });
  } catch (error) {
    handlePrismaError(error, next);
  }
};

export const deleteSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const existing = await prisma.schedule.findUnique({
      where: { id: req.params.id },
      include: { route: { select: { companyId: true } } },
    });

    if (!existing) return next(createError('Trajet introuvable.', 404));

    if (req.user?.role !== 'super_admin' && req.user?.companyId !== existing.route.companyId) {
      return next(createError('Accès interdit à ce trajet.', 403));
    }

    await prisma.schedule.delete({ where: { id: req.params.id } });

    res.json({ success: true, message: 'Trajet supprimé.' });
  } catch (error) {
    handlePrismaError(error, next);
  }
};
