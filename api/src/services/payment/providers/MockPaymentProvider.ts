import { PaymentStatus } from '@prisma/client';
import { IPaymentProvider, PaymentRequest, PaymentResponse } from '../types';

/**
 * Fournisseur de simulation pour le MVP
 * Simule toujours des transactions réussies
 */
export class MockPaymentProvider implements IPaymentProvider {
  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    const transactionId = `mock_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`[MockPayment] Simulation d'initiation pour ${request.phoneNumber}: ${transactionId}`);
    
    return {
      success: true,
      transactionId,
      status: PaymentStatus.completed, // Succès immédiat pour le MVP
      message: 'Paiement simulé réussi avec succès'
    };
  }

  async checkStatus(transactionId: string): Promise<PaymentResponse> {
    return {
      success: true,
      transactionId,
      status: PaymentStatus.completed
    };
  }

  async handleWebhook(payload: any): Promise<PaymentResponse> {
    return {
      success: true,
      transactionId: payload.reference || 'mock_ref',
      status: PaymentStatus.completed
    };
  }

  async refund(transactionId: string, amount?: number): Promise<PaymentResponse> {
    return {
      success: true,
      transactionId,
      status: PaymentStatus.refunded,
      message: 'Remboursement simulé réussi'
    };
  }
}
