import request from 'supertest';
import app from '../index';
import { prisma as prismaMock } from '../lib/prisma';
import bcrypt from 'bcryptjs';

describe('Auth Endpoints', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '+22890000000',
      };

      (prismaMock.user.findFirst as jest.Mock).mockResolvedValue(null);
      (prismaMock.user.create as jest.Mock).mockResolvedValue({
        id: 'user-id',
        ...userData,
        role: 'passenger',
        isActive: true,
        emailVerified: false,
      });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(userData.email);
      expect(res.body.data).toHaveProperty('token');
    });

    it('should return 409 if user already exists', async () => {
      const userData = {
        name: 'John Doe',
        email: 'existing@example.com',
        password: 'password123',
      };

      (prismaMock.user.findFirst as jest.Mock).mockResolvedValue({ id: 'existing-id' });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/compte existe déjà/);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'password123',
      };

      const hashedPassword = await bcrypt.hash(loginData.password, 12);

      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-id',
        name: 'John Doe',
        email: loginData.email,
        passwordHash: hashedPassword,
        role: 'passenger',
        isActive: true,
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
    });

    it('should return 401 with incorrect password', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'wrongpassword',
      };

      const hashedPassword = await bcrypt.hash('correctpassword', 12);

      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-id',
        email: loginData.email,
        passwordHash: hashedPassword,
        isActive: true,
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData);

      expect(res.status).toBe(401);
    });
  });
});
