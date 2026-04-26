import { v4 as uuidv4 } from 'uuid';

/**
 * Service pour la gestion des QR codes de tickets
 */
export class QRService {
  /**
   * Génère une donnée unique pour le QR code d'un ticket
   */
  static generateTicketData(bookingId: string): string {
    const randomHash = uuidv4().split('-')[0].toUpperCase();
    // Format: VYG-[BOOKING_ID_PREFIX]-[RANDOM]
    return `VYG-${bookingId.split('-')[0].toUpperCase()}-${randomHash}`;
  }

  /**
   * Vérifie les données d'un ticket (utilisé par le scanner chauffeur)
   */
  static verifyTicketData(qrData: string) {
    // Pour l'instant, on vérifie juste le préfixe
    if (!qrData.startsWith('VYG-')) {
      return null;
    }
    
    const parts = qrData.split('-');
    return {
      bookingIdPrefix: parts[1],
      uniqueHash: parts[2]
    };
  }
}
