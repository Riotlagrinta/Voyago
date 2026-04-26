import { PaymentMethod } from '@prisma/client';
import { IPaymentProvider } from './types';
import { MockPaymentProvider } from './providers/MockPaymentProvider';

export class PaymentFactory {
  /**
   * Retourne une instance du fournisseur de paiement approprié
   */
  static getProvider(method: PaymentMethod): IPaymentProvider {
    // Mode simulation pour le MVP
    return new MockPaymentProvider();
  }
}
