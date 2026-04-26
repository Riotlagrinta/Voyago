import { PrismaClient, PaymentStatus, BookingStatus, PaymentMethod } from '@prisma/client';
import { PaymentFactory } from './PaymentFactory';
import { PaymentRequest } from './types';
import { prisma } from '../../lib/prisma';
import { QRService } from '../booking/QRService';

export class PaymentService {
  /**
   * Traite un paiement pour une rÃ©servation
   */
  static async processBookingPayment(bookingId: string, method: PaymentMethod, phoneNumber: string) {
    try {
      // 1. RÃ©cupÃ©rer la rÃ©servation
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { schedule: true }
      });

      if (!booking) {
        throw new Error('RÃ©servation introuvable');
      }

      if (booking.status === BookingStatus.confirmed) {
        throw new Error('Cette rÃ©servation est dÃ©jÃ  confirmÃ©e');
      }

      // 2. CrÃ©er l'enregistrement de paiement initial
      const payment = await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: booking.totalPrice,
          method: method,
          status: PaymentStatus.pending,
          phoneNumber: phoneNumber
        }
      });

      // 3. Obtenir le provider via la Factory
      const provider = PaymentFactory.getProvider(method);

      // 4. Initier le paiement
      const paymentRequest: PaymentRequest = {
        amount: Number(booking.totalPrice),
        currency: 'XOF',
        phoneNumber: phoneNumber,
        method: method,
        description: `Voyago - RÃ©servation #${booking.id}`,
        metadata: { bookingId: booking.id, paymentId: payment.id }
      };

      const response = await provider.initiatePayment(paymentRequest);

      // 5. Mettre Ã  jour le paiement avec la rÃ©ponse du provider
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: response.status,
          reference: response.transactionId,
          gatewayResponse: response.rawResponse || {}
        }
      });

      // 6. Gestion des rÃ©sultats
      if (response.status === PaymentStatus.completed) {
        const qrCode = QRService.generateTicketData(bookingId);

        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            status: BookingStatus.confirmed,
            qrCode: qrCode
          }
        });

        console.log(`[PaymentService] RÃ©servation ${bookingId} confirmÃ©e.`);
      } else if (response.status === PaymentStatus.failed) {
        // En cas d'Ã©chec explicite du provider
        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: BookingStatus.pending } // On garde en pending pour permettre un retry
        });
        throw new Error(response.message || 'Le paiement a Ã©chouÃ© auprÃ¨s du fournisseur');
      }

      return {
        payment: updatedPayment,
        bookingStatus: response.status === PaymentStatus.completed ? BookingStatus.confirmed : BookingStatus.pending,
        message: response.message
      };

    } catch (error: any) {
      console.error(`[PaymentService] Erreur lors du traitement du paiement:`, error.message);
      throw error;
    }
  }

  /**
   * Effectue un remboursement
   */
  static async processRefund(paymentId: string) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { booking: true }
      });

      if (!payment || !payment.reference) {
        throw new Error('Paiement introuvable ou non rÃ©fÃ©rencÃ©');
      }

      if (payment.status === PaymentStatus.refunded) {
        throw new Error('Ce paiement a dÃ©jÃ  Ã©tÃ© remboursÃ©');
      }

      const provider = PaymentFactory.getProvider(payment.method);
      const response = await provider.refund(payment.reference, Number(payment.amount));

      if (response.status === PaymentStatus.refunded) {
        await prisma.payment.update({
          where: { id: paymentId },
          data: { status: PaymentStatus.refunded }
        });

        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: { status: BookingStatus.cancelled }
        });

        console.log(`[PaymentService] Paiement ${paymentId} remboursÃ© et rÃ©servation annulÃ©e.`);
      }

      return response;
    } catch (error: any) {
      console.error(`[PaymentService] Erreur lors du remboursement:`, error.message);
      throw error;
    }
  }

  /**
   * VÃ©rifie et synchronise le statut d'un paiement
   */
  static async syncPaymentStatus(paymentId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true }
    });

    if (!payment || !payment.reference) return;

    const provider = PaymentFactory.getProvider(payment.method);
    const response = await provider.checkStatus(payment.reference);

    if (response.status !== payment.status) {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: response.status }
      });

      if (response.status === PaymentStatus.completed && payment.booking.status !== BookingStatus.confirmed) {
        const qrCode = QRService.generateTicketData(payment.bookingId);
        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: { 
            status: BookingStatus.confirmed,
            qrCode: qrCode
          }
        });
      }
    }

    return response;
  }
}
