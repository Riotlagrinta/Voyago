import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { prisma as prismaClient } from '../lib/prisma';
import { createError } from '../middlewares/error.middleware';

const routeCreateSchema = z.object({
  companyId: z.string().uuid('companyId invalide.').optional(),
  departureStationId: z.string().uuid('Station de départ invalide.'),
  arrivalStationId: z.string().uuid('Station d’arrivée invalide.'),
  distanceKm: z.number().nonnegative().optional(),
  durationMin: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
});

const routeUpdateSchema = routeCreateSchema.partial();

type RouteCreateInput = z.infer<typeof routeCreateSchema>;
type RouteUpdateInput = z.infer<typeof routeUpdateSchema>;

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
    const prismaError = error as { code?: string };

    if (prismaError.code === 'P2003') {
      next(createError('Référence invalide vers une compagnie ou une station.', 400));
      return;
    }

    if (prismaError.code === 'P2002') {
      next(createError('Cette escale existe déjà pour ce trajet ou cet ordre.', 409));
      return;
    }
  }

  next(createError('Erreur interne du serveur.', 500));
};

const canAccessCompanyResource = async (
  companyId: string,
  user?: Request['user']
): Promise<boolean> => {
  if (!user) return false;
  if (user.role === 'super_admin') return true;
  if (user.companyId === companyId) return true;

  const company = await prismaClient.company.findFirst({
    where: { id: companyId, adminId: user.id },
    select: { id: true },
  });

  return Boolean(company);
};

const formatRoute = (route: any) => ({
  id: route.id,
  companyId: route.companyId,
  departureStationId: route.departureStationId,
  arrivalStationId: route.arrivalStationId,
  distanceKm: route.distanceKm !== null && route.distanceKm !== undefined ? Number(route.distanceKm) : null,
  durationMin: route.durationMin ?? null,
  isActive: route.isActive,
  createdAt: route.createdAt,
  updatedAt: route.updatedAt,
  company: route.company
    ? {
        id: route.company.id,
        name: route.company.name,
        slug: route.company.slug,
      }
    : undefined,
  departureStation: route.departureStation
    ? {
        id: route.departureStation.id,
        name: route.departureStation.name,
        city: route.departureStation.city,
      }
    : undefined,
  arrivalStation: route.arrivalStation
    ? {
        id: route.arrivalStation.id,
        name: route.arrivalStation.name,
        city: route.arrivalStation.city,
      }
    : undefined,
  stops: route.stops ? route.stops.map((stop: any) => ({
    id: stop.id,
    stationId: stop.stationId,
    stationName: stop.station?.name,
    city: stop.station?.city,
    stopOrder: stop.stopOrder,
    arrivalTimeOffsetMin: stop.arrivalTimeOffsetMin,
    departureTimeOffsetMin: stop.departureTimeOffsetMin,
  })) : [],
  schedulesCount: route._count?.schedules,
});

export const getRoutes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const where: Record<string, unknown> = {};

    if (req.query.companyId) {
      where.companyId = String(req.query.companyId);
    }

    if (req.query.departureStationId) {
      where.departureStationId = String(req.query.departureStationId);
    }

    if (req.query.arrivalStationId) {
      where.arrivalStationId = String(req.query.arrivalStationId);
    }

    if (req.query.isActive === 'true') {
      where.isActive = true;
    } else if (req.query.isActive === 'false') {
      where.isActive = false;
    }

    const routes = await prismaClient.route.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      include: {
        company: { select: { id: true, name: true, slug: true } },
        departureStation: { select: { id: true, name: true, city: true } },
        arrivalStation: { select: { id: true, name: true, city: true } },
        stops: {
          orderBy: { stopOrder: 'asc' },
          include: { station: { select: { name: true, city: true } } },
        },
        _count: { select: { schedules: true } },
      },
    });

    res.json({
      success: true,
      data: routes.map(formatRoute),
    });
  } catch (error) {
    handlePrismaError(error, next);
  }
};

export const getRouteById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const route = await prismaClient.route.findUnique({
      where: { id: req.params.id },
      include: {
        company: { select: { id: true, name: true, slug: true } },
        departureStation: { select: { id: true, name: true, city: true } },
        arrivalStation: { select: { id: true, name: true, city: true } },
        stops: {
          orderBy: { stopOrder: 'asc' },
          include: { station: { select: { name: true, city: true } } },
        },
        _count: { select: { schedules: true } },
      },
    });

    if (!route) {
      return next(createError('Trajet introuvable.', 404));
    }

    if (req.user) {
      const allowed = await canAccessCompanyResource(route.companyId, req.user);
      if (!allowed && req.user.role !== 'passenger') {
        return next(createError('Accès interdit à ce trajet.', 403));
      }
    }

    res.json({
      success: true,
      data: formatRoute(route),
    });
  } catch (error) {
    handlePrismaError(error, next);
  }
};

