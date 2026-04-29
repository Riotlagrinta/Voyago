import { Resend } from 'resend';

/**
 * Service de notification pour l'envoi d'emails et SMS
 */
export class NotificationService {
  private static resend = new Resend(process.env.RESEND_API_KEY || 're_123');

  /**
   * Envoie un email de confirmation de réservation
   */
  static async sendBookingConfirmationEmail(to: string, bookingData: any) {
    console.log(`[NotificationService] Envoi d'email de confirmation à ${to}`);
    
     try {
       const { data, error } = await this.resend.emails.send({
         from: 'Voyago <noreply@voyago.tg>',
         to: [to],
         subject: 'Confirmation de votre voyage - Voyago',
         html: `
           <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
             <div style="background-color: #10B981; padding: 20px; text-align: center; color: white;">
               <h1 style="margin: 0;">VOYAGO</h1>
             </div>
             <div style="padding: 30px;">
               <h2>Confirmation de réservation</h2>
               <p>Bonjour ${bookingData.passengerName},</p>
               <p>Bonne nouvelle ! Votre paiement a été validé et votre voyage est confirmé.</p>
               
               <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                 <p style="margin: 5px 0;"><strong>Trajet :</strong> ${bookingData.route}</p>
                 <p style="margin: 5px 0;"><strong>Date :</strong> ${bookingData.date}</p>
                 <p style="margin: 5px 0;"><strong>Siège :</strong> #${bookingData.seatNumber}</p>
               </div>
               
               <div style="text-align: center; margin-top: 30px;">
                 <a href="${bookingData.ticketUrl}" style="background-color: #10B981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Télécharger mon ticket</a>
               </div>
             </div>
             <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
               &copy; 2026 Voyago Togo - Voyager n'a jamais été aussi simple.
             </div>
           </div>
         `,
       });

      if (error) {
        console.error('[Resend Error]', error);
      }
      return data;
    } catch (err) {
      console.error('[NotificationService] Email Failed:', err);
    }
  }

  /**
   * Envoie un SMS de notification (Simulé pour le MVP)
   */
  static async sendSMS(phoneNumber: string, message: string) {
    console.log(`
    📱 [SMS SIMULATION] ━━━━━━━━━━━━━━━━━━━━━━━━
       DESTINATAIRE : ${phoneNumber}
       MESSAGE      : ${message}
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
    return { success: true, messageId: 'sim_123' };
  }
}
