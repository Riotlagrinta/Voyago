/**
 * Centralise les secrets d'application.
 * Lance une erreur au démarrage si une variable obligatoire est absente.
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `[Config] Variable d'environnement manquante : ${key}\n` +
      `Ajoutez-la dans votre fichier .env ou dans les variables d'environnement du serveur.`
    );
  }
  return value;
}

export const JWT_SECRET =
  process.env.NODE_ENV === 'production'
    ? requireEnv('JWT_SECRET')
    : (process.env.JWT_SECRET || 'voyago-dev-only-secret-do-not-use-in-prod');

export const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as `${number}${'s'|'m'|'h'|'d'|'w'|'y'}` | number;
