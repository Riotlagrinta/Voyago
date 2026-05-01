# ✅ Voyago — Suivi des Tâches

> Dernière mise à jour : 2026-05-01
> **Progression globale** : 51/85 tâches complétées

---

## 📄 Documentation

| Statut | Tâche | Date |
|--------|-------|------|
| ✅ | Création du `README.md` | 2026-04-15 |
| ✅ | Création de la `ROADMAP.md` | 2026-04-15 |
| ✅ | Création du `PROGRESS.md` (ce fichier) | 2026-04-15 |
| ✅ | Stratégie Migration Supabase (`docs/SUPABASE_MIGRATION.md`) | 2026-04-26 |
| ✅ | Configuration Resend pour emails transactionnels | 2026-04-26 |

---

## 🛠️ Phase 0 — Infrastructure & Design

| Statut | # | Tâche | Date |
|--------|---|-------|------|
| ✅ | 0.1 | Initialiser le monorepo (`web/`, `api/`, `mobile/`, `docs/`) | 2026-04-15 |
| ✅ | 0.2 | Setup Next.js (web) | 2026-04-15 |
| ✅ | 0.3 | Setup API Node.js/Express + TypeScript | 2026-04-15 |
| ✅ | 0.4 | Setup PostgreSQL + PostGIS (Supabase) | 2026-04-24 |
| ✅ | 0.5 | CI/CD (GitHub Actions) — 3 jobs séparés web/api/mobile | 2026-05-01 |
| ✅ | 0.6 | Variables d'environnement (`.env.example`) | 2026-04-15 |
| ✅ | 0.7 | Build `web` validé | 2026-05-01 |
| ✅ | 0.8 | Build `api` validé | 2026-05-01 |
| ✅ | 0.9 | Lint `web` validé | 2026-04-26 |
| ✅ | 0.10 | Vérification TypeScript `mobile` validée | 2026-05-01 |
| ✅ | 0.11 | Tests `api` validés | 2026-04-26 |

---

## ⚙️ Phase 1 — Backend Core

| Statut | # | Tâche | Date |
|--------|---|-------|------|
| ✅ | 1.1 | Modèle `users` | 2026-04-15 |
| ✅ | 1.2 | Inscription / Connexion JWT | 2026-04-15 |
| ✅ | 1.3 | Rôles & permissions | 2026-04-15 |
| ✅ | 1.4 | Middleware auth (401 sans token) | 2026-05-01 |
| ✅ | 1.5 | CRUD profil utilisateur | 2026-04-15 |
| ✅ | 1.6 | Validation téléphone Togo (+228) | 2026-04-15 |
| ✅ | 1.7 | Typage global Express pour `req.user` | 2026-04-26 |
| ✅ | 1.8 | Flux réservation aligné avec les tests | 2026-04-26 |
| ✅ | 1.9 | Schedule CRUD complet (create/update/delete) | 2026-05-01 |
| ✅ | 1.10 | `getScheduleSeats` — données réelles depuis la BDD | 2026-05-01 |
| ✅ | 1.11 | `createBooking` — transaction Prisma + décrémentation places | 2026-05-01 |
| ✅ | 1.12 | `cancelBooking` — annulation réelle + réincrémentation places | 2026-05-01 |
| ✅ | 1.13 | `validateQrCode` — vérification DB + marquage completed | 2026-05-01 |
| ✅ | 1.14 | `downloadTicketPDF` — données réelles depuis la DB | 2026-05-01 |
| ✅ | 1.15 | Filtrage schedules par ville et date | 2026-05-01 |
| ✅ | 1.16 | CORS multi-origines (*.vercel.app + localhost) | 2026-05-01 |
| ✅ | 1.17 | Rate limiting + Helmet activés en production | 2026-05-01 |
| ✅ | 1.18 | Fix dotenv chargé avant Prisma (résout ECONNREFUSED) | 2026-05-01 |

---

## 🌐 Phase 2 — Frontend Web

| Statut | # | Tâche | Date |
|--------|---|-------|------|
| ✅ | 2.1 | Page d'accueil (Hero + recherche + features) | 2026-04-26 |
| ✅ | 2.2 | Page Recherche / Résultats (`/search`) — filtres + tri fonctionnels | 2026-05-01 |
| ✅ | 2.3 | Page Sélection sièges (`/booking/[scheduleId]`) — grille par rangée | 2026-05-01 |
| ✅ | 2.4 | Page Paiement (`/booking/payment/[id]`) | 2026-05-01 |
| ✅ | 2.5 | Page Confirmation (`/booking/confirmation/[id]`) + QR code + PDF | 2026-05-01 |
| ✅ | 2.6 | Page Mes Réservations (`/bookings`) | 2026-05-01 |
| ✅ | 2.7 | Page Profil utilisateur (`/profile`) | 2026-04-26 |
| ✅ | 2.8 | Page Compagnies (`/compagnies`) | 2026-04-26 |
| ✅ | 2.9 | Page Détail compagnie (`/compagnies/[slug]`) | 2026-04-26 |
| ✅ | 2.10 | Page Suivi GPS temps réel (`/tracking/[scheduleId]`) | 2026-04-26 |
| ✅ | 2.11 | Dashboard compagnie (stats, bus, chauffeurs, routes, horaires) | 2026-04-26 |
| ✅ | 2.12 | Dashboard admin (`/admin`) | 2026-04-26 |
| ✅ | 2.13 | Login / Register | 2026-04-15 |
| ✅ | 2.14 | Composant Bus3D amélioré (PBR, VOYAGO branding, sol réfléchissant) | 2026-05-01 |
| ✅ | 2.15 | Composant Ticket3D holographique (shader custom, QR réaliste) | 2026-05-01 |
| ✅ | 2.16 | Composant RouteVisualization3D (bus animé sur courbe de Bézier) | 2026-05-01 |
| ✅ | 2.17 | `useAuthStore` — suppression du guest super_admin par défaut | 2026-05-01 |

