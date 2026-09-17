# WorkFloor

Avis anonymes de salariés sur leur entreprise, avec une seule base de code pour **iOS, Android et Web**.

> **Première fois ?** Toutes les actions manuelles (comptes, clés, déploiement, stores) sont listées dans [SETUP.md](SETUP.md). Les conventions de code sont dans [CLAUDE.md](CLAUDE.md).

## Stack

| Couche | Outil |
| --- | --- |
| App | Expo SDK 57 (React Native + react-native-web), Expo Router, NativeWind 4 |
| Données | TanStack Query (serveur), Zustand (session, onboarding) |
| Langues | i18next (français de référence, anglais) |
| Backend | Supabase : Postgres + RLS, Auth, Edge Functions (Deno) |
| Données entreprises | API Recherche d'entreprises (répertoire SIRENE de l'INSEE) |
| Anti-abus | Rate limiting SQL, modération OpenAI + mots interdits |
| Interface | @gorhom/bottom-sheet, react-native-toast-message, Reanimated |
| Observabilité | Sentry (région UE) |
| Build / distribution | EAS Build, Submit, Update, Hosting, Workflows |
| Tests | Jest (jest-expo), Testing Library |

## Démarrer

```bash
npm install
cp .env.example .env      # puis remplir (voir SETUP.md)
npm start                 # QR code, puis Expo Go sur iPhone / Android
npm run web               # navigateur
```

## Scripts

| Script | Rôle |
| --- | --- |
| `npm start` | Serveur de dev pour Expo Go |
| `npm run start:dev-client` | Serveur de dev pour un development build |
| `npm run web` | Version web en local |
| `npm run typecheck` | Vérification TypeScript |
| `npm test` / `npm run test:coverage` | Tests Jest (parité des traductions comprise) |
| `npm run export:web` | Export statique du site dans `dist/` |
| `npm run deploy:web` | Export + déploiement EAS Hosting |
| `npm run db:push` | Applique les migrations sur le projet Supabase lié |
| `npm run functions:deploy` | Déploie les Edge Functions |
| `npm run db:types` | Génère les types TypeScript du schéma |

## Structure

```
app/                     Routes Expo Router (écrans)
components/              ui/ (atomes), companies/, reviews/, account/, auth/, legal/, navigation/, shell/, security/
hooks/                   Requêtes TanStack, formulaires, actions
stores/                  Zustand
services/                Appels Supabase et API, codes d'erreur
lib/                     Client Supabase, queryClient, toasts, monitoring
constants/               tokens.json (design), theme.ts, constantes métier
utils/                   Fonctions pures testées
types/                   Types globaux
i18n/                    Configuration et traductions fr / en
supabase/                migrations/, preflight/, rollbacks/, functions/
__tests__/               Tests Jest
store/metadata.md        Textes et réponses pour les stores
.eas/workflows/          CI/CD EAS
```

## Principes

- **Consultation libre, contribution avec compte.** Lecture publique via des vues qui n'exposent jamais l'auteur.
- **Anonymat** : `user_id` n'est lisible que par son propriétaire ; les avis publics sont datés au mois.
- **Écritures sensibles côté serveur** : un avis passe par rate limit et modération avant d'être écrit.
- **Un avis par personne et par entreprise**, modifiable et supprimable (avec annulation).
- **Exigences stores UGC** : signalement, masquage d'auteur, CGU acceptées à l'inscription, suppression du compte dans l'app.
- **Responsive** : tab bar en bas sur mobile, barre de navigation en haut et colonnes au-delà de 768 px.
- **Multilingue** : aucun texte en dur, test de parité fr / en.
