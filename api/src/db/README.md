# Prisma + PostgreSQL/PostGIS

Voyago utilise Prisma comme couche ORM principale pour les entites relationnelles.

Points importants :

- PostgreSQL reste la base cible.
- PostGIS reste actif pour `stations.location` et `gps_positions.location`.
- Les champs geospatiaux sont representes dans Prisma avec `Unsupported("geography(Point, 4326)")`.
- Pour les requetes spatiales avancees, on utilisera Prisma avec SQL brut cible (`$queryRaw` / `$executeRaw`) ou le client `pg` deja present.

Commandes utiles :

- `npm run prisma:generate`
- `npm run prisma:dbpull`
- `npm run migrate`
- `npm run migrate:rollback`
