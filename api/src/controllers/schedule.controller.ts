import { NextFunction, Request, Response } from 'express';
import { pool } from '../lib/prisma';

export const getSchedules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // MODE MOCK POUR DÃ‰MO
  const mockSchedules = [
    {
      id: "s1",
      departure: new Date().toISOString(),
      price: "8500",
      availableSeats: 12,
      route: {
        departureStation: { name: "Gare AgbalÃ©pÃ©dogan", city: "LomÃ©" },
        arrivalStation: { name: "Gare Centrale", city: "Kara" },
        durationMin: 420
      },
      bus: { plateNumber: "TG 4587 AX", type: "VIP" },
      company: { name: "Voyago", certified: true }
    },
    {
      id: "s2",
      departure: new Date(Date.now() + 3600000).toISOString(),
      price: "7000",
      availableSeats: 4,
      route: {
        departureStation: { name: "Gare AgbalÃ©pÃ©dogan", city: "LomÃ©" },
        arrivalStation: { name: "Gare Sud", city: "AtakpamÃ©" },
        durationMin: 180
      },
      bus: { plateNumber: "TG 1122 BZ", type: "Standard" },
      company: { name: "Voyago", certified: true }
    }
  ];

  res.json({
    success: true,
    data: mockSchedules,
  });
};

export const getScheduleById = async (req: Request, res: Response): Promise<void> => {
   res.json({ success: true, data: { id: req.params.id, price: "8500", company: { name: "Voyago" }, bus: { capacity: 50 }, route: { departureStation: { city: "LomÃ©" }, arrivalStation: { city: "Kara" } } } });
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
 * RÃ©cupÃ¨re la derniÃ¨re position GPS connue d'un trajet (Polling Fallback)
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
        message: "Aucune position trouvÃ©e pour ce trajet"
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
