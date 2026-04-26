import { Router } from 'express';
import {
  getBookings, getBookingById, createBooking, cancelBooking, validateQrCode, downloadTicketPDF
} from '../controllers/booking.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, getBookings);
router.get('/:id', authenticate, getBookingById);
router.get('/:id/download', authenticate, downloadTicketPDF);
router.post('/', authenticate, createBooking);
router.post('/validate-qr', authenticate, validateQrCode);
router.patch('/:id/cancel', authenticate, cancelBooking);

export default router;
