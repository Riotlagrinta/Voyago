import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { prisma as prismaClient, pool } from '../lib/prisma';
import { createError } from '../middlewares/error.middleware';

const stationSchema = z.object({
  name: z.string().trim().min(2, 'Le nom de la gare est requis.').max(150),
  city: z.string().trim().min(2, 'La ville est requise.').max(100),
  address: z.string().trim().max(500).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

type StationInput = z.infer<typeof stationSchema>;

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

export const getAllStations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { lat, lng, radius = 50000 } = req.query; // rayon par défaut 50km

    if (lat && lng) {
      // Recherche par proximité PostGIS (Raw SQL)
      const latNum = parseFloat(lat as string);
      const lngNum = parseFloat(lng as string);
      const radiusNum = parseFloat(radius as string);

      const stations = await pool.query(
        `SELECT id, name, city, address, 
                ST_X(location::geometry) as longitude, 
                ST_Y(location::geometry) as latitude,
                ST_Distance(location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) as distance
         FROM stations
         WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)
         ORDER BY distance ASC`,
        [lngNum, latNum, radiusNum]
      );

      res.json({
        success: true,
        data: stations.rows,
      });
      return;
    }

    // Recherche classique (ou par ville)
    const where: any = {};
    if (req.query.city) {
      where.city = { contains: String(req.query.city), mode: 'insensitive' };
    }

    const stations = await pool.query(
      `SELECT id, name, city, address, 
              ST_X(location::geometry) as longitude, 
              ST_Y(location::geometry) as latitude
       FROM stations
       ${req.query.city ? "WHERE city ILIKE $1" : ""}
       ORDER BY city ASC, name ASC`,
      req.query.city ? [`%${req.query.city}%`] : []
    );

    res.json({
      success: true,
      data: stations.rows,
    });
  } catch (error) {
    next(createError('Erreur lors de la récupération des gares.', 500));
  }
};

export const getStationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const station = await pool.query(
      `SELECT id, name, city, address, 
              ST_X(location::geometry) as longitude, 
              ST_Y(location::geometry) as latitude
       FROM stations
       WHERE id = $1`,
      [req.params.id]
    );

    if (station.rows.length === 0) {
      return next(createError('Gare introuvable.', 404));
    }

    res.json({
      success: true,
      data: station.rows[0],
    });
  } catch (error) {
    next(createError('Erreur lors de la récupération de la gare.', 500));
  }
};

export const createStation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const input = parseBody<StationInput>(stationSchema, req.body, next);
  if (!input) return;

  try {
    const result = await pool.query(
      `INSERT INTO stations (name, city, address, location)
       VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326)::geography)
       RETURNING id, name, city, address`,
      [input.name, input.city, input.address, input.longitude, input.latitude]
    );

    res.status(201).json({
      success: true,
      message: 'Gare créée avec succès.',
      data: result.rows[0],
    });
  } catch (error) {
    next(createError('Erreur lors de la création de la gare.', 500));
  }
};
