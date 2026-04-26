import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma as prismaClient } from '../lib/prisma';
import { createError } from '../middlewares/error.middleware';

const togolesePhoneRegex = /^(\+228)?\d{8}$/;

const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères.').max(100).optional(),
  phone: z
    .string()
    .trim()
    .regex(togolesePhoneRegex, 'Numéro de téléphone invalide. Utilise le format +228XXXXXXXX.')
    .optional(),
  avatarUrl: z.string().trim().url('URL avatar invalide.').optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Le mot de passe actuel est requis.'),
  newPassword: z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères.'),
});

type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

const parseBody = <T>(
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  payload: unknown,
  next: NextFunction
): T | undefined => {
  const result = schema.safeParse(payload);

  if (!result.success) {
    next(createError(result.error.issues[0]?.message || 'Données invalides.', 400));
    return undefined;
  }

  return result.data;
};

const formatUser = (user: any) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone ?? null,
  role: user.role,
  avatarUrl: user.avatarUrl ?? null,
  emailVerified: user.emailVerified,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) return next(createError('Accès non autorisé.', 401));

  try {
    const user = await prismaClient.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return next(createError('Utilisateur introuvable.', 404));
    }

    res.json({
      success: true,
      data: formatUser(user),
    });
  } catch (error) {
    next(createError('Erreur interne du serveur.', 500));
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const input = parseBody<UpdateProfileInput>(updateProfileSchema, req.body, next);
  if (!input || !req.user) return;

  const payload = Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined && value !== '')
  );

  if (Object.keys(payload).length === 0) {
    return next(createError('Aucune donnée à mettre à jour.', 400));
  }

  try {
    const user = await prismaClient.user.update({
      where: { id: req.user.id },
      data: payload,
    });

    res.json({
      success: true,
      message: 'Profil mis à jour.',
      data: formatUser(user),
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return next(createError('Ce numéro de téléphone est déjà utilisé.', 409));
    }
    next(createError('Erreur lors de la mise à jour du profil.', 500));
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const input = parseBody<ChangePasswordInput>(changePasswordSchema, req.body, next);
  if (!input || !req.user) return;

  try {
    const user = await prismaClient.user.findUnique({
      where: { id: req.user.id },
      select: { passwordHash: true },
    });

    if (!user) {
      return next(createError('Utilisateur introuvable.', 404));
    }

    const isMatch = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!isMatch) {
      return next(createError('Le mot de passe actuel est incorrect.', 401));
    }

    const newPasswordHash = await bcrypt.hash(input.newPassword, 12);

    await prismaClient.user.update({
      where: { id: req.user.id },
      data: { passwordHash: newPasswordHash },
    });

    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès.',
    });
  } catch (error) {
    next(createError('Erreur lors du changement de mot de passe.', 500));
  }
};

export const deleteAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) return next(createError('Accès non autorisé.', 401));

  try {
    // On ne supprime pas physiquement l'utilisateur s'il a des réservations ou gère une compagnie
    // On le désactive plutôt (Soft delete)
    await prismaClient.user.update({
      where: { id: req.user.id },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Compte désactivé avec succès.',
    });
  } catch (error) {
    next(createError('Erreur lors de la désactivation du compte.', 500));
  }
};
