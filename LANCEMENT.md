# Lancement : ce qu'il te reste à faire

Tout ce qui demande **tes comptes, tes décisions ou ton argent**, dans l'ordre. Le code est prêt ; les procédures techniques détaillées (commandes, écrans du dashboard) sont dans [SETUP.md](SETUP.md).

> ⏱️ **Le chemin le plus long, c'est Google** : un compte Play personnel doit faire tester l'app par 12 personnes pendant 14 jours d'affilée avant de pouvoir publier. Lance ce test fermé (étape 7) dès qu'un build Android tourne, en parallèle du reste.

---

## 1. Tout de suite : voir l'app avec du contenu

- [ ] Relancer avec le cache vidé : `npx expo start -c`.
- [ ] Remplir la base avec les données de démo (entreprises **inventées**, SIREN impossibles, auteurs qui ne peuvent pas se connecter) :
  1. Une fois : `npx supabase login` (le projet est déjà lié).
  2. `npm run db:demo:preflight` : toutes les lignes doivent avoir `ok = true`. Sinon, **m'envoyer le résultat**.
  3. `npm run db:demo:seed` : la dernière requête liste 9 fiches.
  4. Pour les retirer : `npm run db:demo:remove`.
- [ ] Repartir d'une base vide (toutes les données, schéma conservé) : `npm run db:backup`, `npm run db:purge:preflight`, puis confirmer dans `supabase/maintenance/20260915000300_purge_all_data.sql` et `npm run db:purge`. **Irréversible.**
- [ ] Photos des cartes « Explorer par secteur » (sinon les cartes gardent leur pictogramme) :
  1. `npm run db:sector-photos:preflight` : toutes les lignes doivent avoir `ok = true`. Sinon, **m'envoyer le résultat**.
  2. `npx supabase db push` (applique `20260916000000_sector_photos`).
  3. Changer une photo : *Table Editor → sector_photos*, colonne `image_url` (URL en `https://`). Annuler : `supabase/rollbacks/20260916000000_sector_photos.sql`.
- [ ] Revoir l'onboarding : onglet Compte → *Outils de développement* → « Lancer l'onboarding ».

## 2. Supabase : vérifier la configuration

Rien ici ne se voit dans le code : vérifier dans le dashboard (projet `jcxragsifxcifxryoqvq`).

- [ ] Migrations appliquées (`npx supabase db push`, ou pré-vol de [SETUP.md](SETUP.md) étape 1.2).
- [ ] Edge Functions déployées et secrets envoyés (`TURNSTILE_SECRET_KEY`, `OPENAI_API_KEY`, `IP_HASH_SALT`) : SETUP 1.4.
- [ ] *Authentication → Sign In / Providers → Email* : **Confirm email désactivé**, mot de passe 8 caractères minimum.
- [ ] *URL Configuration → Redirect URLs* : `http://localhost:8081/**`, `workfloor://**`, `exp://**`.
- [ ] *Attack Protection → Captcha* : Turnstile.
- [ ] Région du projet dans l'UE (*Project Settings → General*).

## 3. Connexion Google et Apple

Adresse de retour à déclarer partout : `https://jcxragsifxcifxryoqvq.supabase.co/auth/v1/callback`. Aucun secret ne doit transiter par le code ou par Claude : tout va dans le dashboard Supabase.

**Google** (console.cloud.google.com)
- [ ] Écran de consentement OAuth : type *External*, nom, logo, email de support.
- [ ] Identifiant OAuth de type **Web application** avec l'adresse de retour ci-dessus.
- [ ] Supabase → provider Google : Client ID + Client Secret.
- [ ] Avant la mise en ligne : passer l'écran de consentement en **In production** (sinon seuls les comptes de test peuvent se connecter).

**Apple** (developer.apple.com)
- [ ] App ID `fr.workfloor.app` : capacité **Sign in with Apple**.
- [ ] Services ID (ex. `fr.workfloor.web`) : domaine `jcxragsifxcifxryoqvq.supabase.co` + adresse de retour.
- [ ] Clé *Sign in with Apple* : télécharger le `.p8`, noter Key ID et Team ID.
- [ ] Supabase → provider Apple : Client IDs `fr.workfloor.app,host.exp.Exponent,fr.workfloor.web`, Secret Key générée depuis le `.p8`.
- [ ] 📅 Rappel dans 6 mois : régénérer la Secret Key (sinon Apple tombe en panne sur Android et web).

## 4. Domaine, site web, emails

- [ ] Acheter le domaine (ex. `workfloor.fr`).
- [ ] Déployer le site : `npm run deploy:web`, puis rattacher le domaine dans expo.dev → *Hosting*.
- [ ] Remplacer `localhost` par le domaine : `.env` + variables EAS (`EXPO_PUBLIC_SITE_URL`, `EXPO_PUBLIC_TURNSTILE_ORIGIN`), Supabase *Site URL* + *Redirect URLs*, domaines Turnstile, écran de consentement Google, Services ID Apple.
- [ ] Créer `contact@` et `signalement@` (routage email Cloudflare, gratuit) et mettre à jour `constants/app.ts`.
- [ ] Emails Supabase via Resend (SMTP) : SETUP étape 5. Seul « mot de passe oublié » envoie encore des emails.

## 5. Juridique (bloquant pour les stores)

