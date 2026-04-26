# Changelog

Toutes les évolutions notables du projet Voyago seront documentées ici.

Le format s'inspire de `Keep a Changelog` et le versionnage suivra une logique sémantique quand le projet commencera à publier des releases.

## [Unreleased]

### Added

- `CONTRIBUTING.md` pour cadrer les contributions au monorepo
- `docs/ARCHITECTURE.md` pour documenter la structure applicative
- typage global Express pour `req.user` dans l'API

### Changed

- relecture orthographique et correction des problèmes d'encodage sur l'application et la documentation active
- réalignement du middleware d'authentification et du flux de réservation avec les tests API
- stabilisation du rendu 3D et nettoyage des erreurs de lint bloquantes côté web
- mise à jour de `README.md`, `PROGRESS.md` et `ROADMAP.md` pour refléter l'état réel du dépôt

### Verified

- `web`: `npm run lint`
- `web`: `npm run build`
- `api`: `npm run build`
- `api`: `npm test -- --runInBand`
- `mobile`: `npx tsc --noEmit`
