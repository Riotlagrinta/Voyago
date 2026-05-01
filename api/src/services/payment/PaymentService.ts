import { PaymentStatus, BookingStatus, PaymentMethod } from '@prisma/client';
import { PaymentFactory } from './PaymentFactory';
import { PaymentRequest } from './types';
import { prisma } from '../../lib/prisma';
import { QRService } from '../booking/QRService';

export class PaymentService {
  static async processBookingPayment(bookingId: string, method: PaymentMethod, phoneNumber: string) {
    // 1. Lire la réservation hors transaction (lecture seule, pas besoin d'isolation)
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { schedule: true },
    });

    if (!booking) throw new Error('Réservation introuvable');
    if (booking.status === BookingStatus.confirmed) throw new Error('Cette réservation est déjà confirmée');

    // 2. Créer l'enregistrement de paiement initial (avant d'appeler le provider)
    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.totalPrice,
        method,
        status: PaymentStatus.pending,
        phoneNumber,
      },
    });

    // 3. Appel au provider externe (hors transaction — les appels réseau ne peuvent pas être rollback)
    const provider = PaymentFactory.getProvider(method);
    const paymentRequest: PaymentRequest = {
      amount: Number(booking.totalPrice),
      currency: 'XOF',
      phoneNumber,
      method,
      description: `Voyago - Réservation #${booking.id}`,
      metadata: { bookingId: booking.id, paymentId: payment.id },
    };

    let response;
    try {
      response = await provider.initiatePayment(paymentRequest);
    } catch (providerError) {
      // Marquer le paiement comme échoué si le provider est inaccessible
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.failed },
      });
      throw providerError;
    }

    // 4. Mettre à jour payment + booking dans une transaction atomique
    const updatedPayment = await prisma.$transaction(async (tx) => {
      const updated = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: response.status,
          reference: response.transactionId,
          gatewayResponse: response.rawResponse ?? {},
        },
      });

      if (response.status === PaymentStatus.completed) {
        const qrCode = QRService.generateTicketData(bookingId);
        await tx.booking.update({
          where: { id: bookingId },
          data: { status: BookingStatus.confirmed, qrCode },
        });
      }

      return updated;
    });

    if (response.status === PaymentStatus.failed) {
      throw new Error(response.message || 'Le paiement a échoué auprès du fournisseur.');
    }

    return {
      payment: updatedPayment,
      bookingStatus: response.status === PaymentStatus.completed
        ? BookingStatus.confirmed
        : BookingStatus.pending,
      message: response.message,
    };
  }

  static async processRefund(paymentId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true },
    });

    if (!payment || !payment.reference) throw new Error('Paiement introuvable ou non référencé');
    if (payment.status === PaymentStatus.refunded) throw new Error('Ce paiement a déjà été remboursé');

    const provider = PaymentFactory.getProvider(payment.method);
    const response = await provider.refund(payment.reference, Number(payment.amount));

    if (response.status === PaymentStatus.refunded) {
      await prisma.$transaction([
        prisma.payment.update({ where: { id: paymentId }, data: { status: PaymentStatus.refunded } }),
        prisma.booking.update({ where: { id: payment.bookingId }, data: { status: BookingStatus.cancelled } }),
      ]);
    }

    return response;
  }

  static async syncPaymentStatus(paymentId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true },
    });

    if (!payment?.reference) return;

    const provider = PaymentFactory.getProvider(payment.method);
    const response = await provider.checkStatus(payment.reference);

    if (response.status !== payment.status) {
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({ where: { id: paymentId }, data: { status: response.status } });

        if (
          response.status === PaymentStatus.completed &&
          payment.booking.status !== BookingStatus.confirmed
        ) {
          const qrCode = QRService.generateTicketData(payment.bookingId);
          await tx.booking.update({
            where: { id: payment.bookingId },
            data: { status: BookingStatus.confirmed, qrCode },
          });
        }
      });
    }

    return response;
  }
}
