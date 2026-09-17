# CLAUDE.md : WorkFloor (React Native / Expo)

Instructions permanentes pour Claude sur ce projet. À respecter sur chaque génération de code.
Plateforme d'avis anonymes sur les entreprises (iOS, Android, Web). Cahier des charges : `projet-WorkFloor.md`. Actions manuelles restantes : `LANCEMENT.md` (feuille de route jusqu'aux stores) et `SETUP.md` (procédures détaillées).

---

## 🏗️ Stack & Architecture

- **Framework** : React Native avec **Expo SDK 57** (iOS, Android et Web via react-native-web)
- **Navigation** : `expo-router` (file-based routing, routes typées)
- **State management** : `zustand` pour le state global (`stores/`), `useState`/`useReducer` pour le state local
- **Requêtes** : `TanStack Query` pour le fetching, le cache et les mutations
- **Styles** : `StyleSheet` React Native via `makeStyles` (`hooks/makeStyles.ts`). NativeWind a été retiré : sa couche native (conversion des classes à l'exécution) cassait la mise en page et les couleurs sur iOS / Android. Toutes les valeurs viennent des tokens, voir 🎨
- **Backend** : Supabase (Postgres + RLS, Auth, Edge Functions Deno)
- **Typage** : TypeScript strict sur tous les fichiers `.ts` / `.tsx`
- **Internationalisation** : `i18next` + `react-i18next`. Le français est la langue de référence **et la langue par défaut** (jamais celle de l'appareil) ; l'anglais est livré et se choisit dans le compte.

```bash
npm start            # Expo Go
npm run web          # navigateur
npm run typecheck    # tsc
npm test             # Jest
npm run export:web   # export statique
```

---

## 🌍 Internationalisation : règle absolue

**Aucune chaîne visible par l'utilisateur ne doit être écrite en dur dans le code.** Cela vaut pour chaque composant, écran, toast, `placeholder`, `accessibilityLabel`, titre de page, message d'erreur affiché. Un littéral français dans un `<Text>`, un `placeholder=` ou un `accessibilityLabel=` est un bug.

```tsx
// ❌ Interdit
<Text>Donner mon avis</Text>
<TextInput placeholder="Nom de l'entreprise" />

// ✅ À faire
const { t } = useTranslation('reviews');
<Text>{t('form.titleNew')}</Text>
```

### Où mettre le texte

- **Un namespace par domaine** dans `i18n/locales/<lang>/<domaine>.json` : `common`, `companies`, `reviews`, `account`, `legal`, `onboarding`. `common` porte le vocabulaire transverse (`common:action.*`, `common:nav.*`, `common:serviceError.*`, `common:rating.*`).
- **Toute clé ajoutée en français DOIT l'être en anglais**, avec les **mêmes variables `{{x}}`**, les **mêmes balises `<x>`** et les **mêmes formes de pluriel**. `__tests__/i18n/locales.test.ts` échoue sinon. Ne jamais le contourner.
- Réutiliser une clé transverse existante avant d'en créer une.

### Cross-namespace, pluriel, interpolation, liens

- Cross-namespace : `useTranslation(['companies', 'reviews'])` puis `t('reviews:criterion.salary')`.
- Pluriel : clés `_one` / `_other` (et `_zero` si besoin), appelées avec `t('key', { count })`. Jamais `count > 1 ? 's' : ''`.
- Interpolation : `t('key', { name })`. Jamais de concaténation de phrases.
- Lien ou gras inline : `<Trans t={t} i18nKey="..." components={{ link: <LinkText href="/legal/terms" /> }} />`.

### Utils purs, services, erreurs, dates

- **Utils purs** (`utils/`) : ne renvoient **pas** de texte mais un **descripteur** `{ key, params }` traduit à l'affichage (ex. `utils/reviewRules.ts` avec `useReviewFieldError`).
- **Code hors React** : `translate('ns:key', params)` depuis `@/i18n/currentLocale` (module feuille, compatible Jest).
- **Erreurs** : les services et les Edge Functions renvoient un **code stable** en MAJUSCULES (`ServiceError('ALREADY_REPORTED')`, `{ error: 'BANNED_TERM' }`). Liste unique : `constants/serviceErrors.ts`. Traduction au point d'affichage : `useErrorMessage()` ou `common:serviceError.<CODE>`. Un nouveau code s'ajoute dans la liste **et** dans les deux `common.json`.
- **Dates et nombres** : `utils/format.ts` avec `getIntlTag()`, jamais `'fr-FR'` en dur.
- **Données SIRENE** : le secteur se déduit du code NAF (`utils/naf.ts`) et se traduit (`companies:sector.<lettre>`). Ne jamais stocker de libellé localisé en base.

### Constantes de données

Une constante partagée (`constants/reviews.ts`, `constants/companies.ts`, `constants/legal.ts`) porte des **clés stables**, **jamais de `label`**. Seule exception : `nativeName` dans `i18n/locales.ts` (endonyme, identique dans toutes les langues).

### Ajouter une langue = 3 gestes

1. Déclarer l'entrée dans `i18n/locales.ts` (`LOCALES`).
2. Copier `i18n/locales/fr/` vers `i18n/locales/<code>/` et traduire.
3. L'enregistrer dans `i18n/resources.ts`.

### Vérifier avant de livrer

```bash
npm test -- __tests__/i18n
grep -nE "[\"'][A-ZÀ-ÿ][a-zà-ÿ]" MonComposant.tsx | grep -vE "t\(|//|import"
```

---

## 📁 Structure des fichiers

```
app/                     Routes expo-router (écrans fins, logique dans hooks/ et components/)
  (tabs)/                Recherche · Ajouter · Compte
  company/[id]/          Fiche entreprise · formulaire d'avis
components/
  ui/                    Atomes réutilisables (Button, PressableScale, Sheet, Pill, Card, Text…)
  companies/ reviews/ account/ auth/ legal/ moderation/   Composants par feature
  navigation/ shell/                          Barre du haut, onglets, layout
hooks/                   Hooks (requêtes TanStack, formulaires, actions)
stores/                  Stores Zustand (session, onboarding)
services/                Appels Supabase / API, codes d'erreur
lib/                     Infrastructure (client Supabase, queryClient, toasts, monitoring Sentry)
constants/               tokens.json, theme.ts, constantes métier
types/                   Types globaux (domain.ts, i18next.d.ts)
utils/                   Fonctions pures testées
i18n/                    Configuration et traductions
scripts/                 Scripts Node (build-legal-site.mjs : pages publiques des stores depuis legal.json, GitHub Pages)
supabase/                migrations/ · preflight/ · rollbacks/ · functions/ · demo/ (données fictives) · maintenance/ (purge) : jamais via db push, lancés par `npm run db:*`
__tests__/               Tests Jest (miroir de la structure)
```

---

## 🎨 Design & UI : règles absolues

### Tokens : une seule source

`constants/tokens.json` contient couleurs (clair/sombre), espacements, rayons, typographie, tailles, effets. `constants/theme.ts` l'expose (`spacing`, `radius`, `size`, `iconSize`, `typography`, `effects`, `layout`, `motion`).

```tsx
const useStyles = makeStyles((palette) => ({
  card: { borderRadius: radius.lg, backgroundColor: palette.surface, padding: spacing.md },
}));
// dans le composant
const styles = useStyles();
```

- Styles dépendant des couleurs : `makeStyles` (mis en cache par mode clair / sombre). Styles sans couleur : `StyleSheet.create` au niveau du module.
- Couleurs hors styles (icônes, `placeholderTextColor`, `Switch`) : `useThemeColors()`.
- Texte : toujours `<Text variant tone weight align>`, jamais de `fontSize` / `color` en dur.
- Enfant direct de `<Link asChild>` ou d'un `Slot` d'expo-router : `style` doit être un **objet**, jamais un tableau (`StyleSheet.flatten([...])`), sinon la page web plante.
- **Interdit** : nombres ou couleurs en dur (`padding: 13`, `'#333'`), `className`, NativeWind / Tailwind.
- Nouveau besoin : ajouter le token dans `tokens.json`, jamais une valeur en dur.
- Cas limites acceptables : `rgba(0,0,0,x)` pour un voile, `{ flex: 1 }`, `{ display: 'none' }`.

### Direction artistique

Moderne, chaleureux, natif : papier et encre, loin du look « SaaS sombre + bleu/violet ». Police système uniquement (SF Pro, Roboto, system-ui) : la hiérarchie passe par la taille et la graisse (`hero`, `display`, `title` en gras), **jamais de serif**. Fond crème (`background`), contenu posé dans des cartes blanches arrondies sans bordure (`surface`, `radius.lg`). Les actions principales sont des **pilules d'encre** (`ink` / `onInk`, `Button` variante `primary`), les secondaires des pilules `surfaceMuted`. Un seul accent, le **terracotta** (`primary` pour le texte, `primaryFill` pour les aplats) ; ses teintes douces (`primaryMuted`, `success-muted`, `danger-muted`, `rating-muted`) servent de fonds aux badges, pastilles et notices. L'ambre `rating` est réservé aux étoiles, `warning` aux textes d'alerte. Pas de dégradés, pas de majuscules partout, textes courts, une action principale par écran. Mode sombre en anthracite chaud (palette `dark` de `tokens.json`), l'encre y devient claire.

Navigation mobile : îlot flottant en verre (`BottomTabBar` + `GlassSurface` : Liquid Glass iOS 26, flou iOS plus ancien, translucide sur Android et web). Le contenu des onglets réserve sa hauteur via `useTabBarInset` / `Screen inTabs`.

Mobile d'abord : vérifier chaque écran à 390 px de large. Les listes sont des cartes espacées (`ListSeparator`), les choix exclusifs courts passent par `SegmentedControl`, les entreprises s'identifient par leur monogramme (`Avatar`).

### Interactions

- Tout élément tappable passe par `<PressableScale>` (impose `accessibilityLabel`). **Aucun effet visuel à l'appui** : ni rebond, ni réduction, ni animation. Jamais l'API `Animated` de base.
- Responsive : `useLayout()` (`isWide` à partir de 768 px : TopBar au lieu de la tab bar, colonnes côte à côte). Tester en largeur mobile ET desktop sur le web.
- Code spécifique plateforme : fichiers `.web.tsx` / `.native.ts`.

### Composants UI existants (à réutiliser)

`Text`, `Button`, `IconButton`, `PressableScale`, `TextField`, `SearchInput`, `Checkbox`, `ChoiceChips`, `SegmentedControl`, `StarRating`, `StarInput`, `RatingBar`, `RatingBadge`, `Avatar`, `Notice`, `Pill`, `Card`, `Divider`, `ContentColumn`, `Screen`, `ListSeparator`, `LoadingState`, `EmptyState`, `FormSection`, `LinkText`, `Sheet`, `ActionSheet`, `ConfirmSheet`, `ToastHost`, `SelectableCard`, `GlassSurface`, `SectionHeader`, `HorizontalRail`, `SettingsGroup`, `SettingsRow`.

### Onboarding

Premier lancement mobile uniquement (`useOnboardingGate`, jamais sur le web). Style « slides illustrées », **sans aucune action demandée** : en haut une scène (`OnboardingStage`) où des cartes et pastilles flottantes inclinées servent d'illustration, jamais tappables (`FloatingCard`, `ChoiceCard`, `PriorityChip`, `Sticker`, inclinaisons `tilt` des tokens), en dessous un gros titre centré sans sous-titre dont un mot est coloré (`StepHeadline` + balise `<accent>` dans la traduction), puis points de pagination et pilules « Passer » / « Suivant ». « Suivant » est toujours actif ; « Passer » mène directement à l'étape de connexion. Les priorités éventuellement enregistrées par l'ancien onboarding (`stores/onboardingStore.ts`) réordonnent encore les critères des fiches. Dernière étape (`AuthStep`, scène `OnboardingStage` + `SampleReviewCard`) : Apple, Google, email ou invité (lecture seule).

Splash : le splash natif n'affiche que la couleur de fond (il ne peut pas savoir si c'est le premier lancement, et Expo Go peut le retirer trop tôt). `LaunchSplash` couvre l'app dès son premier rendu (`useLaunchSplash`, `utils/launchSplash.ts`) : fond seul tant que l'état est inconnu, logo animé aux lancements suivants, et au premier lancement il s'efface directement sur l'onboarding (jamais de logo ni de page d'accueil visible). Jamais sur le web.

---

## ✍️ Qualité du code TypeScript

- Pas de `any`. `unknown` + type guard (`utils/guards.ts`).
- Props typées avec une `interface` nommée `[Component]Props`. Retours de hooks typés explicitement.
- Composants fonctionnels uniquement, **un composant par fichier**, named export + default export.
- Logique (hors JSX) au-delà de ~80 lignes : extraire dans un hook. Fichier au-delà de 120 lignes : découper.
- `memo()` sur les éléments de liste. `FlatList` avec `keyExtractor`, `renderItem` en `useCallback`, `removeClippedSubviews`.
- Pas d'appel conditionnel de hook. `useMemo` pour dériver, `useEffect` uniquement pour les effets.
- Pas de `console.log` : `logger` (`utils/logger.ts`), silencieux en production.

---

## 📦 Imports & Modules

| Alias | Dossier |
|---|---|
| `@components/*` | `components/` |
| `@hooks/*` | `hooks/` |
| `@stores/*` | `stores/` |
| `@services/*` | `services/` |
| `@constants/*` | `constants/` |
| `@app-types/*` | `types/` |
| `@utils/*` | `utils/` |
| `@lib/*` | `lib/` |
| `@/*` | racine (ex. `@/i18n/currentLocale`) |

`@app-types` et non `@types` : TypeScript refuse les imports commençant par `@types/` (réservé aux paquets DefinitelyTyped). Toujours déclarer un nouvel alias dans `tsconfig.json` **et** `jest.config.js`.

Ordre : 1. React / React Native · 2. Expo et tierces · 3. Alias internes · 4. Imports relatifs.

---

## 🧪 Tests

- **Obligatoire** : `utils/`, `hooks/`, `services/`. **Pas de test** pour les composants UI purs, la config, les types.
- Fichiers dans `__tests__/[dossier]/[fichier].test.ts`, miroir des sources.
- Mock Supabase centralisé : `__tests__/mocks/supabase.ts` (`mockSupabaseResult`, `resetSupabaseMock`). Ne pas recréer de mock inline.
- Setup global (AsyncStorage, expo-localization, toasts, i18n en français) : `__tests__/setup.ts`.
- Hooks : `renderHook` et `act` de `@testing-library/react-native` (v14 : `await renderHook(...)`). Mocker les hooks de mutation plutôt que monter un QueryClient quand seule la logique du hook est testée.
- Seuil de couverture 30 % sur `utils/`, `hooks/`, `constants/` (`npm run test:coverage`).

---

## 📐 UX Patterns à respecter

- **Feuilles modales** : `Sheet` / `ActionSheet` (`@gorhom/bottom-sheet`). Pas de `Modal` natif, et jamais `Alert` (inopérant sur le web).
- **Erreurs réseau** : toast automatique via le `QueryCache` / `MutationCache` (`lib/queryClient.ts`). Un formulaire qui affiche l'erreur lui-même déclare `meta: { inlineError: true }`.
- **Suppressions et actions réversibles** : `useUndoableAction` (élément masqué, snackbar « Annuler » 3 s, action envoyée ensuite). Exception unique : les actions **irréversibles côté serveur** (suppression du compte) passent par `ConfirmSheet`.
- Toute action async affiche un état de chargement (`loading` sur `Button`, `ActivityIndicator`).
- Accessibilité : `accessibilityLabel` obligatoire sur `PressableScale`, `accessibilityRole` sur boutons, liens, onglets, radios. Contraste 4.5:1 minimum.

---

## 🔐 Sécurité : règles absolues

- `EXPO_PUBLIC_*` uniquement pour des valeurs conçues pour être publiques (URL + clé publishable Supabase, DSN Sentry). Aucun outil de mesure d'audience ni de publicité dans l'app : les statistiques viennent de Supabase (SQL), des consoles des stores et de Sentry. Toute clé secrète (OpenAI, service role) vit dans les secrets des Edge Functions.
- Toute Edge Function vérifie l'utilisateur via `getUser()` avant toute opération. `verify_jwt = false` est déclaré dans `supabase/config.toml` (clés publishable non-JWT) : la vérification est faite dans le code.

### Invariants métier (ne jamais casser)

- **Anonymat** : `reviews.user_id` ne sort jamais en lecture publique. Lecture publique uniquement via les vues `reviews_public` et `companies_with_stats` (volontairement sans `security_invoker`). Aucune date exacte exposée (mois seulement). Aucun identifiant d'auteur lisible par `anon` / `authenticated`, même indirectement : `companies.created_by` et `user_blocks.blocked_user_id` sont exclus par droits de colonne (Supabase accorde ALL par défaut à chaque nouvelle table : toujours `revoke all` puis `grant` explicite). **Sites** : une fiche reste une entité légale (SIREN) ; le site d'un avis (`reviews.site_id` → `company_sites`, SIRET vérifié par `submit-review`) n'est jamais lisible publiquement, seule sa ville sort via `reviews_public.site_city` et `company_city_stats`, à partir de 3 avis publiés dans la ville (`SITE_CITY_MIN_REVIEWS`, à garder synchronisé avec le SQL).
- **Écritures sensibles via Edge Functions** : avis (`submit-review` : rate limit, modération), entreprises (`create-company` : vérification SIRENE, entreprises individuelles refusées). Aucune policy insert/update sur `reviews` ni `companies`.
- **Un avis par utilisateur par entreprise** : contrainte `reviews_one_per_user_per_company`.
- Limites de longueur des avis à garder synchronisées en 3 endroits : `constants/reviews.ts`, `supabase/functions/submit-review/index.ts`, CHECK SQL.
- **Exigences Apple UGC** : signalement, masquage d'auteur, acceptation des CGU à l'inscription (mention « En continuant… » de `AuthTermsNotice`, visible avant tout mode de connexion), suppression du compte dans l'app doivent rester fonctionnels.
- **Authentification** : Apple (iOS uniquement, feuille native), Google (`services/oauth.ts` mobile, `services/oauth.web.ts` web, retour sur `/auth-callback`) et email + mot de passe. `constants/auth.ts` expose `VISIBLE_AUTH_PROVIDERS` (filtré par `Platform.OS`) pour n'afficher Apple que sur iOS ; Android et web n'ont que Google et email. **Aucun email de confirmation à l'inscription** (« Confirm email » désactivé côté Supabase) ; sur iOS, Apple reste le premier bouton affiché (exigence App Store dès qu'une connexion tierce existe).

---

## 🗄️ Migrations SQL : vérifier avant d'écrire, toujours

**Un seul projet Supabase (plan gratuit) sert à tout** : toute migration proposée est une migration de production, exécutée sur les données réelles. Le dossier `supabase/migrations/` est un journal, **pas une preuve de l'état réel de la base** (un objet peut avoir été créé depuis le dashboard, un fichier peut n'avoir jamais été appliqué).

