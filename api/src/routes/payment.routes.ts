import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController';

const paymentRouter = Router();

// Initier un paiement
paymentRouter.post('/process', PaymentController.processPayment);

// Vérifier le statut d'un paiement
paymentRouter.get('/status/:paymentId', PaymentController.getPaymentStatus);

export default paymentRouter;
