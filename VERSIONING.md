# Versions

Versions `MAJEUR.MINEUR.CORRECTIF` : changement incompatible, fonctionnalité compatible, correction compatible. Première version publique prévue : `1.0.0`, tag `v1.0.0`.

Avant chaque publication : mettre à jour `VERSION`, `package.json` et `CHANGELOG.md`, exécuter `npm test` et `npm run check`, vérifier les deux pages dans un navigateur, puis fusionner sur `main`. Créer ensuite le tag `vX.Y.Z` et une GitHub Release avec les notes correspondantes et une archive des fichiers utilisables. Les préversions portent un suffixe, par exemple `1.1.0-beta.1`.

Aucune publication automatique n’est activée. Ne pas réécrire les tags publiés. Les versions sont indépendantes de la clé du stockage local ; préserver les réglages existants ou documenter leur migration.
