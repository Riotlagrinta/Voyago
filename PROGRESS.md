# ✅ Voyago — Suivi des Tâches

> Dernière mise à jour : 2026-04-24
> **Progression globale** : 12/80 tâches complétées (Phase 3 lancée)

---

## 📄 Documentation

| Statut | Tâche | Date |
|--------|-------|------|
| ✅ | Création du `README.md` | 2026-04-15 |
| ✅ | Création de la `ROADMAP.md` | 2026-04-15 |
| ✅ | Création du `PROGRESS.md` (ce fichier) | 2026-04-15 |

---

## 🔧 Phase 0 — Infrastructure & Design (Semaine 1-2)

### Semaine 1 : Setup technique

| Statut | # | Tâche | Date |
|--------|---|-------|------|
| ✅ | 0.1 | Initialiser le monorepo (`web/`, `api/`, `mobile/`, `docs/`) | 2026-04-15 |
| ✅ | 0.2 | Setup Next.js 15 (web) | 2026-04-15 |
| ✅ | 0.3 | Setup API Node.js/Express + TypeScript | 2026-04-15 |
| ✅ | 0.4 | Setup PostgreSQL + PostGIS (Supabase) | 2026-04-24 |
| ⬜ | 0.5 | CI/CD (GitHub Actions) | |
| ✅ | 0.6 | Variables d'environnement (`.env.example`) | 2026-04-15 |

### Semaine 2 : Design System & Maquettes

| Statut | # | Tâche | Date |
|--------|---|-------|------|
| ⬜ | 0.7 | Identité visuelle (logo, palette, typographie) | |
| ⬜ | 0.8 | Design System CSS (tokens) | |
| ⬜ | 0.9 | Maquettes UI principales | |
| ⬜ | 0.10 | Composants UI réutilisables (Button, Input, Card…) | |
| ⬜ | 0.11 | Layouts responsive (Header, Sidebar, Footer) | |

---

## ⚙️ Phase 1 — Backend Core (Semaine 3-6)

### Semaine 3 : Auth & Utilisateurs

| Statut | # | Tâche | Date |
|--------|---|-------|------|
| ✅ | 1.1 | Modèle `users` | 2026-04-15 |
| ✅ | 1.2 | Inscription / Connexion JWT | 2026-04-15 |
| ✅ | 1.3 | Rôles & permissions | 2026-04-15 |
| ✅ | 1.4 | Middleware auth | 2026-04-15 |
| ✅ | 1.5 | CRUD profil utilisateur | 2026-04-15 |
| ✅ | 1.6 | Validation téléphone Togo (+228) | 2026-04-15 |

### Semaine 4 : Compagnies, Vitrine & Flotte

| Statut | # | Tâche | Date |
|--------|---|-------|------|
| ✅ | 1.7 | Modèle `companies` enrichi (slug, bannière, thème…) | 2026-04-15 |
| ✅ | 1.8 | Modèle `company_gallery` | 2026-04-15 |
| ✅ | 1.9 | Modèle `buses` | 2026-04-15 |
| ✅ | 1.10 | Modèle `drivers` | 2026-04-15 |
| ✅ | 1.11 | CRUD Compagnies | 2026-04-15 |
| ✅ | 1.12 | API Vitrine Compagnie (upload logo/bannière/galerie) | 2026-04-15 |
| ✅ | 1.13 | API Page Publique `GET /companies/:slug` | 2026-04-15 |
| ✅ | 1.14 | CRUD Bus | 2026-04-15 |
| ✅ | 1.15 | CRUD Chauffeurs | 2026-04-15 |

### Semaine 5 : Trajets & Horaires

| Statut | # | Tâche | Date |
|--------|---|-------|------|
| ✅ | 1.16 | Modèle `stations` (PostGIS) | 2026-04-17 |
| ✅ | 1.17 | Modèle `routes` | 2026-04-17 |
| ✅ | 1.18 | Modèle `schedules` | 2026-04-15 |
| ✅ | 1.19 | Recherche de trajets (filtres) | 2026-04-15 |
| ✅ | 1.20 | Requêtes géo-spatiales PostGIS | 2026-04-15 |
| ✅ | 1.21 | Escales intermédiaires | 2026-04-15 |

### Semaine 6 : Réservation & Sièges

| Statut | # | Tâche | Date |
|--------|---|-------|------|
| ✅ | 1.22 | Modèle `bookings` | 2026-04-15 |
| ✅ | 1.23 | Modèle `seats` | 2026-04-15 |
| ✅ | 1.24 | Logique de réservation (verrouillage 10min) | 2026-04-15 |
| ⬜ | 1.25 | Annulation & remboursement | |
| ✅ | 1.26 | Historique réservations | 2026-04-15 |

---

## 🖥️ Phase 2 — Frontend Web (Semaine 5-10)

### Pages Publiques

| Statut | # | Tâche | Date |
|--------|---|-------|------|
| ✅ | 2.1 | Page d'accueil | 2026-04-17 |
| ✅ | 2.2 | Page de recherche | 2026-04-17 |
| ✅ | 2.3 | Page Login / Inscription | 2026-04-17 |
| ✅ | 2.4 | Page Catalogue Compagnies `/compagnies` | 2026-04-17 |
| ✅ | 2.5 | 🏪 Page Vitrine Compagnie `/compagnies/[slug]` | 2026-04-17 |
| ⬜ | 2.6 | Page "À propos" | |
| ⬜ | 2.7 | Page FAQ / Contact | |
| ✅ | 2.8 | SEO & Meta tags dynamiques | 2026-04-17 |

### Recherche & Réservation

