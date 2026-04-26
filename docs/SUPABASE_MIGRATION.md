# 🚀 StratÃ©gie de Migration Full Supabase â€” Voyago

Ce document dÃ©taille le plan technique pour passer d'une architecture Express/Node.js Ã  un modÃ¨le **Backend-as-a-Service (BaaS)** avec Supabase.

## 🏗️ Nouvelle Architecture Cible
- **Auth** : Supabase Auth (remplace `auth.controller.ts`).
- **Database** : PostgreSQL + PostGIS sur Supabase avec Politiques RLS.
- **Logiciel (API)** : Supabase Edge Functions (Deno/TypeScript) pour les paiements et PDF.
- **Temps RÃ©el** : Supabase Realtime Channels (remplace Socket.io).
- **Storage** : Supabase Storage pour les photos de bus et justificatifs.

## 📋 Plan d'Action (Demain)

### 1. Frontend Web (PrioritÃ© 1)
- [ ] Installer `@supabase/supabase-js`.
- [ ] CrÃ©er `web/src/lib/supabase.ts` (Initialisation du client).
- [ ] Refactoriser `web/src/store/useAuthStore.ts` pour utiliser `supabase.auth`.
- [ ] Adapter `web/src/lib/api.ts` pour requÃªter directement Supabase pour les donnÃ©es simples.

### 2. Base de DonnÃ©es & SÃ©curitÃ©
- [ ] Migrer le schÃ©ma Prisma actuel vers Supabase.
- [ ] Activer **RLS (Row Level Security)** sur toutes les tables.
- [ ] Ã‰crire les politiques de sÃ©curitÃ© (ex: `SELECT` public pour les trajets, `UPDATE` restreint pour les positions GPS).

### 3. Edge Functions (Logiciel MÃ©tier)
- [ ] CrÃ©er la fonction `process-payment` (Portage de `PaymentService.ts`).
- [ ] CrÃ©er la fonction `generate-ticket` (Portage de `TicketPDFService.ts`).

### 4. Suivi GPS (Realtime)
- [ ] Remplacer `useGpsTracking.ts` par une implÃ©mentation `supabase.channel`.

---
*Note : Cette migration va simplifier le dÃ©ploiement car nous n'aurons plus besoin de Render (sauf pour d'Ã©ventuels services tiers spÃ©cifiques). Tout sera centralisÃ© sur Supabase.*
