import { Request, Response } from 'express';

export const getPayments = (_req: Request, res: Response): void => {
  res.json({
    success: true,
    data: [],
  });
};

export const createPayment = (req: Request, res: Response): void => {
  res.status(201).json({
    success: true,
    message: 'Paiement initialisé en mode démonstration.',
    data: {
      id: 'demo-payment-id',
      status: 'pending',
      ...req.body,
    },
  });
};