| Statut | # | Tâche | Date |
|--------|---|-------|------|
| ✅ | 2.9 | Résultats de recherche | 2026-04-17 |
| ✅ | 2.10 | Page détail trajet | 2026-04-17 |
| ✅ | 2.11 | Plan de sièges interactif | 2026-04-17 |
| ✅ | 2.12 | Tunnel de réservation | 2026-04-17 |
| ✅ | 2.13 | Page "Mes réservations" | 2026-04-17 |
| ✅ | 2.14 | E-Ticket PDF + QR | 2026-04-17 |

### Dashboard Compagnie

| Statut | # | Tâche | Date |
|--------|---|-------|------|
| ✅ | 2.15 | Vue d'ensemble KPIs | 2026-04-17 |
| ✅ | 2.16 | 🎨 Éditeur de Vitrine (prévisualisation live) | 2026-04-17 |
| ✅ | 2.17 | Gestion des bus | 2026-04-17 |
| ✅ | 2.18 | Gestion des trajets | 2026-04-17 |
| ✅ | 2.19 | Gestion des chauffeurs | 2026-04-17 |
| ⬜ | 2.20 | Rapport des ventes | |
| ✅ | 2.21 | Paramètres compagnie | 2026-04-17 |

### Panel Super Admin

| Statut | # | Tâche | Date |
|--------|---|-------|------|
| ✅ | 2.22 | Dashboard global | 2026-04-17 |
| ✅ | 2.23 | Gestion des compagnies | 2026-04-17 |
| ⬜ | 2.24 | Gestion des utilisateurs | |
| ⬜ | 2.25 | Configuration commissions | |
| ⬜ | 2.26 | Modération & litiges | |

---

## 💳 Phase 3 — Paiements & Temps Réel (Semaine 8-12)

### Paiements Mobile Money

| Statut | # | Tâche | Date |
|--------|---|-------|------|
| ✅ | 3.1 | Architecture paiement (Provider/Factory) | 2026-04-24 |
| ✅ | 3.2 | Simulation des paiements (Mode MVP) | 2026-04-24 |
| ✅ | 3.3 | Webhook de confirmation (Simulé) | 2026-04-24 |
| ✅ | 3.4 | Modèle & Service `payments` | 2026-04-24 |
| ✅ | 3.5 | Page de paiement (Frontend) | 2026-04-24 |
| âœ… | 3.6 | Gestion des Ã©checs & remboursements | 2026-04-26 |

### E-Ticket & QR Code

| Statut | # | Tâche | Date |
|--------|---|-------|------|
| ✅ | 3.7 | Génération QR Code (Backend) | 2026-04-24 |
| ✅ | 3.8 | Template E-Ticket PDF | 2026-04-24 |
| ✅ | 3.9 | Scanner QR (chauffeur) | 2026-04-24 |
| ✅ | 3.10 | Envoi SMS/Email (Resend + Simu) | 2026-04-24 |

### Suivi GPS & Notifications

| Statut | # | Tâche | Date |
|--------|---|-------|------|
| ✅ | 3.11 | Setup Socket.io | 2026-04-24 |
| ✅ | 3.12 | Émission position GPS (Simulateur) | 2026-04-24 |
| ✅ | 3.13 | Carte de suivi Leaflet (Temps réel) | 2026-04-24 |
| âœ… | 3.14 | Fallback polling (faible connexion) | 2026-04-26 |
| ⬜ | 3.15 | Notifications push | |
| ✅ | 3.16 | Historique des positions (Archivage DB) | 2026-04-24 |

---

## 📱 Phase 4 — Mobile & Déploiement (Semaine 10-18)

### Application Mobile (Expo)

| Statut | # | Tâche | Date |
|--------|---|-------|------|
| ⬜ | 4.1 | Setup Expo + Router | |
| ⬜ | 4.2 | Écran Recherche | |
| ⬜ | 4.3 | Écran Résultats | |
| ⬜ | 4.4 | Écran Réservation | |
| ⬜ | 4.5 | Écran Mes Tickets + QR | |
| ⬜ | 4.6 | Écran Suivi GPS | |
| ⬜ | 4.7 | Notifications push | |
| ⬜ | 4.8 | Mode offline | |
| ⬜ | 4.9 | App Chauffeur | |

### Tests & Optimisations

| Statut | # | Tâche | Date |
|--------|---|-------|------|
| ✅ | 4.10 | Tests unitaires API (Jest) | 2026-04-15 |
| ⬜ | 4.11 | Tests E2E (Playwright) | |
| ⬜ | 4.12 | Tests de charge | |
| ⬜ | 4.13 | Audit sécurité | |
| ⬜ | 4.14 | Optimisation performance | |
| ⬜ | 4.15 | PWA setup | |
| ⬜ | 4.16 | Accessibilité (a11y) | |

### Déploiement Production

| Statut | # | Tâche | Date |
|--------|---|-------|------|
| ⬜ | 4.17 | Déploiement Web (Vercel) | |
| ⬜ | 4.18 | Déploiement API (Render) | |
| â¬œ | 4.19 | Base de donnÃ©es prod (Supabase) | 2026-04-26 |
| ⬜ | 4.20 | Redis prod (Upstash) | |
| ⬜ | 4.21 | Monitoring (Sentry + Analytics) | |
| ⬜ | 4.22 | Publication mobile (Play Store) | |
| ⬜ | 4.23 | Onboarding pilote (1-3 compagnies) | |

---

## Légende

| Icône | Signification |
|-------|--------------|
| ✅ | Terminé |
| 🔄 | En cours |
| ⬜ | À faire |
| ⏸️ | En pause / Bloqué |

| ⏸️ | En pause / Bloqué |
