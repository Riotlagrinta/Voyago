import request from 'supertest';
import app from '../index';
import { prisma as prismaMock } from '../lib/prisma';
import jwt from 'jsonwebtoken';

describe('Booking Endpoints', () => {
  const mockUser = {
    id: 'user-id',
    email: 'passenger@example.com',
    role: 'passenger',
    name: 'Passenger User',
  };

  const token = jwt.sign(mockUser, process.env.JWT_SECRET || 'voyago-dev-secret');

  const validScheduleId = '550e8400-e29b-41d4-a716-446655440000';
  const validSeatId = '550e8400-e29b-41d4-a716-446655440001';

  describe('POST /api/v1/bookings', () => {
    it('should create a pending booking with 10min lock', async () => {
      const bookingData = {
        scheduleId: validScheduleId,
        seatId: validSeatId,
      };

      (prismaMock.schedule.findUnique as jest.Mock).mockResolvedValue({
        id: validScheduleId,
        price: 5000,
      });

      (prismaMock.seat.findUnique as jest.Mock).mockResolvedValue({
        id: validSeatId,
        seatNumber: 12,
        busId: '550e8400-e29b-41d4-a716-446655440002',
      });

      (prismaMock.booking.findFirst as jest.Mock).mockResolvedValue(null);
      
      (prismaMock.booking.create as jest.Mock).mockResolvedValue({
        id: 'booking-id',
        userId: mockUser.id,
        scheduleId: validScheduleId,
        seatId: validSeatId,
        seatNumber: 12,
        status: 'pending',
        totalPrice: 5000,
        lockedUntil: new Date(Date.now() + 10 * 60000),
      });

      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send(bookingData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('pending');
      expect(res.body.data).toHaveProperty('lockedUntil');
    });

    it('should return 409 if seat is already taken', async () => {
      const bookingData = {
        scheduleId: validScheduleId,
        seatId: validSeatId,
      };

      (prismaMock.schedule.findUnique as jest.Mock).mockResolvedValue({ id: validScheduleId });
      (prismaMock.seat.findUnique as jest.Mock).mockResolvedValue({ id: validSeatId });
      
      (prismaMock.booking.findFirst as jest.Mock).mockResolvedValue({ 
        id: 'existing-id',
        status: 'confirmed'
      });

      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send(bookingData);

      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/déjà réservé/);
    });
  });

  describe('GET /api/v1/bookings', () => {
    it('should return user bookings', async () => {
      (prismaMock.booking.findMany as jest.Mock).mockResolvedValue([
        { id: 'b1', userId: mockUser.id },
        { id: 'b2', userId: mockUser.id },
      ]);

      const res = await request(app)
        .get('/api/v1/bookings')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });
  });
});
