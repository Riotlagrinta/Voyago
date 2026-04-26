import { PaymentMethod, PaymentStatus } from '@prisma/client';

export interface PaymentRequest {
  amount: number;
  currency: string;
  phoneNumber: string;
  method: PaymentMethod;
  description?: string;
  metadata?: any;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  status: PaymentStatus;
  paymentUrl?: string;
  message?: string;
  rawResponse?: any;
}

export interface IPaymentProvider {
  /**
   * Initialise une transaction de paiement
   */
  initiatePayment(request: PaymentRequest): Promise<PaymentResponse>;

  /**
   * Vérifie le statut d'une transaction
   */
  checkStatus(transactionId: string): Promise<PaymentResponse>;

  /**
   * Gère le webhook de confirmation
   */
  handleWebhook(payload: any): Promise<PaymentResponse>;

  /**
   * Rembourse une transaction
   */
  refund(transactionId: string, amount?: number): Promise<PaymentResponse>;
}
