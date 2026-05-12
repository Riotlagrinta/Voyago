import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { createError } from '../middlewares/error.middleware';

export const getAllCompanies = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const companies = await prisma.company.findMany({
      where: { status: 'active' },
      include: {
        gallery: {
          orderBy: { displayOrder: 'asc' },
          take: 5
        }
      }
    });

    res.json({
      success: true,
      data: companies,
    });
  } catch (error) {
    next(error);
  }
};

export const getCompanyBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;
    const company = await prisma.company.findUnique({
      where: { slug },
      include: {
        gallery: {
          orderBy: { displayOrder: 'asc' }
        }
      }
    });

    if (!company) {
      return next(createError('Compagnie non trouvée', 404));
    }

    const { gallery, ...companyData } = company;

    res.json({
      success: true,
      data: { 
        company: companyData,
        gallery: gallery || [] 
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createCompany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, slug, description, phone, email, address, themeColor, slogan } = req.body;
    const adminId = req.user?.id;

    if (!adminId) {
      return next(createError('Non authentifié', 401));
    }

    if (!name || !slug) {
      return next(createError('Le nom et le slug sont requis', 400));
    }

    const existing = await prisma.company.findUnique({ where: { slug } });
    if (existing) {
      return next(createError('Un slug identique existe déjà', 409));
    }

    const company = await prisma.company.create({
      data: {
        name,
        slug,
        description,
        phone,
        email,
        address,
        themeColor: themeColor || '#50C9CE',
        slogan,
        status: 'active', // Par défaut pour le moment
        adminId,
      }
    });

    res.status(201).json({
      success: true,
      data: company
    });
  } catch (error) {
    next(error);
  }
};

export const updateCompany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId } = req.params;
    const updateData = req.body;

    const company = await prisma.company.update({
      where: { id: companyId },
      data: updateData
    });

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    next(error);
  }
};

export const updateVitrine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId } = req.params;
    const { themeColor, slogan, description, bannerUrl, logoUrl } = req.body;

    const company = await prisma.company.update({
      where: { id: companyId },
      data: { themeColor, slogan, description, bannerUrl, logoUrl }
    });

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    next(error);
  }
};

export const uploadGallery = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId } = req.params;
    const { imageUrl, caption, displayOrder } = req.body;

    const image = await prisma.companyGallery.create({
      data: {
        companyId,
        imageUrl,
        caption,
        displayOrder: displayOrder || 0
      }
    });

    res.status(201).json({
      success: true,
      data: image
    });
  } catch (error) {
    next(error);
  }
};

export const deleteGalleryImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { imageId } = req.params;

    await prisma.companyGallery.delete({
      where: { id: imageId }
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const getCompanyStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyId = req.params.companyId || req.user?.companyId;

    if (!companyId) {
      return next(createError('ID de compagnie manquant', 400));
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      activeBuses,
      driversCount,
      routesCount,
      schedulesCount,
      totalBookings,
      revenueResult,
      uniquePassengersResult,
      recentBookings,
      allRoutes,
    ] = await Promise.all([
      prisma.bus.count({ where: { companyId, status: 'active' } }),
      prisma.driver.count({ where: { companyId } }),
      prisma.route.count({ where: { companyId } }),
      prisma.schedule.count({ where: { route: { companyId } } }),
      prisma.booking.count({
        where: {
          schedule: { route: { companyId } },
          createdAt: { gte: thirtyDaysAgo },
          status: { not: 'cancelled' },
        }
      }),
      prisma.payment.aggregate({
        where: {
          booking: { schedule: { route: { companyId } } },
          status: 'completed',
          createdAt: { gte: thirtyDaysAgo },
        },
        _sum: { amount: true }
      }),
      prisma.booking.findMany({
        where: {
          schedule: { route: { companyId } },
          createdAt: { gte: thirtyDaysAgo },
          status: { not: 'cancelled' },
        },
        select: { userId: true },
        distinct: ['userId'],
      }),
      prisma.booking.findMany({
        where: { schedule: { route: { companyId } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          schedule: {
            include: {
              route: {
                include: {
                  departureStation: true,
                  arrivalStation: true,
                },
              },
            },
          },
        },
      }),
      prisma.route.findMany({
        where: { companyId },
        include: {
          departureStation: true,
          arrivalStation: true,
          _count: {
            select: {
              schedules: {
                where: {
                  bookings: {
                    some: { status: { not: 'cancelled' } },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    // Build 7-day revenue chart data
    const dayLabels = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const chartData: { name: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      const dayRevenue = await prisma.payment.aggregate({
        where: {
          booking: { schedule: { route: { companyId } } },
          status: 'completed',
          createdAt: { gte: dayStart, lte: dayEnd },
        },
        _sum: { amount: true },
      });
      chartData.push({
        name: dayLabels[day.getDay()],
        total: Number(dayRevenue._sum.amount || 0),
      });
    }

    // Popular routes by booking count
    const routeBookingCounts = await Promise.all(
      allRoutes.map(async (route) => {
        const count = await prisma.booking.count({
          where: {
            schedule: { routeId: route.id },
            status: { not: 'cancelled' },
          },
        });
        return {
          route: `${route.departureStation.city} ↔ ${route.arrivalStation.city}`,
          count,
        };
      })
    );
    const popularRoutes = routeBookingCounts
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    res.json({
      success: true,
      data: {
        // KPI cards
        totalRevenue: Number(revenueResult._sum.amount || 0),
        totalBookings,
        activeBuses,
        uniquePassengers: uniquePassengersResult.length,
        // Legacy fields
        busesCount: activeBuses,
        driversCount,
        routesCount,
        schedulesCount,
        bookingsCount: totalBookings,
        revenue: Number(revenueResult._sum.amount || 0),
        // Charts
        chartData,
        popularRoutes,
        recentBookings: recentBookings.map(b => ({
          id: b.id,
          seatNumber: b.seatNumber,
          status: b.status,
          totalPrice: b.totalPrice,
          passengerName: b.passengerName,
          createdAt: b.createdAt,
          route: `${b.schedule.route.departureStation.city} ↔ ${b.schedule.route.arrivalStation.city}`,
        })),
      }
    });
  } catch (error) {
    next(error);
  }
};
