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

    const [
      busesCount,
      driversCount,
      routesCount,
      schedulesCount,
      bookingsCount,
      revenueResult
    ] = await Promise.all([
      prisma.bus.count({ where: { companyId } }),
      prisma.driver.count({ where: { companyId } }),
      prisma.route.count({ where: { companyId } }),
      prisma.schedule.count({ where: { route: { companyId } } }),
      prisma.booking.count({ where: { schedule: { route: { companyId } } } }),
      prisma.payment.aggregate({
        where: {
          booking: { schedule: { route: { companyId } } },
          status: 'completed'
        },
        _sum: { amount: true }
      })
    ]);

    res.json({ 
      success: true, 
      data: { 
        busesCount,
        driversCount,
        routesCount,
        schedulesCount,
        bookingsCount,
        revenue: Number(revenueResult._sum.amount || 0)
      } 
    }); 
  } catch (error) {
    next(error);
  }
};
