import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { createError } from '../middlewares/error.middleware';
import { TicketPDFService } from '../services/booking/TicketPDFService';
import { QRService } from '../services/booking/QRService';
import { JWT_SECRET } from '../lib/secrets';

// Accepte 8 chiffres locaux (90123456) ou format international +22890123456
const normalizePhone = (p: string): string => {
  const digits = p.replace(/\D/g, '');
  if (digits.length === 8) return `+228${digits}`;
  if (digits.length === 11 && digits.startsWith('228')) return `+${digits}`;
  if (digits.length === 12 && digits.startsWith('228')) return `+${digits}`;
  return p;
};

const createBookingSchema = z.object({
  scheduleId: z.string().uuid('scheduleId invalide.'),
  seats: z.array(z.object({
    seatId: z.string().uuid('seatId invalide.'),
    passengerName: z.string().min(2, 'Nom du passager requis (min 2 caractères).'),
    passengerPhone: z.string().min(8, 'Numéro de téléphone invalide.'),
  })).min(1).max(5),
});

const bookingInclude = {
  schedule: {
    include: {
      route: {
        include: {
          departureStation: true,
          arrivalStation: true,
          company: true,
        },
      },
      bus: true,
    },
  },
  seat: true,
} as const;

// Trouve ou crée un utilisateur invité identifié par son numéro de téléphone.
// Si l'utilisateur est connecté, on réutilise son compte directement.
const resolveUserId = async (req: Request, phone: string): Promise<string> => {
  if (req.user?.id) return req.user.id;

  const normalizedPhone = normalizePhone(phone);

  // Cherche un compte invité existant pour ce numéro
  const existing = await prisma.user.findFirst({
    where: { phone: normalizedPhone },
    select: { id: true },
  });
  if (existing) return existing.id;

  // Crée un compte invité minimal
  const guest = await prisma.user.create({
    data: {
      name: `Invité ${normalizedPhone.slice(-4)}`,
      email: `guest_${normalizedPhone.replace(/\D/g, '')}@voyago.guest`,
      phone: normalizedPhone,
      passwordHash: '',
      role: 'passenger',
      isActive: true,
      emailVerified: false,
    },
    select: { id: true },
  });
  return guest.id;
};

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  const parsed = createBookingSchema.safeParse(req.body);
  if (!parsed.success) return next(createError(parsed.error.issues[0].message, 400));

  const { scheduleId, seats } = parsed.data;

  try {
    // Résoudre l'utilisateur (connecté ou invité) avant la transaction
    const userId = await resolveUserId(req, seats[0].passengerPhone);
    const seatIds = seats.map(s => s.seatId);
    const lockedUntil = new Date(Date.now() + 15 * 60 * 1000);

    const bookings = await prisma.$transaction(async (tx) => {
      // 1. Lire le trajet
      const schedule = await tx.schedule.findUnique({
        where: { id: scheduleId },
        select: { id: true, price: true, availableSeats: true, status: true },
      });

      if (!schedule) throw Object.assign(new Error('Trajet introuvable.'), { statusCode: 404 });
      if (schedule.status === 'cancelled') throw Object.assign(new Error('Ce trajet a été annulé.'), { statusCode: 400 });
      if (schedule.availableSeats < seats.length) {
        throw Object.assign(
          new Error(`Seulement ${schedule.availableSeats} place(s) disponible(s).`),
          { statusCode: 400 }
        );
      }

      // 2. Vérifier la disponibilité des sièges
      const conflictingBookings = await tx.booking.findMany({
        where: {
          scheduleId,
          seatId: { in: seatIds },
          status: { in: ['pending', 'confirmed'] },
          OR: [
            { lockedUntil: null },
            { lockedUntil: { gt: new Date() } },
          ],
        },
        select: { seatId: true },
      });

      if (conflictingBookings.length > 0) {
        throw Object.assign(new Error('Un ou plusieurs sièges sont déjà réservés.'), { statusCode: 409 });
      }

      // 3. Récupérer les sièges
      const seatRecords = await tx.seat.findMany({
        where: { id: { in: seatIds } },
        select: { id: true, seatNumber: true },
      });

      if (seatRecords.length !== seatIds.length) {
        throw Object.assign(new Error('Un ou plusieurs sièges sont introuvables.'), { statusCode: 400 });
      }

      const seatMap = new Map(seatRecords.map(s => [s.id, s]));

      // 4. Créer les réservations
      const created = await Promise.all(
        seats.map(s => tx.booking.create({
          data: {
            userId,
            scheduleId,
            seatId: s.seatId,
            seatNumber: seatMap.get(s.seatId)!.seatNumber,
            passengerName: s.passengerName,
            passengerPhone: normalizePhone(s.passengerPhone),
            status: 'pending',
            totalPrice: Number(schedule.price),
            lockedUntil,
          },
          include: bookingInclude,
        }))
      );

      // 5. Décrémenter les places disponibles
      await tx.schedule.update({
        where: { id: scheduleId },
        data: { availableSeats: { decrement: seats.length } },
      });

      return created;
    }, { isolationLevel: 'Serializable' });

    return res.status(201).json({ success: true, data: bookings });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    if (err.statusCode) {
      return next(createError(err.message || 'Erreur réservation.', err.statusCode));
    }
    next(error);
  }
};

