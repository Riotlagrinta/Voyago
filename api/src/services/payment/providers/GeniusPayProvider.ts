import { PaymentStatus } from '@prisma/client';
import { IPaymentProvider, PaymentRequest, PaymentResponse } from '../types';

export class GeniusPayProvider implements IPaymentProvider {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.GENIUSPAY_API_KEY || '';
    this.baseUrl = process.env.GENIUSPAY_BASE_URL || 'https://api.geniuspay.tg/v1';
  }

  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    console.log(`[GeniusPay] Initialisation du paiement pour ${request.phoneNumber} (${request.amount} ${request.currency})`);
    
    // Simulation d'appel API GeniusPay
    // TODO: Implémenter l'appel axios réel
    
    return {
      success: true,
      transactionId: `gp_${Math.random().toString(36).substr(2, 9)}`,
      status: PaymentStatus.pending,
      paymentUrl: `https://checkout.geniuspay.tg/pay/test_token`,
      message: 'Redirection vers la page de paiement GeniusPay'
    };
  }

  async checkStatus(transactionId: string): Promise<PaymentResponse> {
    console.log(`[GeniusPay] Vérification du statut pour la transaction ${transactionId}`);
    
    // TODO: Implémenter l'appel GET status
    
    return {
      success: true,
      transactionId,
      status: PaymentStatus.pending
    };
  }

  async handleWebhook(payload: any): Promise<PaymentResponse> {
    console.log(`[GeniusPay] Réception du webhook`, payload);
    
    // TODO: Valider la signature du webhook et parser les données
    
    return {
      success: true,
      transactionId: payload.reference,
      status: PaymentStatus.completed
    };
  }

  async refund(transactionId: string, amount?: number): Promise<PaymentResponse> {
    console.log(`[GeniusPay] Remboursement demandé pour ${transactionId}`);
    
    // TODO: Implémenter le remboursement
    
    throw new Error('Remboursement non implémenté pour GeniusPay');
  }
}