---

## 📱 Phase 3 — Mobile (Expo)

| Statut | # | Tâche | Date |
|--------|---|-------|------|
| ✅ | 3.1 | Setup Expo + Router + NativeWind | 2026-04-26 |
| ✅ | 3.2 | Auth store (Zustand + SecureStore) + lib API | 2026-05-01 |
| ✅ | 3.3 | Écran Accueil (recherche rapide, features, stats) | 2026-05-01 |
| ✅ | 3.4 | Onglet Rechercher + page Résultats | 2026-05-01 |
| ✅ | 3.5 | Page Booking (sièges + passagers, 2 étapes) | 2026-05-01 |
| ✅ | 3.6 | Page Confirmation + récapitulatif ticket | 2026-05-01 |
| ✅ | 3.7 | Onglet Mes billets (filtres à venir/passés) | 2026-05-01 |
| ✅ | 3.8 | Onglet Profil + déconnexion | 2026-05-01 |
| ✅ | 3.9 | Login + Register mobile | 2026-05-01 |
| ⬜ | 3.10 | Tests sur device réel (Android/iOS) | |
| ⬜ | 3.11 | Écran Suivi GPS mobile (`/tracking/[scheduleId]`) | |

---

## 🚀 Phase 4 — Déploiement

| Statut | # | Tâche | Date |
|--------|---|-------|------|
| ✅ | 4.1 | API déployée sur Render | 2026-04-26 |
| ✅ | 4.2 | Base de données prod (Supabase) | 2026-04-26 |
| ✅ | 4.3 | `render.yaml` corrigé (region, healthCheck, envVars) | 2026-05-01 |
| ✅ | 4.4 | `vercel.json` corrigé (headers sécurité) | 2026-05-01 |
| 🔄 | 4.5 | Déploiement Web (Vercel) — en cours | 2026-05-01 |
| ⬜ | 4.6 | Déploiement API (Edge Functions / Render prod stable) | |
| ⬜ | 4.7 | Publication mobile (Play Store) | |

---

## 🔴 À faire — Critique (bloque les utilisateurs)

| Priorité | # | Tâche | Détail |
|----------|---|-------|--------|
| 🔴 | C.1 | **Seed base de données** | 1 user, 1 company, 2 trajets en base. Un visiteur voit une liste vide. Ajouter des compagnies, stations et trajets réels du Togo |
| 🔴 | C.2 | **Réactiver l'authentification** | Auth désactivée temporairement. Remettre les guards sur les routes protégées une fois les données en place |
| 🔴 | C.3 | **Fixer JWT_SECRET sur Render** | Actuellement `generateValue: true` — secret regénéré à chaque redéploiement, tous les tokens existants deviennent invalides. Mettre une valeur fixe dans les variables Render |
| 🔴 | C.4 | **Intégration paiement réel** | `PaymentService` utilise un `MockProvider`. Intégrer CinetPay, Notchpay ou un provider Mobile Money Togo réel |

---

## 🟡 À faire — Important (expérience incomplète)

| Priorité | # | Tâche | Détail |
|----------|---|-------|--------|
| 🟡 | I.1 | **Redirect après login** | `/login?redirect=/bookings` existe mais après connexion l'utilisateur n'est pas renvoyé vers la page d'origine |
| 🟡 | I.2 | **Dashboard — données réelles** | Les graphiques du dashboard utilisent des données hardcodées, pas la vraie DB |
| 🟡 | I.3 | **Dashboard — boutons Modifier/Supprimer** | Dans buses, drivers, routes — les boutons existent mais n'ont pas de handlers |
| 🟡 | I.4 | **Simulateur GPS accessible** | `DriverSimulator.tsx` existe mais n'est pas facilement accessible pour tester le tracking en temps réel |
| 🟡 | I.5 | **Clé Resend de production** | `RESEND_API_KEY` est une clé de test — les emails de confirmation ne sont pas envoyés en prod |

---

## 🟢 À faire — Finition (avant prod publique)

| Priorité | # | Tâche | Détail |
|----------|---|-------|--------|
| 🟢 | F.1 | **SEO — metadata** | Aucune balise `<title>` ni `<description>` dans les pages Next.js |
| 🟢 | F.2 | **Page 404 personnalisée** | Actuellement la 404 par défaut de Next.js |
| 🟢 | F.3 | **Pages légales** | Les liens `/legal`, `/confidentialite`, `/cookies` existent dans le footer mais les pages sont vides |
| 🟢 | F.4 | **Tests mobile sur device réel** | L'app Expo est écrite mais jamais testée sur Android/iOS |
| 🟢 | F.5 | **Écran GPS mobile** | Page `/tracking/[scheduleId]` non portée sur mobile |

---

## ✅ Contrôle Qualité

| Vérification | Statut | Date |
|--------------|--------|------|
| `web` — `npm run build` | ✅ | 2026-05-01 |
| `web` — `npm run lint` | ✅ | 2026-04-26 |
| `api` — `npm run build` | ✅ | 2026-05-01 |
| `api` — `npm test` | ✅ | 2026-04-26 |
| `mobile` — `npx tsc --noEmit` | ✅ | 2026-05-01 |
| API prod (Render) — `/health` | ✅ | 2026-05-01 |
| Web prod (Vercel) | 🔄 | 2026-05-01 |

---

## Légende

| Icône | Signification |
|-------|--------------|
| ✅ | Terminé |
| 🔄 | En cours |
| ⬜ | À faire |
| 🔴 | Critique |
| 🟡 | Important |
| 🟢 | Finition |
