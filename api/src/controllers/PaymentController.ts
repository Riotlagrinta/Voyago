import { Request, Response } from 'express';
import { PaymentService } from '../services/payment/PaymentService';

export class PaymentController {
  static async processPayment(req: Request, res: Response) {
    try {
      const { bookingId, method, phoneNumber } = req.body;
      const result = await PaymentService.processBookingPayment(bookingId, method, phoneNumber);
      
      return res.status(201).json({
        success: true,
        message: 'Paiement traité avec succès',
        data: result
      });
    } catch (error: any) {
      console.error('[PaymentController] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors du traitement du paiement'
      });
    }
  }

  static async getPaymentStatus(req: Request, res: Response) {
    try {
      const { paymentId } = req.params;
      const result = await PaymentService.syncPaymentStatus(paymentId);
      
      return res.status(200).json({
        success: true,
        message: 'Statut du paiement récupéré',
        data: result
      });
    } catch (error: any) {
      console.error('[PaymentController] Error:', error.message);
      return res.status(404).json({
        success: false,
        message: error.message || 'Paiement introuvable'
      });
    }
  }
}
