import { NextFunction, Request, Response } from 'express';
import { prisma, pool } from '../lib/prisma';

export const getSchedules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const schedules = await prisma.schedule.findMany({
      include: {
        route: {
          include: {
            departureStation: true,
            arrivalStation: true,
            company: true
          }
        },
        bus: true
      },
      orderBy: { departureTime: 'asc' }
    });

    const formattedSchedules = schedules.map(s => ({
      ...s,
      company: s.route.company
    }));

    res.json({
      success: true,
      data: formattedSchedules,
    });
  } catch (error) {
    next(error);
  }
};

export const getScheduleById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id: req.params.id },
      include: {
        route: {
          include: {
            departureStation: true,
            arrivalStation: true,
            company: true
          }
        },
        bus: true
      }
    });

    if (!schedule) {
      res.status(404).json({ success: false, message: 'Trajet non trouvé' });
      return;
    }

    res.json({ success: true, data: { ...schedule, company: schedule.route.company } });
  } catch (error) {
    next(error);
  }
};

export const getScheduleSeats = async (req: Request, res: Response): Promise<void> => {
  const mockSeats = Array.from({ length: 40 }, (_, i) => ({
    id: `seat-${i}`,
    seatNumber: i + 1,
    status: Math.random() > 0.3 ? "available" : "occupied"
  }));
  res.json({ success: true, data: mockSeats });
};

/**
 * Récupère la dernière position GPS connue d'un trajet (polling fallback)
 */
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
      res.status(404).json({
        success: false,
        message: "Aucune position trouvée pour ce trajet"
      });
      return;
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const createSchedule = () => {};
export const updateSchedule = () => {};
export const deleteSchedule = () => {};
