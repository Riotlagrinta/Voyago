import { PrismaClient } from '@prisma/client';

// En mode démo, on n'initialise Prisma que si nécessaire
// Pour l'instant, on l'exporte comme null ou on gère l'erreur
let prismaInstance: any;

try {
  prismaInstance = new PrismaClient();
} catch (e) {
  prismaInstance = {}; // Objet vide pour éviter les crashs d'importation
}

export const prisma = prismaInstance;

export const connectDB = async () => {
  console.log('🚍 Voyago API — Mode Démo activé (Données simulées)');
  console.log('💡 La base de données réelle est ignorée pour le moment.');
};
