# Architecture Voyago

## Vue d'ensemble

Voyago est organisé comme un monorepo avec trois applications principales et une documentation projet.

```text
voyago/
├── web/      # Frontend Next.js
├── api/      # Backend Express + TypeScript
├── mobile/   # Application Expo / React Native
└── docs/     # Documentation projet
```

## Objectif de chaque surface

### `web/`

Le frontend web porte :

- les parcours publics de découverte et de réservation
- les interfaces de gestion compagnie
- les interfaces d'administration

Structure observée :

- `src/app/` : pages App Router
- `src/components/` : composants UI et composants métier
- `src/hooks/` : hooks réutilisables
- `src/lib/` : helpers et utilitaires
- `src/store/` : état client

Technos principales :

- Next.js 16
- React 19
- Tailwind CSS
- Framer Motion
- Recharts
- Leaflet / MapLibre
- Zustand

### `api/`

L'API centralise la logique métier serveur, les middlewares, les intégrations et les tests.

Structure observée :

- `src/controllers/` : orchestration des cas d'usage HTTP
- `src/routes/` : définition des endpoints Express
- `src/middlewares/` : auth, autorisation, sécurité, validation
- `src/services/` : services métier et intégrations externes
- `src/db/` : scripts et accès liés à la base
- `src/lib/` : utilitaires serveur
- `src/types/` : extensions de types partagés côté API
- `src/test/` : tests

Technos principales :

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- JWT
- Socket.io
- Jest / Supertest

### `mobile/`

L'application mobile prépare les parcours natifs autour d'Expo Router.

Structure observée :

- `app/` : écrans et navigation Expo Router
- `components/` : composants réutilisables
- `assets/` : ressources statiques

Technos principales :

- Expo
- React Native
- Expo Router
- React Native Maps
- Zustand

## Flux applicatif simplifié

```text
Passager / Compagnie / Admin
        |
        v
      web / mobile
        |
        v
         API
        |
        v
PostgreSQL / services tiers
```

Services tiers ou cibles documentées dans le dépôt :

- Supabase
- T-Money
- Flooz
- GeniusPay
- Redis

## État actuel de l'architecture

Le dépôt dispose d'un socle technique cohérent et vérifié localement, mais certains parcours restent encore en transition :

- une partie de l'authentification et de la donnée est en migration vers Supabase
- le mobile est présent comme base fonctionnelle, pas encore comme produit complet
- la CI/CD n'est pas encore en place

## Vérifications connues

À la date du dernier contrôle :

- `web` : lint et build validés
- `api` : build et tests validés
- `mobile` : vérification TypeScript validée

## Documents liés

- [README.md](../README.md)
- [PROGRESS.md](../PROGRESS.md)
- [ROADMAP.md](../ROADMAP.md)
- [SUPABASE_MIGRATION.md](./SUPABASE_MIGRATION.md)
