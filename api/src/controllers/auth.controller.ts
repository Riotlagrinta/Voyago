import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { createError } from '../middlewares/error.middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'voyago-dev-secret';

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères.'),
  email: z.string().trim().email('Email invalide.'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères.'),
  phone: z.string().trim().regex(/^\+228[0-9]{8}$/, 'Format téléphone Togo invalide (+228XXXXXXXX).').optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email('Email invalide.'),
  password: z.string().min(1, 'Le mot de passe est requis.'),
});

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return next(createError(parseResult.error.issues[0].message, 400));
    }
    const { email, password } = parseResult.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return next(createError('Identifiants invalides', 401));
    }

    if (!user.isActive) {
      return next(createError('Ce compte a été désactivé', 403));
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        // Si l'utilisateur est un admin de compagnie, on pourrait vouloir inclure son companyId
        // Mais pour l'instant le schéma ne montre pas de lien direct User -> Company (1-1 ou 1-N via adminId)
      }, 
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // On ne renvoie pas le passwordHash
    const { passwordHash, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return next(createError(parseResult.error.issues[0].message, 400));
    }
    const { name, email, password, phone } = parseResult.data;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          phone ? { phone } : {}
        ].filter(cond => Object.keys(cond).length > 0)
      }
    });

    if (existingUser) {
      return next(createError('Un compte existe déjà avec cet email ou ce téléphone', 409));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash: hashedPassword,
        role: 'passenger',
      }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role }, 
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { passwordHash, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(createError('Non authentifié', 401));
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return next(createError('Utilisateur non trouvé', 404));
    }

    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  // Simplifié pour la démo
  res.json({ success: true });
};

export const logout = async (req: Request, res: Response) => {
  res.json({ success: true });
};
