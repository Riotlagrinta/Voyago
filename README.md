<p align="center">
  <img src="docs/assets/voyago-logo.png" alt="Voyago Logo" width="200" />
</p>

<h1 align="center">🚍 Voyago</h1>

<p align="center">
  <strong>La plateforme digitale de transport routier au Togo</strong>
</p>

<p align="center">
  Réservation · Paiement Mobile · Suivi GPS en temps réel · Gestion de flotte
</p>

<p align="center">
  <a href="#fonctionnalités">Fonctionnalités</a> •
  <a href="#état-actuel">État Actuel</a> •
  <a href="#priorités-immédiates">Priorités</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#installation">Installation</a> •
  <a href="#stack-technique">Stack Technique</a> •
  <a href="#licence">Licence</a>
</p>

---

## 📋 À propos

**Voyago** est une solution complète de digitalisation du transport routier au Togo. Elle connecte les **passagers** aux **compagnies de transport** via une plateforme moderne, fiable et adaptée au contexte local.

L'application permet la **réservation de tickets**, le **paiement en ligne** (T-Money, Flooz), le **suivi des bus en temps réel** et l'**optimisation des opérations** pour les transporteurs.

> **Mission** : Moderniser le secteur du transport routier togolais pour améliorer l'expérience des voyageurs et augmenter les revenus des transporteurs.

---

## 📌 État Actuel

- Build `web` validé
- Build `api` validé
- Vérification TypeScript `mobile` validée
- Tests `api` validés : `11/11`
- Lint `web` validé
- Dépôt synchronisé sur `main`

### Dernières mises à jour

- Correction des fautes d'orthographe, libellés et problèmes d'encodage sur l'application et la documentation active
- Ajout du typage global Express pour `req.user`
- Réalignement du middleware d'authentification et du flux de réservation avec les tests
- Stabilisation du rendu 3D et suppression des erreurs de lint bloquantes

---

## 🎯 Priorités Immédiates

- Brancher les interfaces `web` et `mobile` sur les vraies données métier restantes
- Finaliser la migration Supabase côté authentification, données et temps réel
- Mettre en place la CI/CD pour automatiser `build`, `lint` et `tests`
- Documenter précisément les variables d'environnement par application

---

## 🎯 Problèmes résolus

| # | Problème actuel | Solution Voyago |
|---|-----------------|-----------------|
| 1 | Réservations manuelles, files d'attente | Réservation en ligne instantanée |
| 2 | Manque de visibilité sur les horaires | Tableau des départs en temps réel |
| 3 | Achat de tickets difficile à distance | Paiement mobile money (T-Money, Flooz) |
| 4 | Mauvaise gestion des places | Plan de sièges interactif |
| 5 | Faible traçabilité des ventes | Dashboard analytique complet |
| 6 | Manque d'outils de pilotage | Panel de gestion pour compagnies |
| 7 | Manque de confiance des clients | Avis vérifiés, suivi GPS, notifications |

---

## ✨ Fonctionnalités

### 🧑‍💼 Côté Passager (B2C)

- 🔍 **Recherche de trajets** — Par ville de départ/arrivée, date et heure
- 🪑 **Sélection de siège** — Plan de bus interactif avec disponibilité en temps réel
- 💳 **Paiement sécurisé** — T-Money, Flooz, et paiement à la livraison
- 🎫 **E-Ticket / QR Code** — Ticket numérique avec scan à l'embarquement
- 📍 **Suivi GPS en temps réel** — Position du bus sur une carte interactive
- 🔔 **Notifications** — Alertes départ, retard, annulation
- ⭐ **Avis & évaluations** — Notation des trajets et compagnies
- 📜 **Historique** — Consultation de tous les voyages passés

### 🏢 Côté Compagnie (B2B)

- 🚌 **Gestion de flotte** — Ajout/modification des bus, caractéristiques, capacité
- 👨‍✈️ **Gestion des chauffeurs** — Profils, affectations, planning
- 🗓️ **Planning des trajets** — Création et gestion des itinéraires et horaires
- 📊 **Dashboard analytique** — Revenus, taux de remplissage, performances
- 💰 **Suivi des ventes** — Traçabilité complète des transactions
- 📋 **Rapports** — Export des données en PDF/Excel
- 🔧 **Maintenance** — Suivi de l'état technique des véhicules

### 🛡️ Côté Admin (Super Admin)

