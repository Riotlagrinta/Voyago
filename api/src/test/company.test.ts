import request from 'supertest';
import app from '../index';
import { prisma as prismaMock } from '../lib/prisma';
import jwt from 'jsonwebtoken';

describe('Company Endpoints', () => {
  const superAdmin = {
    id: 'admin-id',
    email: 'admin@voyago.tg',
    role: 'super_admin',
  };

  const companyAdmin = {
    id: 'ca-id',
    email: 'ca@company.tg',
    role: 'company_admin',
    companyId: 'company-id',
  };

  const adminToken = jwt.sign(superAdmin, process.env.JWT_SECRET || 'voyago-dev-secret');
  const caToken = jwt.sign(companyAdmin, process.env.JWT_SECRET || 'voyago-dev-secret');

  describe('GET /api/v1/companies', () => {
    it('should return all active companies to public', async () => {
      (prismaMock.company.findMany as jest.Mock).mockResolvedValue([
        { id: 'c1', name: 'Company 1', slug: 'c1', status: 'active' },
        { id: 'c2', name: 'Company 2', slug: 'c2', status: 'active' },
      ]);

      const res = await request(app).get('/api/v1/companies');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });
  });

  describe('POST /api/v1/companies', () => {
    it('should allow super_admin to create a company', async () => {
      const companyData = {
        name: 'Voyago Express',
        slug: 'voyago-express',
      };

      (prismaMock.company.create as jest.Mock).mockResolvedValue({
        id: 'new-id',
        ...companyData,
        status: 'active',
        adminId: superAdmin.id,
      });

      const res = await request(app)
        .post('/api/v1/companies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(companyData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should deny company creation to normal passenger', async () => {
      const passengerToken = jwt.sign({ id: 'p', role: 'passenger' }, process.env.JWT_SECRET || 'voyago-dev-secret');

      const res = await request(app)
        .post('/api/v1/companies')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send({ name: 'Fail' });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/v1/companies/:id/stats', () => {
    it('should allow company_admin to see their own stats', async () => {
      // Mock for belongsToCompany middleware
      (prismaMock.company.findFirst as jest.Mock).mockResolvedValue({ id: 'company-id' });
      
      // Mock for stats
      (prismaMock.company.findUnique as jest.Mock).mockResolvedValue({ id: 'company-id' });
      (prismaMock.bus.count as jest.Mock).mockResolvedValue(5);
      (prismaMock.driver.count as jest.Mock).mockResolvedValue(10);
      (prismaMock.route.count as jest.Mock).mockResolvedValue(3);
      (prismaMock.schedule.count as jest.Mock).mockResolvedValue(20);
      (prismaMock.booking.count as jest.Mock).mockResolvedValue(100);
      (prismaMock.payment.aggregate as jest.Mock).mockResolvedValue({ _sum: { amount: 500000 } });

      const res = await request(app)
        .get('/api/v1/companies/company-id/stats')
        .set('Authorization', `Bearer ${caToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.revenue).toBe(500000);
      expect(res.body.data.busesCount).toBe(5);
    });
  });
});
