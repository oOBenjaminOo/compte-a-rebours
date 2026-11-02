# Contribuer

Les corrections et propositions sont les bienvenues via les Issues et les pull requests.

Avant de commencer, vérifier les discussions existantes. Pour une évolution importante, ouvrir une proposition décrivant le besoin et le résultat attendu.

1. Créer un fork puis une branche depuis `main` (`fix/...` ou `feat/...`).
2. Conserver une application statique utilisable hors ligne, sans compilation obligatoire.
3. Éviter les dépendances externes et préserver les préférences du navigateur.
4. Ajouter un test de non-régression pour une correction de logique.
5. Exécuter `npm test` et `npm run check` avec Node.js 22 ou supérieur.
6. Vérifier visuellement les deux pages sur mobile et ordinateur, y compris avec animations réduites.
7. Documenter les changements dans la section « Non publié » du changelog et ouvrir une pull request.

Décrire le problème, le comportement obtenu et les vérifications réalisées. Ne pas inclure de secrets ou de données personnelles dans les exemples. Les contributions sont proposées sous la licence MIT du projet.
