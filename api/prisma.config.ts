import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Supabase : On utilise la DATABASE_URL (Pooling) pour l'API
// et on peut utiliser DIRECT_URL pour les migrations si besoin
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/voyago',
  },
});