### La règle

**Avant d'écrire ou de proposer une migration, produire d'abord une requête de vérification en lecture seule et attendre son résultat.** Claude n'a pas accès à la base : il ne peut jamais affirmer qu'une migration est sans risque.

Le livrable d'une migration, ce sont trois fichiers portant le même préfixe horodaté :

1. **Le pré-vol** : `supabase/preflight/<ts>_<nom>.sql`, `SELECT` uniquement (`pg_policies`, `information_schema.columns`, `pg_indexes`, `pg_publication_tables`, `pg_class.relrowsecurity`, `pg_stat_user_tables`…).
2. **La migration** : `supabase/migrations/<ts>_<nom>.sql`, idempotente, rejouable deux fois sans erreur.
3. **Le rollback** : `supabase/rollbacks/<ts>_<nom>.sql`, écrit en même temps, rejouable lui aussi.

Application : `npx supabase db push` ou collage dans le SQL Editor, toujours après lecture du pré-vol.

### Idempotence obligatoire

`IF NOT EXISTS` / `IF EXISTS` / `CREATE OR REPLACE` partout où la syntaxe l'accepte. Sinon, garde par le catalogue dans un `DO $$ ... $$` : types énumérés (voir la migration initiale), policies via `public.create_policy_if_missing(table, nom, définition)`, `ALTER PUBLICATION ... ADD TABLE`.

