import { prisma } from '../lib/prisma';

export { prisma };

export const connectDB = async () => {
  try {
    console.log('📡 Tentative de connexion à la base de données...');
    await prisma.$connect();
    console.log('✅ Connexion à la base de données établie avec succès.');
  } catch (error) {
    console.error('❌ Erreur lors de la connexion à la base de données :', error);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