- 🏗️ **Gestion des compagnies** — Validation, suspension, certification
- 📈 **Statistiques globales** — Vision d'ensemble du réseau
- 💸 **Gestion des commissions** — Configuration des taux (2% à 5%)
- 🔐 **Modération** — Gestion des litiges et réclamations
- 📢 **Communication** — Notifications push et annonces

---

## 🏗️ Architecture

```
voyago/
├── web/                    # Frontend Next.js (Application web)
│   ├── app/                # App Router (Pages & Layouts)
│   ├── components/         # Composants réutilisables
│   ├── lib/                # Utilitaires, hooks, helpers
│   ├── public/             # Assets statiques
│   └── styles/             # Styles globaux
│
├── api/                    # Backend Node.js / TypeScript
│   ├── src/
│   │   ├── routes/         # Routes API REST
│   │   ├── controllers/    # Logique métier
│   │   ├── middlewares/    # Auth, validation, rate-limit
│   │   ├── models/         # Modèles de données
│   │   ├── services/       # Services (paiement, GPS, notifications)
│   │   └── utils/          # Helpers & constantes
│   └── tests/              # Tests unitaires & intégration
│
├── mobile/                 # Application mobile (Expo / React Native)
│   ├── app/                # Expo Router (Screens)
│   ├── components/         # Composants mobiles
│   └── assets/             # Images, fonts, icônes
│
├── docs/                   # Documentation
│   ├── assets/             # Logo, captures d'écran
│   ├── api/                # Documentation API (Swagger/OpenAPI)
│   └── guides/             # Guides d'utilisation
│
└── README.md
```

---

## 🛠️ Stack Technique

### Frontend (Web)
| Technologie | Rôle |
|-------------|------|
| **Next.js 16** | Framework React (App Router, SSR) |
| **TypeScript** | Typage statique |
| **Tailwind CSS** | Styling utilitaire |
| **Framer Motion** | Animations & transitions |
| **Leaflet / Mapbox** | Carte interactive & suivi GPS |
| **Zustand** | Gestion d'état |
| **Lucide React** | Icônes |

### Frontend (Mobile)
| Technologie | Rôle |
|-------------|------|
| **Expo / React Native** | Application iOS & Android |
| **Expo Router** | Navigation |
| **React Native Maps** | Carte & suivi GPS |
| **Expo Notifications** | Notifications push |

### Backend (API)
| Technologie | Rôle |
|-------------|------|
| **Node.js** | Runtime serveur |
| **TypeScript** | Typage statique |
| **Express.js** | Framework HTTP |
| **Zod** | Validation des données |
| **JWT** | Authentification |
| **Helmet** | Sécurité HTTP |
| **Socket.io** | Communication temps réel (GPS) |

### Base de données & Services
| Technologie | Rôle |
|-------------|------|
| **PostgreSQL** | Base de données relationnelle |
| **PostGIS** | Requêtes géo-spatiales |
| **Supabase** | BaaS (Auth, Storage, Realtime) |
| **Redis** | Cache & sessions |

### Paiements
| Technologie | Rôle |
|-------------|------|
| **T-Money API** | Paiement mobile Togocom |
| **Flooz API** | Paiement mobile Moov |
| **GeniusPay** | Gateway de paiement unifié |

---

## 💰 Modèle Économique

| Source de revenus | Description |
|-------------------|-------------|
| 🎟️ **Commission par ticket** | 2% à 5% prélevés sur chaque transaction |
| 📦 **Abonnement mensuel** | Plans pour les compagnies (Basic, Pro, Enterprise) |
| ⭐ **Modules premium** | Fonctionnalités avancées (Analytics, API, Multi-agences) |
| 📢 **Publicité** | Espaces publicitaires ciblés dans l'app |
| 🔧 **Services additionnels** | Intégration sur mesure, support dédié |

---

## 🚀 Stratégie de Déploiement

```mermaid
graph LR
    A[Phase 1 - MVP] --> B[Phase 2 - Croissance]
    B --> C[Phase 3 - Expansion]

    A --- A1[1-3 compagnies pilotes]
    A --- A2[Axe Lomé-Kara]
    A --- A3[Fonctions de base]

    B --- B1[10+ compagnies]
    B --- B2[Couverture nationale]
    B --- B3[Suivi GPS + Analytics]

    C --- C1[Sous-région UEMOA]
    C --- C2[Ghana, Bénin, Burkina]
    C --- C3[API ouverte]
```

### Phase 1 — MVP (Mois 1-3)
- Pilote avec 1 à 3 compagnies de transport
- Axe principal : **Lomé ↔ Kara**
- Réservation + Paiement mobile + E-ticket

