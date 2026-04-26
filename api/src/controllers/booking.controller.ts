import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { TicketPDFService } from '../services/booking/TicketPDFService';
import { NotificationService } from '../services/notification/NotificationService';
import { prisma } from '../lib/prisma';
import { createError } from '../middlewares/error.middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'voyago-super-secret-key';

export const downloadTicketPDF = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const booking = {
      id: id,
      seatNumber: 15,
      status: 'confirmed',
      passengerName: "Voyago Guest",
      passengerPhone: "90116980",
      qrCode: jwt.sign({ bookingId: id }, JWT_SECRET),
      schedule: {
        departureTime: new Date().toISOString(),
        route: {
          departureStation: { name: "Gare Centrale", city: "Lomé" },
          arrivalStation: { name: "Gare du Nord", city: "Kara" },
          company: { name: "Voyago Express" }
        }
      }
    };

    const buffer = await TicketPDFService.generateTicketPDF(booking);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=ticket-voyago-${id.split('-')[0]}.pdf`,
      'Content-Length': buffer.length
    });
    
    return res.status(200).send(buffer);
  } catch (error: any) {
    console.error('[BookingController] PDF Error:', error.message);
    return res.status(500).json({ success: false, message: "Erreur lors de la génération du PDF" });
  }
};

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  console.log(">>> CRÉATION RÉSERVATION (MODE DÉMO)");
  
  try {
    const { scheduleId, seats, seatId } = req.body;

    if (!scheduleId) {
      return res.status(400).json({ success: false, message: "Données invalides" });
    }

    if (seatId) {
      if (!req.user) {
        return next(createError('Non authentifié', 401));
      }

      const schedule = await prisma.schedule.findUnique({ where: { id: scheduleId } });
      const seat = await prisma.seat.findUnique({ where: { id: seatId } });

      if (!schedule || !seat) {
        return res.status(400).json({ success: false, message: "Données invalides" });
      }

      const existingBooking = await prisma.booking.findFirst({
        where: {
          scheduleId,
          seatId,
          status: { in: ['pending', 'confirmed'] },
        },
      });

      if (existingBooking) {
        return res.status(409).json({ success: false, error: "Ce siège est déjà réservé." });
      }

      const lockedUntil = new Date(Date.now() + 10 * 60 * 1000);
      const booking = await prisma.booking.create({
        data: {
          userId: req.user.id,
          scheduleId,
          seatId,
          seatNumber: seat.seatNumber,
          status: 'pending',
          totalPrice: Number(schedule.price),
          lockedUntil,
        },
      });

      return res.status(201).json({
        success: true,
        data: booking,
      });
    }

    if (!seats || !Array.isArray(seats)) {
      return res.status(400).json({ success: false, message: "Données invalides" });
    }

    const createdBookings = seats.map((seatData, index) => {
      const bookingId = `fake-booking-${Math.random().toString(36).substr(2, 9)}`;
      const qrCode = jwt.sign({ bookingId }, JWT_SECRET);

      const booking = {
        id: bookingId,
        userId: 'guest-id',
        scheduleId: scheduleId,
        seatId: seatData.seatId || 'fake-seat',
        seatNumber: seatData.seatNumber || (index + 10),
        status: 'confirmed',
        totalPrice: 5000,
        passengerName: seatData.passengerName || "Voyago Guest",
        passengerPhone: seatData.passengerPhone || "90000000",
        qrCode,
        createdAt: new Date(),
        schedule: {
          departureTime: new Date(),
          route: {
            departureStation: { name: "Gare Centrale", city: "Lomé" },
            arrivalStation: { name: "Gare du Nord", city: "Kara" },
            company: { name: "Voyago Express" }
          }
        }
      };

      // ENVOI NOTIFICATIONS (Non-bloquant)
      const ticketUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/booking/confirmation/${bookingId}`;
      
      NotificationService.sendBookingConfirmationEmail("client@example.com", {
        passengerName: booking.passengerName,
        route: "Lomé → Kara",
        date: "24 Avril 2026",
        seatNumber: booking.seatNumber,
        ticketUrl: ticketUrl
      });

      NotificationService.sendSMS(booking.passengerPhone, `Voyago: Votre réservation #${booking.seatNumber} est confirmée. Téléchargez votre ticket ici: ${ticketUrl}`);

      return booking;
    });

    return res.status(201).json({
      success: true,
      data: createdBookings,
      totalAmount: 5000 * createdBookings.length
    });

  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookingById = async (req: Request, res: Response) => {
  const { id } = req.params;
  res.json({
    success: true,
    data: {
      id: id,
      seatNumber: 15,
      status: 'confirmed',
      passengerName: "Voyago Guest",
      passengerPhone: "90116980",
      qrCode: jwt.sign({ bookingId: id }, JWT_SECRET),
      schedule: {
        departureTime: new Date().toISOString(),
        route: {
          departureStation: { name: "Gare Centrale", city: "Lomé" },
          arrivalStation: { name: "Gare du Nord", city: "Kara" },
          company: { name: "Voyago Express" }
        }
      }
    }
  });
};

export const getBookings = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: "Non authentifié" });
    return;
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: req.user.id }
  });

  res.json({ success: true, data: bookings });
};

export const cancelBooking = async (req: Request, res: Response) => {
  res.json({ success: true, message: "Réservation annulée (Simulé)" });
};

export const validateQrCode = async (req: Request, res: Response) => {
  const { qrCode } = req.body;
  try {
    const decoded: any = jwt.verify(qrCode, JWT_SECRET);
    res.json({
      success: true,
      message: 'Embarquement validé avec succès (Simulé)',
      data: {
        id: decoded.bookingId,
        passengerName: "Passager Démo",
        seatNumber: decoded.seatNumber || 15,
        status: 'completed'
      }
    });
  } catch (e) {
    res.status(401).json({ success: false, message: "QR Code invalide" });
  }
};
