import { Router } from 'express';
import {
  getAllCompanies, getCompanyBySlug, createCompany,
  updateCompany, updateVitrine, uploadGallery,
  deleteGalleryImage, getCompanyStats,
} from '../controllers/company.controller';
import { authenticate, authorize, belongsToCompany } from '../middlewares/auth.middleware';

const router = Router();

// Public
router.get('/', getAllCompanies);
router.get('/:slug', getCompanyBySlug);

// Protégé — company_admin
router.post('/', authenticate, authorize('company_admin', 'super_admin'), createCompany);
router.put('/:companyId', authenticate, authorize('company_admin', 'super_admin'), belongsToCompany, updateCompany);
router.patch('/:companyId/vitrine', authenticate, authorize('company_admin', 'super_admin'), belongsToCompany, updateVitrine);
router.post('/:companyId/gallery', authenticate, authorize('company_admin', 'super_admin'), belongsToCompany, uploadGallery);
router.delete('/:companyId/gallery/:imageId', authenticate, authorize('company_admin', 'super_admin'), belongsToCompany, deleteGalleryImage);
router.get('/:companyId/stats', authenticate, authorize('company_admin', 'super_admin'), belongsToCompany, getCompanyStats);

export default router;