export const createRoute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const input = parseBody<RouteCreateInput>(routeCreateSchema, req.body, next);
  if (!input || !req.user) return;

  if (input.departureStationId === input.arrivalStationId) {
    return next(createError('Les stations de départ et d’arrivée doivent être différentes.', 400));
  }

  try {
    const companyId = req.user.role === 'super_admin' ? input.companyId : req.user.companyId;

    if (!companyId) {
      return next(createError('Aucune compagnie liée à cet administrateur.', 400));
    }

    const allowed = await canAccessCompanyResource(companyId, req.user);
    if (!allowed) {
      return next(createError('Accès interdit pour créer un trajet sur cette compagnie.', 403));
    }

    const route = await prismaClient.route.create({
      data: {
        companyId,
        departureStationId: input.departureStationId,
        arrivalStationId: input.arrivalStationId,
        distanceKm: input.distanceKm,
        durationMin: input.durationMin,
        isActive: input.isActive,
      },
      include: {
        company: { select: { id: true, name: true, slug: true } },
        departureStation: { select: { id: true, name: true, city: true } },
        arrivalStation: { select: { id: true, name: true, city: true } },
        _count: { select: { schedules: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Trajet créé avec succès.',
      data: formatRoute(route),
    });
  } catch (error) {
    handlePrismaError(error, next);
  }
};

export const updateRoute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const input = parseBody<RouteUpdateInput>(routeUpdateSchema, req.body, next);
  if (!input || !req.user) return;

  const payload = Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined)
  );

  if (Object.keys(payload).length === 0) {
    return next(createError('Aucune donnée à mettre à jour.', 400));
  }

  if (
    payload.departureStationId &&
    payload.arrivalStationId &&
    payload.departureStationId === payload.arrivalStationId
  ) {
    return next(createError('Les stations de départ et d’arrivée doivent être différentes.', 400));
  }

  try {
    const existingRoute = await prismaClient.route.findUnique({
      where: { id: req.params.id },
      select: { id: true, companyId: true, departureStationId: true, arrivalStationId: true },
    });

    if (!existingRoute) {
      return next(createError('Trajet introuvable.', 404));
    }

    const allowed = await canAccessCompanyResource(existingRoute.companyId, req.user);
    if (!allowed) {
      return next(createError('Accès interdit à ce trajet.', 403));
    }

    const nextDepartureStationId = String(payload.departureStationId ?? existingRoute.departureStationId);
    const nextArrivalStationId = String(payload.arrivalStationId ?? existingRoute.arrivalStationId);

    if (nextDepartureStationId === nextArrivalStationId) {
      return next(createError('Les stations de départ et d’arrivée doivent être différentes.', 400));
    }

    const route = await prismaClient.route.update({
      where: { id: req.params.id },
      data: payload,
      include: {
        company: { select: { id: true, name: true, slug: true } },
        departureStation: { select: { id: true, name: true, city: true } },
        arrivalStation: { select: { id: true, name: true, city: true } },
        _count: { select: { schedules: true } },
      },
    });

    res.json({
      success: true,
      message: 'Trajet mis à jour.',
      data: formatRoute(route),
    });
  } catch (error) {
    handlePrismaError(error, next);
  }
};

export const addRouteStop = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const schema = z.object({
    stationId: z.string().uuid('Station invalide.'),
    stopOrder: z.number().int().min(1),
    arrivalTimeOffsetMin: z.number().int().nonnegative().optional(),
    departureTimeOffsetMin: z.number().int().nonnegative().optional(),
  });

  const input = parseBody<any>(schema, req.body, next);
  if (!input) return;

  try {
    const route = await prismaClient.route.findUnique({
      where: { id: req.params.id },
      select: { id: true, companyId: true },
    });

    if (!route) {
      return next(createError('Trajet introuvable.', 404));
    }

    const allowed = await canAccessCompanyResource(route.companyId, req.user);
    if (!allowed) {
      return next(createError('Accès interdit à ce trajet.', 403));
    }

    const stop = await prismaClient.routeStop.create({
      data: {
        routeId: req.params.id,
        stationId: input.stationId,
        stopOrder: input.stopOrder,
        arrivalTimeOffsetMin: input.arrivalTimeOffsetMin,
        departureTimeOffsetMin: input.departureTimeOffsetMin,
      },
      include: { station: { select: { name: true, city: true } } },
    });

    res.status(201).json({
      success: true,
      message: 'Escale ajoutée.',
      data: stop,
    });
  } catch (error) {
    handlePrismaError(error, next);
  }
};

export const removeRouteStop = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stop = await prismaClient.routeStop.findUnique({
      where: { id: req.params.stopId },
      include: { route: { select: { companyId: true } } },
    });

    if (!stop) {
      return next(createError('Escale introuvable.', 404));
    }

    const allowed = await canAccessCompanyResource(stop.route.companyId, req.user);
    if (!allowed) {
      return next(createError('Accès interdit.', 403));
    }

    await prismaClient.routeStop.delete({
      where: { id: req.params.stopId },
    });

    res.json({
      success: true,
      message: 'Escale supprimée.',
    });
  } catch (error) {
    handlePrismaError(error, next);
  }
};

export const deleteRoute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    return next(createError('Accès non autorisé.', 401));
  }

  try {
    const existingRoute = await prismaClient.route.findUnique({
      where: { id: req.params.id },
      select: { id: true, companyId: true },
    });

    if (!existingRoute) {
      return next(createError('Trajet introuvable.', 404));
    }

    const allowed = await canAccessCompanyResource(existingRoute.companyId, req.user);
    if (!allowed) {
      return next(createError('Accès interdit à ce trajet.', 403));
    }

    await prismaClient.route.delete({
      where: { id: req.params.id },
    });

    res.json({
      success: true,
      message: 'Trajet supprimé.',
    });
  } catch (error) {
    handlePrismaError(error, next);
  }
};