### Ce qu'il faut vérifier selon l'opération

| Opération | Verrou pris | Ce qui peut casser |
|---|---|---|
| `ADD COLUMN` nullable sans défaut | ACCESS EXCLUSIVE bref | Rien (PG 11+) |
| `ADD COLUMN NOT NULL` avec défaut volatile | Réécriture complète | Table bloquée pendant la réécriture |
| `DROP COLUMN` / `RENAME` | ACCESS EXCLUSIVE | **L'app déjà installée qui lit encore la colonne** |
| `ALTER TYPE` / nouvelle valeur d'enum | Réécriture / catalogue | Blocage, app installée qui ne connaît pas la valeur |
| `CREATE INDEX` | Bloque les écritures | Utiliser `CONCURRENTLY`, hors transaction |
| `CREATE POLICY` | Immédiat | **Exposition de données si la clause est trop large** |
| `DROP POLICY` | Immédiat | Coupe l'accès en production dans la seconde |
| Vue publique modifiée | Immédiat | **Fuite de `user_id` ou d'une date exacte** |
| Publier une table en Realtime | Immédiat | Diffuse les lignes aux clients : RLS vérifiée avant |

### Le piège propre au mobile

Le binaire installé reste en place des semaines. Une migration doit rester compatible avec la version en circulation : renommage ou suppression de colonne en deux temps séparés par une release (ajouter et écrire dans les deux, puis retirer l'ancien). Exemple : `companies.sector` est obsolète mais conservé.

---

## ✒️ Ponctuation : jamais de tiret cadratin

**Le tiret cadratin (U+2014) est interdit dans tout le dépôt** : textes affichés, commentaires, noms de tests, `.md`, `.json`, `.sql`. Le remplacer par une virgule, un deux-points ou des parenthèses. Autorisés : trait d'union `-`, deux-points, point-virgule, point médian `·`. Placeholder « pas de données » : `-` (`EMPTY_VALUE` dans `utils/format.ts`).

```bash
grep -rn "$(printf '\xe2\x80\x94')" --include=*.ts --include=*.tsx --include=*.md --include=*.json --include=*.sql . | grep -v node_modules
```

Cette commande doit ne rien renvoyer.

---

## 🧹 Ce qu'il ne faut jamais faire

| ❌ Interdit | ✅ À faire à la place |
|---|---|
| Valeur en dur (`padding: 13`, `color: '#333'`), `className` | `makeStyles` + tokens (`spacing.md`, `palette.text`) |
| `Pressable` / `TouchableOpacity` nu | `PressableScale` |
| `Modal` natif ou `Alert` | `Sheet`, `ActionSheet`, toast |
| Confirmation modale pour une suppression réversible | `useUndoableAction` |
| `console.log` | `logger` |
| `any` | `unknown` + type guard |
| `Animated` de base | Reanimated |
| Logique métier dans un composant | Hook ou service |
| `useEffect` pour dériver du state | `useMemo`, ou `key` pour réinitialiser un formulaire |
| Chaîne visible en dur | `t('ns:key')`, clé ajoutée en `fr` **et** `en` |
| Message d'erreur localisé dans un service ou une Edge Function | Code stable de `constants/serviceErrors.ts` |
| `count > 1 ? 's' : ''`, `'fr-FR'` en dur | Pluriel i18n, `getIntlTag()` |
| `label` dans une constante de données | Clé stable, libellé via `t()` |
| Lecture de `reviews` exposant `user_id` au public | Vue `reviews_public` |
| Clé secrète en `EXPO_PUBLIC_*` | Secret d'Edge Function |
| Migration sans pré-vol, non idempotente ou sans rollback | Les trois fichiers `preflight/`, `migrations/`, `rollbacks/` |
| Imports relatifs remontants (`../../`) | Alias |
| Mock Supabase inline | `__tests__/mocks/supabase.ts` |
| Tiret cadratin | Virgule ou `:` |

---

## 🔁 Workflow de génération

Pour un nouveau composant ou écran :

1. **Vérifier** les types dans `types/domain.ts`, les créer sinon.
2. **Créer** le composant dans le bon dossier (un fichier par composant, props en `interface`).
3. **Styler** avec `makeStyles` et les tokens, jamais de valeur magique.
4. **Traduire** : `useTranslation`, clés en `fr` **et** `en`, pluriel et interpolation dès le départ.
5. **Rendre tappable** via `PressableScale` avec `accessibilityLabel`.
6. **Brancher les données** via un hook TanStack Query (lecture) ou une mutation (écriture), erreurs en codes.
7. **Tester** la logique ajoutée dans `utils/`, `hooks/` ou `services/`.
8. **Exporter** en named export + default export.
9. **Signaler** toute dépendance à installer (`npx expo install ...`) et toute action manuelle (ajout dans `SETUP.md`).
