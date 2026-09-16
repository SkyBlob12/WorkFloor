# Mise en place : ce qu'il te reste à faire

Le code est en place (app, base de données, Edge Functions, CI, tests). Ce qui suit demande **tes comptes, tes clés ou tes décisions**. Suis l'ordre : chaque étape débloque la suivante.

Dans le code, les endroits à compléter sont marqués `TODO(toi)` et `[À COMPLÉTER]` (`[TO COMPLETE]` en anglais) :

```bash
grep -rn "TODO(toi)\|À COMPLÉTER\|TO COMPLETE" app components constants i18n lib supabase
```

---

## Étape 0 : voir l'app tourner tout de suite (5 min)

Sans backend, l'app démarre avec un bandeau « Supabase n'est pas configuré ».

- [ ] Mettre à jour **Expo Go** sur l'iPhone et l'Android (version compatible SDK 57).
- [ ] `npm start` puis scanner le QR code (appareil photo sur iPhone, Expo Go sur Android). Téléphone et PC sur le même Wi-Fi ; sinon `npx expo start --go --tunnel`.
- [ ] `npm run web` et redimensionner la fenêtre : sous 768 px tab bar en bas, au-dessus barre de navigation en haut.
- [ ] Au premier lancement sur téléphone, l'onboarding s'affiche (5 étapes interactives, puis Apple / Google / email / invité). Pour le revoir : supprimer l'app d'Expo Go (ou « Clear data »), il est mémorisé localement.
- [ ] L'app démarre toujours en français (quelle que soit la langue du téléphone) ; l'anglais se choisit dans l'onglet Compte et le choix est mémorisé.

---

## Étape 1 : Supabase (base, auth, fonctions)

### 1.1 Projet

