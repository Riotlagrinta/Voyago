# 🚀 Stratégie de migration Full Supabase - Voyago

Ce document détaille le plan technique pour passer d'une architecture Express/Node.js à un modèle **Backend-as-a-Service (BaaS)** avec Supabase.

## 🏗️ Nouvelle Architecture Cible
- **Auth** : Supabase Auth (remplace `auth.controller.ts`).
- **Database** : PostgreSQL + PostGIS sur Supabase avec Politiques RLS.
- **Logiciel (API)** : Supabase Edge Functions (Deno/TypeScript) pour les paiements et PDF.
- **Temps réel** : Supabase Realtime Channels (remplace Socket.io).
- **Storage** : Supabase Storage pour les photos de bus et justificatifs.

## 📋 Plan d'Action (Demain)

### 1. Frontend Web (Priorité 1)
- [ ] Installer `@supabase/supabase-js`.
- [ ] Créer `web/src/lib/supabase.ts` (initialisation du client).
- [ ] Refactoriser `web/src/store/useAuthStore.ts` pour utiliser `supabase.auth`.
- [ ] Adapter `web/src/lib/api.ts` pour requêter directement Supabase pour les données simples.

### 2. Base de données et sécurité
- [ ] Migrer le schéma Prisma actuel vers Supabase.
- [ ] Activer **RLS (Row Level Security)** sur toutes les tables.
- [ ] Écrire les politiques de sécurité (ex. : `SELECT` public pour les trajets, `UPDATE` restreint pour les positions GPS).

### 3. Edge Functions (logique métier)
- [ ] Créer la fonction `process-payment` (portage de `PaymentService.ts`).
- [ ] Créer la fonction `generate-ticket` (portage de `TicketPDFService.ts`).

### 4. Suivi GPS (Realtime)
- [ ] Remplacer `useGpsTracking.ts` par une implémentation `supabase.channel`.

---
*Note : cette migration va simplifier le déploiement, car nous n'aurons plus besoin de Render (sauf pour d'éventuels services tiers spécifiques). Tout sera centralisé sur Supabase.*
