# Contribuer à Voyago

Merci de contribuer à Voyago. Le dépôt est un monorepo applicatif avec trois surfaces principales :

- `web/` : application Next.js
- `api/` : API Express + TypeScript
- `mobile/` : application Expo / React Native

## Pré-requis

- `Node.js >= 18`
- `npm >= 9`
- PostgreSQL disponible localement si tu travailles sur l'API

## Démarrage

1. Fork le dépôt puis clone ta copie.
2. Installe les dépendances dans chaque application concernée.
3. Copie les variables nécessaires depuis `.env.example`.
4. Lance uniquement la ou les applications sur lesquelles tu travailles.

Exemples :

```bash
cd web && npm install
cd api && npm install
cd mobile && npm install
```

## Règles de contribution

- Travaille sur une branche courte et ciblée.
- Garde des commits lisibles avec des messages de type `feat: ...`, `fix: ...`, `docs: ...`.
- Évite de mélanger une refonte, un correctif et de la documentation dans la même PR.
- N'introduis pas de dépendance ou de changement d'architecture sans justification claire.
- Si le dépôt contient déjà des changements non liés à ton sujet, ne les réécris pas.

## Vérifications avant PR

Lance les commandes utiles selon le périmètre touché :

```bash
# Web
cd web && npm run lint && npm run build

# API
cd api && npm run build && npm test -- --runInBand

# Mobile
cd mobile && npx tsc --noEmit
```

## Attentes par zone

### Web

- Préserver les conventions Next.js App Router déjà en place.
- Vérifier le rendu desktop et mobile pour tout changement UI visible.
- Éviter les composants ou styles inutilisés.

### API

- Préserver le typage TypeScript.
- Ajouter ou mettre à jour les tests si le comportement métier change.
- Documenter toute nouvelle variable d'environnement ou dépendance de service.

### Mobile

- Garder les écrans cohérents avec les parcours métier web quand c'est pertinent.
- Vérifier au minimum le typage TypeScript avant PR.

## Pull Request

Une bonne PR doit contenir :

- un objectif clair
- les zones du monorepo impactées
- les vérifications exécutées
- les limites connues ou travaux laissés pour plus tard

## Documentation liée

- [README.md](README.md)
- [PROGRESS.md](PROGRESS.md)
- [ROADMAP.md](ROADMAP.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/SUPABASE_MIGRATION.md](docs/SUPABASE_MIGRATION.md)