- [x] Projet créé et URL + clé publishable renseignées.
- [ ] Vérifier que la **région est dans l'UE** (Paris `eu-west-3` ou Francfort) : *Project Settings → General*.
- [ ] Les valeurs doivent être dans **`.env`** (lu par l'app). Tu les as aussi mises dans `.env.example`, qui est versionné et sert de modèle : la clé publishable n'est pas secrète, mais remets plutôt des valeurs vides dans `.env.example`.

### 1.2 Schéma : pré-vol, migration, rollback

Chaque migration a trois fichiers : `supabase/preflight/` (lecture seule), `supabase/migrations/` (idempotente), `supabase/rollbacks/` (annulation).

- [ ] **Pré-vol** : coller `supabase/preflight/20260915000000_init_schema.sql` dans le *SQL Editor* et lire le résultat. Base vierge attendue : aucune table du projet, aucune policy, `nb_utilisateurs` à 0 ou presque. Si des objets existent déjà (tentative précédente), la migration est rejouable, mais vérifier que les colonnes correspondent.
- [ ] Appliquer :
  ```bash
  npx supabase login
  npx supabase link --project-ref <ref-du-projet>
  npx supabase db push
  ```
  (Alternative : coller les deux fichiers de `supabase/migrations/` dans le SQL Editor, dans l'ordre.)
- [ ] Si la 2ᵉ migration (`retention_cron`) échoue : *Database → Extensions* → activer **pg_cron**, puis relancer.
- [ ] Le **Security Advisor** signalera les vues `reviews_public` et `companies_with_stats` (« security definer view ») : **c'est voulu**, c'est ce qui masque l'auteur des avis. Ne pas « corriger ».
- [ ] Migration `20260916000000_sector_photos` (photos des secteurs de l'accueil) : pré-vol `npm run db:sector-photos:preflight` (`ok = true` partout), puis `npx supabase db push`. Table en lecture seule pour l'app, photos StockSnap CC0 modifiables dans le *Table Editor*. Son rollback ne supprime que cette table.
- [ ] Migration `20260916000100_restrict_author_columns` (anonymat : `companies.created_by` et `user_blocks.blocked_user_id` illisibles via l'API) : pré-vol `npm run db:restrict-author-columns:preflight` (`ok = true` partout), puis `npx supabase db push`. Relancer le pré-vol ensuite : les deux dernières lignes doivent valoir `false`. Son rollback rouvre la faille.
- En cas de besoin : `supabase/rollbacks/` annule tout (**supprime les données**, faire un export avant).

### 1.3 Authentification (dashboard → *Authentication*)

L'app propose trois façons de se connecter, sans email de confirmation : **Apple** (iOS uniquement), **Google**, **email + mot de passe**.

- [ ] *URL Configuration* → **Site URL** : `http://localhost:8081` (pas de site web publié pour l'instant).
- [ ] **Redirect URLs** : ajouter `workfloor://**` et `exp://**` (retour Google / Apple et lien « mot de passe oublié », dans un build comme dans Expo Go), et `http://localhost:8081/**` pour le développement web.
- [ ] *Sign In / Providers → Email* : **Confirm email désactivé** (l'inscription connecte immédiatement) ; longueur minimale du mot de passe : **8**. Si l'option reste activée, l'inscription affiche « Confirmez d'abord votre adresse email ».
**Google** (gratuit, 10 min)
- [ ] console.cloud.google.com → créer un projet → *APIs & Services → OAuth consent screen* : type **External**, nom de l'app, email de support, domaine (plus tard).
- [ ] *Credentials → Create credentials → OAuth client ID* : type **Web application**. *Authorized redirect URIs* : `https://<ref-du-projet>.supabase.co/auth/v1/callback`.
- [ ] Supabase *Sign In / Providers → Google* : activer, coller **Client ID** et **Client Secret**.
- [ ] Avant la mise en ligne : publier l'écran de consentement (*Publishing status → In production*), sinon seuls les comptes de test peuvent se connecter.

**Apple** (bouton affiché sur iOS uniquement, feuille Apple native ; pas de bouton Apple sur Android ni sur le web)
- [ ] developer.apple.com → *Certificates, IDs & Profiles → Identifiers* : sur l'App ID `fr.workfloor.app`, cocher **Sign in with Apple**.
- [ ] *Keys* → nouvelle clé avec **Sign in with Apple** → télécharger le `.p8` (une seule fois possible) et noter le Key ID et le Team ID. Pas besoin de créer de **Services ID** : sans bouton Apple sur Android/web, l'app n'utilise jamais le flux OAuth par navigateur, seulement le jeton natif iOS.
- [ ] Supabase *Sign In / Providers → Apple* : activer. **Client IDs** (séparés par des virgules) : `fr.workfloor.app,host.exp.Exponent` (`host.exp.Exponent` = Expo Go, pour tester la feuille native avant le premier build). **Secret Key** : obligatoire même en flux natif seul (sinon `missing OAuth secret` au login) : générer un JWT ES256 (Team ID, Key ID, `.p8`, `sub` = `fr.workfloor.app`, `aud` = `https://appleid.apple.com`, expiration 6 mois maximum) et le coller là.
- [ ] ⚠️ Ce secret **expire tous les 6 mois** : mettre un rappel pour le régénérer.
- [ ] Sur le champ *Server-to-Server Notification Endpoint* (developer.apple.com, App ID Configuration) : laisser vide, aucune Edge Function ne le consomme.
- Tant qu'Apple n'est pas configuré, le bouton « Continuer avec Apple » (visible sur iPhone/iPad seulement) affiche « La connexion a échoué ».

### 1.4 Secrets et Edge Functions

- [ ] `cp supabase/functions/.env.example supabase/functions/.env` et remplir :
  - `OPENAI_API_KEY` (étape 2 ; vide = pas de modération IA)
  - `IP_HASH_SALT` : une longue chaîne aléatoire (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`), **à ne plus jamais changer**
- [ ] Envoyer les secrets puis déployer :
  ```bash
  npx supabase secrets set --env-file supabase/functions/.env
  npx supabase functions deploy
  ```

✅ **Test** : relancer `npm start`, créer un compte (email, Google ou Apple), ajouter une entreprise (onglet « Ajouter »), publier un avis.

> ⚠️ Plus aucun email n'est envoyé à l'inscription. Seul « Mot de passe oublié » en envoie : tant que l'étape 4 (SMTP) n'est pas faite, Supabase n'envoie qu'aux **membres de l'équipe du projet**, 2 emails par heure.

### 1.5 Modération au quotidien (pas d'écran admin pour l'instant)

Dans *Table Editor* :
- `reviews` filtré sur `status = pending` : relire, passer à `published`, `hidden` ou `removed`. La colonne `moderation_flags` indique pourquoi l'avis a été retenu.
- `reports` filtré sur `status = open` : traiter puis passer à `actioned` ou `dismissed`.
- `banned_terms` : enrichir la liste (`reject` = refusé, `review` = mis en relecture). Termes en minuscules et sans accents.
- Un avis passe automatiquement en `pending` au 5ᵉ signalement (constante `auto_hide_threshold` dans la migration).

### 1.6 MCP Supabase pour Claude Code (optionnel)

- [ ] Générer un token sur supabase.com/dashboard/account/tokens puis :
  ```bash
  claude mcp add supabase -- npx -y @supabase/mcp-server-supabase@latest --access-token <TOKEN>
  ```
  Avec ce MCP, Claude peut lancer lui-même les requêtes de pré-vol (lecture seule).

---

## Étape 2 : OpenAI (modération gratuite)

- [ ] platform.openai.com → créer une clé API → `OPENAI_API_KEY` dans `supabase/functions/.env` → `npx supabase secrets set ...`.
- L'endpoint de modération est gratuit. Sans clé, les avis sont publiés quand même (filtres email/téléphone et mots interdits actifs).

---

## Étape 3 : Expo / EAS (builds, mises à jour, web)

- [ ] Créer un compte sur expo.dev, puis :
  ```bash
  npx eas-cli login
  npx eas-cli init              # ajoute extra.eas.projectId dans app.json
  npx eas-cli update:configure  # ajoute updates.url dans app.json
  ```
- [ ] **Décider des identifiants** avant le premier build : `fr.workfloor.app` dans `app.json` (`ios.bundleIdentifier` et `android.package`). **Non modifiables** après publication sur les stores.
- [ ] Déclarer les variables `EXPO_PUBLIC_*` de `.env` dans EAS (les builds cloud ne lisent pas ton `.env`) :
  ```bash
  npx eas-cli env:create --environment preview --environment production --name EXPO_PUBLIC_SUPABASE_URL --value https://xxxx.supabase.co --visibility plaintext
  # idem pour chaque variable EXPO_PUBLIC_*
  ```
- [ ] Premier APK Android de test (gratuit, lien direct à installer) :
  ```bash
  npx eas-cli build --profile preview --platform android
  ```
- [ ] MCP Expo pour Claude Code (optionnel) : `claude mcp add --transport http expo-mcp https://mcp.expo.dev/mcp` puis `/mcp`.
- [ ] Skills de design Expo (optionnel) : `npx skills add expo/skills`.

> **Development build** : nécessaire uniquement pour tester les notifications push ou un module natif absent d'Expo Go. `npx eas-cli build --profile development --platform all`, puis `npm run start:dev-client`.

---

## Étape 4 : emails (Gmail, sans domaine)

Première version sans nom de domaine : les emails partent d'une boîte Gmail dédiée à l'envoi, les réponses et demandes arrivent sur `workfloor@tutamail.com` (Tuta n'a pas de SMTP). Procédure complète : [LANCEMENT.md](LANCEMENT.md) étape 4 (hôte `smtp.gmail.com`, port `465`, mot de passe d'application).

- [ ] Traduire le modèle d'email *Reset password* (*Authentication → Email Templates*), le seul encore utilisé. Supabase n'envoie qu'une langue par modèle : rédiger un texte bilingue fr / en.
- Le lien de l'email ouvre l'app (`workfloor://reset-password`) : `services/account.ts` et `hooks/useRecoveryLinkSession.ts`.
- Plus tard, avec un domaine : passer à un service transactionnel (Resend, Brevo) avec un expéditeur `no-reply@<domaine>`.

---

## Étape 5 : Sentry et PostHog (optionnels, désactivés si vides)

**Sentry**
- [ ] sentry.io → projet *React Native* → DSN dans `.env` (`EXPO_PUBLIC_SENTRY_DSN`) et dans les variables EAS.
- [ ] Source maps : dans `app.json`, remplacer `"@sentry/react-native"` par `["@sentry/react-native", { "organization": "<org>", "project": "<projet>" }]`, créer un token Sentry, `npx eas-cli env:create --name SENTRY_AUTH_TOKEN --visibility secret ...`, puis retirer `SENTRY_DISABLE_AUTO_UPLOAD` de `eas.json`.
- [ ] npm 12 a bloqué le script d'installation de `@sentry/cli` : `npm install-scripts approve @sentry/cli` puis `npm install` (utile uniquement pour l'upload local de source maps).

**PostHog**
- [ ] eu.posthog.com → projet → clé → `EXPO_PUBLIC_POSTHOG_KEY` (`.env` + EAS). Le bandeau de consentement apparaît automatiquement dès que la clé est définie.

---

## Étape 6 : domaine et site web (reporté)

Première version mobile uniquement, sans domaine : cette étape ne s'applique pas pour l'instant. Les URL publiques exigées par les stores sont traitées dans [LANCEMENT.md](LANCEMENT.md) étape 5. Le jour où le web est ouvert :

- [ ] Acheter le domaine (Cloudflare Registrar, OVH… environ 10 à 15 €/an).
- [ ] Déployer sur EAS Hosting :
  ```bash
  npm run deploy:web     # 1ʳᵉ fois : choisir un sous-domaine .expo.app
  ```
  puis rattacher le domaine personnalisé depuis expo.dev → *Hosting*.
  *(Alternative : Vercel, Netlify ou Cloudflare Pages avec `dist/` comme dossier de sortie ; prévoir une réécriture de `/company/*` vers `/company/[id].html`.)*
- [ ] Remettre le job `deploy_web` dans `.eas/workflows/main.yml` (type `deploy`, `params: { prod: true }`).
- [ ] Mettre à jour avec le vrai domaine :
  - Supabase *Site URL* + *Redirect URLs* (`https://<domaine>/**`)
  - Google : domaine autorisé dans l'écran de consentement OAuth
  - `constants/app.ts` : adresses `contact@` et `signalement@` (à créer, ex. routage email Cloudflare gratuit)

---

## Étape 7 : juridique (avant toute mise en ligne publique)

- [ ] Compléter les derniers `[À COMPLÉTER]` de `i18n/locales/fr/legal.json` **et** `[TO COMPLETE]` de `i18n/locales/en/legal.json` (identité de la société éditrice, représentant légal, date), et la région Supabase (`[À VÉRIFIER]`).
- [ ] **Point à arbitrer avec un juriste** (`[À VALIDER PAR LE JURISTE]`) : la LCEN impose de conserver pendant un an certaines données d'identification des auteurs de contenus, alors que la suppression de compte efface tout immédiatement (cascade SQL). Le texte décrit la conservation d'un an ; si elle est confirmée, il faut l'implémenter (table dédiée purgée à un an, via pré-vol, migration idempotente et rollback). Liste complète des points à valider : [LANCEMENT.md](LANCEMENT.md) étape 6.
- [ ] Faire relire CGU + politique de confidentialité (les deux langues), tenir un registre des traitements (modèle CNIL).

---

## Étape 8 : stores

### Comptes (les seuls coûts incontournables)
- [ ] **Apple Developer Program** : 99 €/an, obligatoire pour TestFlight et l'App Store.
- [x] **Google Play Console** : compte entreprise existant. Le test fermé de 14 jours avec 12 testeurs ne vise que les comptes créés après le 13 novembre 2023 : vérifier dans *Aperçu des tests* qu'il n'est pas exigé.

### Assets
- [x] Visuels dans `assets/images/` générés depuis le logo WorkFloor : `icon.png` (1024×1024, sans transparence), `android-icon-foreground.png` / `-background.png` / `-monochrome.png`, `favicon.png`, `logo-mark.png` / `logo-mark-light.png`. Le splash natif n'a volontairement pas d'image (fond seul) : le logo est affiché par `LaunchSplash`, jamais au premier lancement.
- [ ] Captures d'écran et textes : tout est préparé dans [store/metadata.md](store/metadata.md). Fiches en français et en anglais.

### Avant soumission : checklist UGC Apple
- [ ] Signalement fonctionnel sur un build réel (menu « … » → Signaler)
- [ ] Masquage d'auteur fonctionnel (menu « … » → Masquer, avec « Annuler » pendant 3 s)
- [ ] Suppression de compte fonctionnelle (Mon compte)
- [ ] URL publiques de confidentialité, de support et de suppression de compte en ligne ([LANCEMENT.md](LANCEMENT.md) étape 5)
- [ ] Compte de démonstration avec un avis publié, identifiants fournis dans les notes de review

### Soumission
```bash
npx eas-cli build --profile production --platform all
npx eas-cli submit --platform ios      # demande la connexion Apple la 1ʳᵉ fois
npx eas-cli submit --platform android  # nécessite une clé de compte de service Google (voir doc EAS Submit)
```

---

## Étape 9 : CI/CD (quand le repo est sur GitHub)

- [ ] Créer le repo GitHub et pousser le code, puis relier le repo au projet sur expo.dev → *GitHub*.
- [ ] Workflows fournis (à vérifier au premier lancement) :
  - `.eas/workflows/main.yml` : à chaque push sur `main`, EAS Update (correctifs JS OTA). Pas de déploiement web tant que seule la version mobile est publiée.
  - `.eas/workflows/release-stores.yml` : sur un tag `v*`, build + soumission aux deux stores.
- [ ] Lancement manuel : `npx eas-cli workflow:run .eas/workflows/main.yml`.

---

## Ce qui n'est pas (encore) implémenté

| Sujet | État |
| --- | --- |
| Notifications push | Table `push_tokens` + `lib/push.ts` prêts, **non branchés** (aucun cas d'usage pour l'instant ; ne pas demander la permission pour rien). Nécessite un development build. |
| Interface de modération | Via le dashboard Supabase (étape 1.5). |
| Connexion Google native | Google passe par le navigateur système (fonctionne dans Expo Go). Le sélecteur de compte natif (`@react-native-google-signin`) demanderait un development build. |
| Entreprises hors France | Non gérées : création uniquement via SIRENE. |
| Emails transactionnels métier | Seuls les emails d'auth sont envoyés (SMTP Gmail). Les messages des utilisateurs arrivent sur `workfloor@tutamail.com`. |
| Colonne `companies.sector` | Obsolète (le secteur est déduit du code NAF et traduit) ; à retirer plus tard en deux temps. |
