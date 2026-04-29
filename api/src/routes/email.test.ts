import { Router } from 'express';
import { NotificationService } from '../services/notification/NotificationService';

const router = Router();

/**
 * Endpoint de test pour envoyer un email de confirmation de réservation
 * À utiliser uniquement en développement !
 */
router.get('/test-send-email', async (req, res) => {
  try {
    // Email de test fourni par l'utilisateur
    const testEmail = 'djkeda82@gmail.com';
    
    await NotificationService.sendBookingConfirmationEmail(
      testEmail, 
      {
        passengerName: 'Utilisateur Test',
        route: 'Lomé → Kpalimé',
        date: '2026-05-01',
        time: '10:00',
        seatNumber: '5A',
        ticketUrl: 'https://example.com/ticket.pdf'
      }
    );
    
    res.status(200).json({ 
      success: true, 
      message: `Email de test envoyé à ${testEmail}. Vérifiez votre boîte de réception (et les spams).` 
    });
  } catch (error: any) {
    console.error('Erreur lors de l\'envoi de l\'email de test:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Échec de l\'envoi d\'email', 
      details: error.message 
    });
  }
});

/**
 * Endpoint de test pour envoyer un email de confirmation de paiement
 */
router.get('/test-payment-email', async (req, res) => {
  try {
    // Email de test - À modifier avec votre adresse email réelle
    const testEmail = 'test@voyago.tg'; // Remplacez par votre email de test
    
    // Pour cet exemple, nous allons réutiliser la même méthode mais avec des données de paiement
    // En réalité, vous devriez ajouter une méthode sendPaymentConfirmationEmail dans NotificationService
    res.status(200).json({ 
      success: true, 
      message: 'Endpoint de test pour email de paiement créé. À implémenter dans NotificationService.' 
    });
  } catch (error: any) {
    console.error('Erreur:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;