- [ ] Compléter les `[À COMPLÉTER]` de `i18n/locales/fr/legal.json` et les `[TO COMPLETE]` de `i18n/locales/en/legal.json` : éditeur, directeur de publication, hébergeurs, région Supabase, transferts OpenAI, juridiction, date.
- [ ] Vérifier que `https://<domaine>/legal/terms` et `/legal/privacy` sont en ligne : Apple et Google les demandent.
- [ ] Trancher avec un juriste la conservation LCEN d'un an des données d'identification des auteurs (SETUP étape 8).
- [ ] **Statut de commerçant (DSA)** dans App Store Connect : obligatoire pour être distribué dans l'UE. Si tu te déclares commerçant, ton adresse et ton téléphone sont affichés publiquement ; à décider avant la soumission (micro-entreprise, adresse de domiciliation…).

## 6. Visuels et textes des stores

- [ ] Icône 1024 × 1024 sans transparence, icônes adaptatives Android, splash : remplacer les fichiers de `assets/images/`.
- [ ] Captures : iPhone 6,9" (1320 × 2868) et Android (1080 × 1920 min.) : onboarding, accueil, fiche entreprise, avis, formulaire, compte. Faire les captures **avec de vraies données**, pas celles de démo.
- [ ] Image de présentation Play Store 1024 × 500.
- [ ] Relire les textes, mots-clés et tableaux de confidentialité de [store/metadata.md](store/metadata.md).

## 7. Google Play (commencer tôt)

- [ ] Play Console : vérification d'identité terminée.
- [ ] *Créer une application* : nom WorkFloor, langue par défaut français, application gratuite.
- [ ] Expo : `npx eas-cli login`, `npx eas-cli init`, variables `EXPO_PUBLIC_*` déclarées dans EAS (SETUP étape 4).
- [ ] Premier build : `npx eas-cli build --platform android --profile production`.
- [ ] Clé de compte de service Google (pour `eas submit`) : Google Cloud → compte de service → l'inviter dans Play Console *Utilisateurs et autorisations*.
- [ ] *Contenu de l'application* :
  - Politique de confidentialité (URL).
  - Accès à l'app : fournir un compte de test email + mot de passe (publication, vote, signalement sont derrière la connexion).
  - Publicités : non. Classification IARC : cocher « les utilisateurs interagissent / partagent du contenu ».
  - Public cible : adultes (pas d'enfants).
  - Sécurité des données : reprendre le tableau de `store/metadata.md`.
  - **Suppression de compte** : Google exige aussi une **URL web** où demander la suppression (ex. `https://<domaine>/account`, avec les étapes à suivre).
- [ ] Fiche du store : descriptions, icône 512 × 512, image 1024 × 500, captures.
- [ ] **Test fermé** : créer une liste de 12 testeurs (groupe Google), publier le build sur ce canal, les faire accepter l'invitation et **garder l'app installée 14 jours**.
- [ ] Puis *Demander l'accès à la production* (questionnaire sur le test), et publier.

## 8. App Store (Apple)

- [ ] App Store Connect → *Apps* → *Nouvelle app* : iOS, WorkFloor, langue principale français, bundle `fr.workfloor.app`, SKU au choix.
- [ ] *Contrats, taxes et banque* : contrat des apps gratuites accepté.
- [ ] Statut de commerçant (DSA), voir étape 5.
- [ ] *Confidentialité de l'app* : reprendre `store/metadata.md`. Suivi publicitaire : non.
- [ ] Classification d'âge : répondre « oui » au contenu généré par les utilisateurs (modération, signalement et blocage existent).
- [ ] Catégorie Économie et entreprise, prix gratuit, URLs de support et de confidentialité.
- [ ] Build et envoi : `npx eas-cli build --platform ios --profile production` puis `npx eas-cli submit --platform ios`.
- [ ] **TestFlight** : tester sur un vrai iPhone la connexion Apple, Google, email, un avis publié, le signalement, le masquage d'auteur, la suppression du compte.
- [ ] *Informations pour la review* : compte de démo email + mot de passe avec un avis publié, et les notes de `store/metadata.md`.
- [ ] Soumettre. Compter 1 à 3 jours ; motifs de rejet fréquents : compte de démo qui ne marche pas, signalement ou blocage introuvable, contenu factice.

## 9. Juste avant d'ouvrir au public

- [ ] **Supprimer les données de démo** : `npm run db:demo:remove` (attendu : 0 et 0).
- [ ] Publier quelques vrais avis toi-même ou avec des proches, sur de vraies entreprises (une app vide est un motif de rejet et fait fuir).
- [ ] Sentry et PostHog (optionnels) : DSN et clé dans `.env` et EAS (SETUP étape 6).
- [ ] Routine de modération : table `reviews` en `pending`, table `reports` en `open` (SETUP étape 1.5).
- [ ] Brancher le repo GitHub sur EAS pour les mises à jour automatiques (SETUP étape 10).

---

## Délais à anticiper

| Étape | Délai |
| --- | --- |
| Test fermé Google (12 testeurs) | 14 jours minimum |
| Accès à la production Google | quelques jours après la demande |
| Review Apple | 1 à 3 jours, plus en cas de rejet |
| Propagation DNS du domaine | jusqu'à 24 h |
| Secret Apple (connexion Android / web) | à régénérer tous les 6 mois |