export const getBookings = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(createError('Non authentifié.', 401));

  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: bookingInclude,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: bookingInclude,
    });

    if (!booking) return next(createError('Réservation introuvable.', 404));

    // Si connecté et pas super_admin, vérifier que la réservation lui appartient
    if (req.user && req.user.role !== 'super_admin' && booking.userId !== req.user.id) {
      return next(createError('Accès interdit.', 403));
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(createError('Non authentifié.', 401));

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      select: { id: true, userId: true, status: true, scheduleId: true },
    });

    if (!booking) return next(createError('Réservation introuvable.', 404));
    if (booking.userId !== req.user.id && req.user.role !== 'super_admin') {
      return next(createError('Accès interdit.', 403));
    }
    if (booking.status === 'cancelled') {
      return next(createError('Cette réservation est déjà annulée.', 400));
    }
    if (booking.status === 'completed') {
      return next(createError("Impossible d'annuler un voyage terminé.", 400));
    }

    // Compter le nombre de sièges de cette réservation pour la bonne incrémentation
    const seatsToFree = await prisma.booking.count({
      where: {
        userId: req.user.role === 'super_admin' ? undefined : req.user.id,
        scheduleId: booking.scheduleId,
        status: { in: ['pending', 'confirmed'] },
      },
    });

    await prisma.$transaction([
      prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'cancelled' },
      }),
      prisma.schedule.update({
        where: { id: booking.scheduleId },
        data: { availableSeats: { increment: seatsToFree > 0 ? seatsToFree : 1 } },
      }),
    ]);

    res.json({ success: true, message: 'Réservation annulée avec succès.' });
  } catch (error) {
    next(error);
  }
};

export const validateQrCode = async (req: Request, res: Response, next: NextFunction) => {
  const { qrCode } = req.body;

  if (!qrCode) return next(createError('QR Code manquant.', 400));

  try {
    const decoded = jwt.verify(qrCode, JWT_SECRET) as { bookingId: string };

    const booking = await prisma.booking.findUnique({
      where: { id: decoded.bookingId },
      include: {
        schedule: {
          include: {
            route: {
              include: { departureStation: true, arrivalStation: true },
            },
          },
        },
        seat: true,
      },
    });

    if (!booking) return next(createError('Réservation introuvable.', 404));
    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Ce billet a été annulé.' });
    }

    // Marquer comme complété si confirmé
    if (booking.status === 'confirmed') {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'completed' },
      });
    }

    res.json({
      success: true,
      message: 'Embarquement validé avec succès.',
      data: {
        id: booking.id,
        passengerName: booking.passengerName,
        seatNumber: booking.seatNumber,
        status: 'completed',
        route: `${booking.schedule.route.departureStation.city} → ${booking.schedule.route.arrivalStation.city}`,
      },
    });
  } catch {
    res.status(401).json({ success: false, message: 'QR Code invalide ou expiré.' });
  }
};

export const downloadTicketPDF = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(createError('Non authentifié.', 401));

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        schedule: {
          include: {
            route: {
              include: {
                departureStation: true,
                arrivalStation: true,
                company: true,
              },
            },
          },
        },
      },
    });

    if (!booking) return next(createError('Réservation introuvable.', 404));
    if (booking.userId !== req.user.id && req.user.role !== 'super_admin') {
      return next(createError('Accès interdit.', 403));
    }

    const qrCode = booking.qrCode || QRService.generateTicketData(booking.id);

    const buffer = await TicketPDFService.generateTicketPDF({
      id: booking.id,
      seatNumber: booking.seatNumber,
      status: booking.status,
      passengerName: booking.passengerName || 'Passager',
      passengerPhone: booking.passengerPhone || '',
      qrCode,
      schedule: {
        departureTime: booking.schedule.departureTime.toISOString(),
        route: {
          departureStation: booking.schedule.route.departureStation,
          arrivalStation: booking.schedule.route.arrivalStation,
          company: booking.schedule.route.company,
        },
      },
    });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=ticket-voyago-${booking.id.split('-')[0]}.pdf`,
      'Content-Length': buffer.length,
    });

    return res.status(200).send(buffer);
  } catch (error) {
    next(error);
  }
};