### Phase 2 — Croissance (Mois 4-8)
- Extension à 10+ compagnies
- Couverture nationale complète
- Ajout du suivi GPS temps réel et dashboard analytique

### Phase 3 — Expansion (Mois 9-18)
- Expansion sous-régionale (Ghana, Bénin, Burkina Faso)
- API ouverte pour intégrations tierces
- Marketplace de services de transport

---

## 📦 Installation

### Prérequis

- **Node.js** >= 18.x
- **npm** >= 9.x ou **pnpm** >= 8.x
- **PostgreSQL** >= 15 avec PostGIS
- **Git**

### Monorepo

- `web/` : application Next.js
- `api/` : API Express + TypeScript
- `mobile/` : application Expo / React Native
- `docs/` : documentation projet

### Vérifications rapides

```bash
# Web
cd web && npm run lint && npm run build

# API
cd api && npm run build && npm test -- --runInBand

# Mobile
cd mobile && npx tsc --noEmit
```

### Démarrage rapide

```bash
# 1. Cloner le dépôt
git clone https://github.com/votre-org/voyago.git
cd voyago

# 2. Installer les dépendances
# Frontend web
cd web && npm install

# API Backend
cd ../api && npm install

# Application mobile
cd ../mobile && npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Remplir les variables dans .env

# 4. Lancer la base de données
# Assurez-vous que PostgreSQL est démarré avec PostGIS activé

# 5. Lancer les migrations
cd api && npm run migrate

# 6. Démarrer en développement
# Terminal 1 — API
cd api && npm run dev

# Terminal 2 — Web
cd web && npm run dev

# Terminal 3 — Mobile (optionnel)
cd mobile && npx expo start
```

### Variables d'environnement

```env
# Base de données
DATABASE_URL=postgresql://user:password@localhost:5432/voyago
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...

# Authentification
JWT_SECRET=votre-secret-jwt-ultra-securise
JWT_EXPIRES_IN=7d

# Paiements
GENIUSPAY_API_KEY=gp_live_xxx
TMONEY_MERCHANT_ID=xxx
FLOOZ_MERCHANT_ID=xxx

# Temps réel
REDIS_URL=redis://localhost:6379

# Géolocalisation
MAPBOX_ACCESS_TOKEN=pk.xxx
```

---

## 👥 Équipe

| Rôle | Responsabilité |
|------|---------------|
| 🎯 Chef de projet | Coordination, planning, livrables |
| ⚙️ Développeur Backend | API, base de données, intégrations |
| 🎨 Développeur Frontend/Mobile | Interfaces web et mobile |
| 🖌️ Designer UI/UX | Maquettes, prototypes, identité visuelle |
| 📣 Commercial | Partenariats, acquisition compagnies |
| 🤝 Support Client | Assistance utilisateurs, feedback |

---

## 🤝 Contribution

Les contributions sont possibles, mais le dépôt ne contient pas encore de guide dédié `CONTRIBUTING.md`. En attendant, travaille sur une branche courte, garde des commits lisibles et valide les commandes de vérification avant ouverture d'une PR.

1. Fork le projet
2. Crée ta branche (`git checkout -b feature/ma-fonctionnalite`)
3. Commit tes changements (`git commit -m 'feat: ajout de ma fonctionnalité'`)
4. Push sur la branche (`git push origin feature/ma-fonctionnalite`)
5. Ouvre une Pull Request

---

## 📊 Avantage Concurrentiel

| Critère | Voyago | Solutions existantes |
|---------|--------|---------------------|
| Paiement Mobile Money | ✅ T-Money + Flooz natif | ❌ Rarement intégré |
| Mode hors connexion | ✅ PWA + cache offline | ❌ Non disponible |
| Suivi GPS temps réel | ✅ Socket.io + Leaflet | ❌ Inexistant |
| Adapté au contexte togolais | ✅ Conçu localement | ❌ Solutions importées |
| B2B + B2C unifié | ✅ Plateforme unique | ❌ Outils séparés |
| Multi-plateforme | ✅ Web + Mobile | ⚠️ Souvent web uniquement |

---

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 📬 Contact

- Les canaux publics de contact ne sont pas encore documentés dans le dépôt.
- Ajouter ici l'email projet, le site vitrine et les liens sociaux lorsqu'ils seront réellement actifs.

---

<p align="center">
  Fait avec ❤️ au Togo 🇹🇬 par <strong>Kelvix</strong>
</p>

<p align="center">
  <em>Voyager n'a jamais été aussi simple.</em>
</p>
