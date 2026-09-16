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
- En cas de besoin : `supabase/rollbacks/` annule tout (**supprime les données**, faire un export avant).

### 1.3 Authentification (dashboard → *Authentication*)

L'app propose trois façons de se connecter, sans email de confirmation : **Apple**, **Google**, **email + mot de passe**.

- [ ] *URL Configuration* → **Site URL** : `http://localhost:8081` pour l'instant (le domaine plus tard).
- [ ] **Redirect URLs** : ajouter `http://localhost:8081/**`, `workfloor://**` et `exp://**` (retour Google / Apple dans Expo Go).
- [ ] *Sign In / Providers → Email* : **Confirm email désactivé** (l'inscription connecte immédiatement) ; longueur minimale du mot de passe : **8**. Si l'option reste activée, l'inscription affiche « Confirmez d'abord votre adresse email ».
- [ ] *Attack Protection* → **Captcha** : activer avec le provider **Turnstile** et la clé secrète de l'étape 2 (en attendant : clé de test `1x0000000000000000000000000000000AA`).

**Google** (gratuit, 10 min)
- [ ] console.cloud.google.com → créer un projet → *APIs & Services → OAuth consent screen* : type **External**, nom de l'app, email de support, domaine (plus tard).
- [ ] *Credentials → Create credentials → OAuth client ID* : type **Web application**. *Authorized redirect URIs* : `https://<ref-du-projet>.supabase.co/auth/v1/callback`.
- [ ] Supabase *Sign In / Providers → Google* : activer, coller **Client ID** et **Client Secret**.
- [ ] Avant la mise en ligne : publier l'écran de consentement (*Publishing status → In production*), sinon seuls les comptes de test peuvent se connecter.

**Apple** (sur iPhone : feuille Apple native ; sur Android et web : page Apple dans le navigateur)
- [ ] developer.apple.com → *Certificates, IDs & Profiles → Identifiers* : sur l'App ID `fr.workfloor.app`, cocher **Sign in with Apple**.
- [ ] Créer un **Services ID** (ex. `fr.workfloor.web`), activer *Sign in with Apple* → *Configure* : domaine `jcxragsifxcifxryoqvq.supabase.co`, return URL `https://jcxragsifxcifxryoqvq.supabase.co/auth/v1/callback`.
- [ ] *Keys* → nouvelle clé avec **Sign in with Apple** → télécharger le `.p8` (une seule fois possible) et noter le Key ID et le Team ID.
- [ ] Supabase *Sign In / Providers → Apple* : activer. **Client IDs** (séparés par des virgules) : `fr.workfloor.app,host.exp.Exponent,fr.workfloor.web` (`host.exp.Exponent` = Expo Go, pour tester la feuille native avant le premier build). **Secret Key** : générée depuis le `.p8` (outil du dashboard Supabase).
- [ ] ⚠️ Ce secret **expire tous les 6 mois** : mettre un rappel pour le régénérer, sinon la connexion Apple par navigateur (Android, web) tombe en panne. La feuille native iPhone n'en dépend pas.
- Tant qu'Apple n'est pas configuré, le bouton « Continuer avec Apple » affiche « La connexion a échoué ».

### 1.4 Secrets et Edge Functions

- [ ] `cp supabase/functions/.env.example supabase/functions/.env` et remplir :
  - `TURNSTILE_SECRET_KEY` (étape 2 ; la clé de test marche en attendant)
  - `OPENAI_API_KEY` (étape 3 ; vide = pas de modération IA)
  - `IP_HASH_SALT` : une longue chaîne aléatoire (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`), **à ne plus jamais changer**
- [ ] Envoyer les secrets puis déployer :
  ```bash
  npx supabase secrets set --env-file supabase/functions/.env
  npx supabase functions deploy
  ```

✅ **Test** : relancer `npm start`, créer un compte (email, Google ou Apple), ajouter une entreprise (onglet « Ajouter »), publier un avis.

> ⚠️ Plus aucun email n'est envoyé à l'inscription. Seul « Mot de passe oublié » en envoie : tant que l'étape 5 (SMTP Resend) n'est pas faite, Supabase est limité à **2 emails par heure**.

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

## Étape 2 : Cloudflare Turnstile (anti-bot)

- [ ] dash.cloudflare.com → *Turnstile* → **Add widget** (mode *Managed*).
- [ ] Domaines autorisés : `localhost` + ton futur domaine (étape 7).
- [ ] **Site key** → `.env` : `EXPO_PUBLIC_TURNSTILE_SITE_KEY`
- [ ] **Secret key** → `supabase/functions/.env` (`TURNSTILE_SECRET_KEY`) **et** Supabase *Attack Protection → Captcha*. Puis `npx supabase secrets set --env-file supabase/functions/.env`.
- [ ] `EXPO_PUBLIC_TURNSTILE_ORIGIN` : le domaine déclaré (sur mobile, le widget tourne dans une WebView qui se présente avec cette origine).

---

## Étape 3 : OpenAI (modération gratuite)

- [ ] platform.openai.com → créer une clé API → `OPENAI_API_KEY` dans `supabase/functions/.env` → `npx supabase secrets set ...`.
- L'endpoint de modération est gratuit. Sans clé, les avis sont publiés quand même (filtres email/téléphone et mots interdits actifs).

---

## Étape 4 : Expo / EAS (builds, mises à jour, web)

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

## Étape 5 : emails (Resend), après l'achat du domaine

- [ ] resend.com → ajouter et **vérifier le domaine** (enregistrements DNS).
- [ ] Créer une clé API.
- [ ] Supabase *Authentication → Emails → SMTP Settings* : hôte `smtp.resend.com`, port `465`, utilisateur `resend`, mot de passe = clé API, expéditeur `no-reply@<domaine>`.
- [ ] Traduire le modèle d'email *Reset password* (*Authentication → Email Templates*), le seul encore utilisé. Supabase n'envoie qu'une langue par modèle : rédiger un texte bilingue fr / en.

---

## Étape 6 : Sentry et PostHog (optionnels, désactivés si vides)

**Sentry**
- [ ] sentry.io → projet *React Native* → DSN dans `.env` (`EXPO_PUBLIC_SENTRY_DSN`) et dans les variables EAS.
- [ ] Source maps : dans `app.json`, remplacer `"@sentry/react-native"` par `["@sentry/react-native", { "organization": "<org>", "project": "<projet>" }]`, créer un token Sentry, `npx eas-cli env:create --name SENTRY_AUTH_TOKEN --visibility secret ...`, puis retirer `SENTRY_DISABLE_AUTO_UPLOAD` de `eas.json`.
- [ ] npm 12 a bloqué le script d'installation de `@sentry/cli` : `npm install-scripts approve @sentry/cli` puis `npm install` (utile uniquement pour l'upload local de source maps).

**PostHog**
- [ ] eu.posthog.com → projet → clé → `EXPO_PUBLIC_POSTHOG_KEY` (`.env` + EAS). Le bandeau de consentement apparaît automatiquement dès que la clé est définie.

---

## Étape 7 : domaine et site web

- [ ] Acheter le domaine (Cloudflare Registrar, OVH… environ 10 à 15 €/an).
- [ ] Déployer sur EAS Hosting :
  ```bash
  npm run deploy:web     # 1ʳᵉ fois : choisir un sous-domaine .expo.app
  ```
  puis rattacher le domaine personnalisé depuis expo.dev → *Hosting*.
  *(Alternative : Vercel, Netlify ou Cloudflare Pages avec `dist/` comme dossier de sortie ; prévoir une réécriture de `/company/*` vers `/company/[id].html`.)*
- [ ] Mettre à jour avec le vrai domaine :
  - `.env` + EAS : `EXPO_PUBLIC_SITE_URL`, `EXPO_PUBLIC_TURNSTILE_ORIGIN`
  - Supabase *Site URL* + *Redirect URLs* (`https://<domaine>/**`)
  - Google : domaine autorisé dans l'écran de consentement OAuth ; Apple : domaine dans le Services ID
  - Turnstile : domaines autorisés
  - `constants/app.ts` : adresses `contact@` et `signalement@` (à créer, ex. routage email Cloudflare gratuit)

---

## Étape 8 : juridique (avant toute mise en ligne publique)

- [ ] Compléter tous les `[À COMPLÉTER]` de `i18n/locales/fr/legal.json` **et** les `[TO COMPLETE]` de `i18n/locales/en/legal.json` (éditeur, directeur de publication, hébergeurs, région Supabase, garanties de transfert OpenAI, juridiction, date).
- [ ] **Point à arbitrer avec un juriste** : la LCEN impose de conserver pendant un an certaines données d'identification des auteurs de contenus, alors que la suppression de compte efface tout immédiatement (cascade SQL). Options : conserver une trace minimale (email haché + date) dans une table dédiée purgée à 1 an, ou valider l'approche actuelle. Toute évolution passe par pré-vol, migration idempotente et rollback.
- [ ] Faire relire CGU + politique de confidentialité (les deux langues), tenir un registre des traitements (modèle CNIL).

---

## Étape 9 : stores

### Comptes (les seuls coûts incontournables)
- [ ] **Apple Developer Program** : 99 €/an, obligatoire pour TestFlight et l'App Store.
- [ ] **Google Play Console** : 25 $ une fois. Les nouveaux comptes personnels doivent faire un **test fermé de 14 jours avec 12 testeurs** avant la production : à anticiper.

### Assets
- [x] Visuels dans `assets/images/` générés depuis le logo WorkFloor : `icon.png` (1024×1024, sans transparence), `android-icon-foreground.png` / `-background.png` / `-monochrome.png`, `favicon.png`, `logo-mark.png` / `logo-mark-light.png`. Le splash natif n'a volontairement pas d'image (fond seul) : le logo est affiché par `LaunchSplash`, jamais au premier lancement.
- [ ] Captures d'écran et textes : tout est préparé dans [store/metadata.md](store/metadata.md). Fiches en français et en anglais.

### Avant soumission : checklist UGC Apple
- [ ] Signalement fonctionnel sur un build réel (menu « … » → Signaler)
- [ ] Masquage d'auteur fonctionnel (menu « … » → Masquer, avec « Annuler » pendant 3 s)
- [ ] Suppression de compte fonctionnelle (Mon compte)
- [ ] Pages `/legal/terms` et `/legal/privacy` en ligne sur le domaine
- [ ] Compte de démonstration avec un avis publié, identifiants fournis dans les notes de review

### Soumission
```bash
npx eas-cli build --profile production --platform all
npx eas-cli submit --platform ios      # demande la connexion Apple la 1ʳᵉ fois
npx eas-cli submit --platform android  # nécessite une clé de compte de service Google (voir doc EAS Submit)
```

---

## Étape 10 : CI/CD (quand le repo est sur GitHub)

- [ ] Créer le repo GitHub et pousser le code, puis relier le repo au projet sur expo.dev → *GitHub*.
- [ ] Workflows fournis (à vérifier au premier lancement) :
  - `.eas/workflows/main.yml` : à chaque push sur `main`, EAS Update (correctifs JS OTA) + déploiement web.
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
| Emails transactionnels métier | Seuls les emails d'auth passent par Resend (SMTP). |
| Colonne `companies.sector` | Obsolète (le secteur est déduit du code NAF et traduit) ; à retirer plus tard en deux temps. |
