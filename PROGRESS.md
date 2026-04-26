# ✅ Voyago — Suivi des Tâches

> Dernière mise à jour : 2026-04-26
> **Progression globale** : 20/85 tâches complétées (socle technique stabilisé, chantier produit encore en cours)

---

## 📄 Documentation

| Statut | Tâche | Date |
|--------|-------|------|
| ✅ | Création du `README.md` | 2026-04-15 |
| ✅ | Création de la `ROADMAP.md` | 2026-04-15 |
| ✅ | Création du `PROGRESS.md` (ce fichier) | 2026-04-15 |
| ✅ | Stratégie Migration Supabase (`docs/SUPABASE_MIGRATION.md`) | 2026-04-26 |
| ✅ | Relecture/correction orthographique dépôt applicatif | 2026-04-26 |

---

## 🛠️ Phase 0 — Infrastructure & Design (Semaine 1-2)

### Semaine 1 : Setup technique

| Statut | # | Tâche | Date |
|--------|---|-------|------|
| ✅ | 0.1 | Initialiser le monorepo (`web/`, `api/`, `mobile/`, `docs/`) | 2026-04-15 |
| ✅ | 0.2 | Setup Next.js (web) | 2026-04-15 |
| ✅ | 0.3 | Setup API Node.js/Express + TypeScript | 2026-04-15 |
| ✅ | 0.4 | Setup PostgreSQL + PostGIS (Supabase) | 2026-04-24 |
| ⬜ | 0.5 | CI/CD (GitHub Actions) | |
| ✅ | 0.6 | Variables d'environnement (`.env.example`) | 2026-04-15 |
| ✅ | 0.7 | Build `web` validé | 2026-04-26 |
| ✅ | 0.8 | Build `api` validé | 2026-04-26 |
| ✅ | 0.9 | Lint `web` validé | 2026-04-26 |
| ✅ | 0.10 | Vérification TypeScript `mobile` validée | 2026-04-26 |
| ✅ | 0.11 | Tests `api` validés (`11/11`) | 2026-04-26 |

---

## 🔄 Phase M — Migration Full Supabase (NOUVEAU)

| Statut | # | Tâche | Date |
|--------|---|-------|------|
| 🔄 | M.1 | Configuration `supabase-js` (Web & Mobile) | 2026-04-26 |
| ⬜ | M.2 | Migration Auth (Express ➔ Supabase Auth) | |
| ⬜ | M.3 | Migration Logiciel (Express ➔ Edge Functions) | |
| ⬜ | M.4 | Sécurisation RLS (Row Level Security) | |
| ⬜ | M.5 | Temps Réel GPS (Socket.io ➔ Realtime Channels) | |

---

## ⚙️ Phase 1 — Backend Core (Semaine 3-6)

### Semaine 3 : Auth & Utilisateurs

| Statut | # | Tâche | Date |
|--------|---|-------|------|
| ✅ | 1.1 | Modèle `users` | 2026-04-15 |
| ✅ | 1.2 | Inscription / Connexion JWT (Old) | 2026-04-15 |
| ✅ | 1.3 | Rôles & permissions | 2026-04-15 |
| ✅ | 1.4 | Middleware auth (Old) | 2026-04-15 |
| ✅ | 1.5 | CRUD profil utilisateur | 2026-04-15 |
| ✅ | 1.6 | Validation téléphone Togo (+228) | 2026-04-15 |
| ✅ | 1.7 | Typage global Express pour `req.user` | 2026-04-26 |
| ✅ | 1.8 | Flux réservation aligné avec les tests | 2026-04-26 |

---

## 📱 Phase 4 — Mobile & Déploiement (Semaine 10-18)

### Application Mobile (Expo)

| Statut | # | Tâche | Date |
|--------|---|-------|------|
| ✅ | 4.1 | Setup Expo + Router + NativeWind | 2026-04-26 |
| ⬜ | 4.2 | Écran Recherche | |
| ⬜ | 4.3 | Écran Résultats | |
| ⬜ | 4.4 | Écran Réservation | |
| ⬜ | 4.5 | Écran Mes Tickets + QR | |
| ⬜ | 4.6 | Écran Suivi GPS | |
| ⬜ | 4.7 | App Chauffeur | |

### Déploiement Production

| Statut | # | Tâche | Date |
|--------|---|-------|------|
| 🔄 | 4.17 | Déploiement Web (Vercel) - Root: web | 2026-04-26 |
| ⬜ | 4.18 | Déploiement API (Edge Functions) | |
| ✅ | 4.19 | Base de données prod (Supabase) | 2026-04-26 |
| ⬜ | 4.22 | Publication mobile (Play Store) | |

---

## ✅ Contrôle Qualité

| Vérification | Statut | Date |
|--------------|--------|------|
| `web` - `npm run build` | ✅ | 2026-04-26 |
| `web` - `npm run lint` | ✅ | 2026-04-26 |
| `api` - `npm run build` | ✅ | 2026-04-26 |
| `api` - `npm test -- --runInBand` | ✅ | 2026-04-26 |
| `mobile` - `npx tsc --noEmit` | ✅ | 2026-04-26 |

---

## 🎯 Points à lancer ensuite

| Priorité | Sujet | Pourquoi |
|----------|-------|-----------|
| 🔴 | CI/CD GitHub Actions | Les vérifications passent en local mais ne sont pas encore automatisées |
| 🔴 | Migration Auth Supabase | Le flux d'authentification reste hybride |
| 🟡 | Documentation `.env` par application | Le démarrage du dépôt reste encore trop implicite |
| 🟡 | Connexion complète des écrans mobile | Le socle Expo est prêt, mais les parcours métier restent à brancher |

---

## Légende

| Icône | Signification |
|-------|--------------|
| ✅ | Terminé |
| 🔄 | En cours |
| ⬜ | À faire |
| ⚠️ | Erreur à résoudre |
| ⏸️ | En pause / Bloqué |
