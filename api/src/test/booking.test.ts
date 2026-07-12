import request from 'supertest';
import app from '../index';
import { prisma as prismaMock } from '../lib/prisma';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../lib/secrets';

describe('Booking Endpoints', () => {
  const mockUser = {
    id: 'user-id',
    email: 'passenger@example.com',
    role: 'passenger',
    name: 'Passenger User',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (prismaMock as any).$transaction = jest.fn().mockImplementation(async (callback: any) => {
      return callback(prismaMock);
    });
  });

  const token = jwt.sign(mockUser, JWT_SECRET);

  const validScheduleId = '550e8400-e29b-41d4-a716-446655440000';
  const validSeatId = '550e8400-e29b-41d4-a716-446655440001';

  describe('POST /api/v1/bookings', () => {
    it('should create a pending booking with 10min lock', async () => {
      const bookingData = {
        scheduleId: validScheduleId,
        seats: [{
          seatId: validSeatId,
          passengerName: 'Test Passager',
          passengerPhone: '90123456'
        }],
      };

      (prismaMock.schedule.findUnique as jest.Mock).mockResolvedValue({
        id: validScheduleId,
        price: 5000,
        availableSeats: 40,
        status: 'published',
      });

      (prismaMock.user.findFirst as jest.Mock).mockResolvedValue({ id: mockUser.id });
      (prismaMock.seat.findMany as jest.Mock).mockResolvedValue([{ id: validSeatId, seatNumber: 12 }]);
      (prismaMock.booking.findMany as jest.Mock).mockResolvedValue([]);
      (prismaMock.schedule.update as jest.Mock).mockResolvedValue({});
      
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

      if (res.status === 500) console.log('ERROR 1:', res.body);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data[0].status).toBe('pending');
      expect(res.body.data[0]).toHaveProperty('lockedUntil');
    });

    it('should return 409 if seat is already taken', async () => {
      const bookingData = {
        scheduleId: validScheduleId,
        seats: [{
          seatId: validSeatId,
          passengerName: 'Test Passager',
          passengerPhone: '90123456'
        }],
      };

      (prismaMock.schedule.findUnique as jest.Mock).mockResolvedValue({
        id: validScheduleId,
        price: 5000,
        availableSeats: 40,
        status: 'published',
      });
      (prismaMock.user.findFirst as jest.Mock).mockResolvedValue({ id: mockUser.id });
      (prismaMock.booking.findMany as jest.Mock).mockResolvedValue([{ seatId: validSeatId }]);

      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send(bookingData);

      if (res.status === 500) console.log('ERROR 2:', res.body);

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
