# Lancement : ce qu'il te reste à faire

Tout ce qui demande **tes comptes, tes décisions ou ton argent**, dans l'ordre. Le code est prêt ; les procédures techniques détaillées (commandes, écrans du dashboard) sont dans [SETUP.md](SETUP.md).

> 📱 **Première version : mobile uniquement (iOS + Android), sans nom de domaine.** Le code web reste en place (utile pour développer), mais rien n'est déployé sur le web. Conséquences : les emails passent par une boîte Gmail dédiée (étape 4), et les trois pages publiques exigées par les stores sont hébergées gratuitement (étape 5).

> ⏱️ **Google** : un compte Play **créé après le 13 novembre 2023** doit faire tester l'app par 12 personnes pendant 14 jours. Le compte entreprise utilisé ici a déjà publié une app, ce test ne devrait pas être exigé : **c'est Play Console qui tranche** (*Tester et déployer → Aperçu des tests*).

---

## 1. Voir l'app avec du contenu

- [ ] Remplir la base avec les données de démo (entreprises **inventées**, SIREN impossibles, auteurs qui ne peuvent pas se connecter) :
  1. `npm run db:demo:preflight` : toutes les lignes doivent avoir `ok = true`. Sinon, **m'envoyer le résultat**.
  2. `npm run db:demo:seed` : la dernière requête liste 9 fiches.
  3. Pour les retirer : `npm run db:demo:remove`.
- [ ] Repartir d'une base vide (toutes les données, schéma conservé) : `npm run db:backup`, `npm run db:purge:preflight`, puis confirmer dans `supabase/maintenance/20260915000300_purge_all_data.sql` et `npm run db:purge`. **Irréversible.**
- [ ] Photos des cartes « Explorer par secteur » : `npm run db:sector-photos:preflight` (`ok = true` partout), puis `npx supabase db push`. Changer une photo : *Table Editor → sector_photos*, colonne `image_url`.
- [ ] Revoir l'onboarding : onglet Compte → *Outils de développement* → « Lancer l'onboarding ».

## 2. Supabase

- [x] Migrations appliquées, Edge Functions déployées, secrets envoyés (`OPENAI_API_KEY`, `IP_HASH_SALT`).
- [x] *Authentication* : Confirm email désactivé, mot de passe 8 caractères minimum.
- [x] *Redirect URLs* : `workfloor://**` et `exp://**` (le lien « mot de passe oublié » ouvre désormais l'app par `workfloor://reset-password`, plus besoin de site). `http://localhost:8081/**` ne sert qu'au développement web.
- [x] Région du projet : `eu-west-3` (Paris), reprise dans la politique de confidentialité et les mentions légales.

## 3. Connexion Google et Apple

- [x] Providers Google et Apple configurés et testés sur le dev build.
- [ ] Google Cloud : passer l'écran de consentement OAuth en **In production** avant la sortie (sinon seuls les comptes de test peuvent se connecter). Sans domaine, laisser vides les champs « domaine autorisé » et « page d'accueil » ou y mettre l'URL de la page de confidentialité (étape 5).
- [ ] 📅 Rappel dans 6 mois : régénérer la Secret Key Apple dans Supabase (sinon la connexion Apple tombe en panne).

## 4. Emails (sans domaine)

**Pourquoi c'est bloquant** : sans serveur SMTP personnalisé, Supabase n'envoie des emails **qu'aux membres de l'équipe du projet** (et 2 par heure). Pour un vrai utilisateur, « mot de passe oublié » échoue avec « Email address not authorized ».

**Deux adresses, deux rôles** :
- [x] **Réception** : `workfloor@tutamail.com`, affichée dans l'app, les CGU et les pages publiques (`constants/app.ts` : contact, droits RGPD, contestation de modération, signalements, point de contact DSA). Penser à la relever régulièrement.
- [ ] **Envoi** : Tuta ne propose pas de SMTP, et `tutamail.com` publie une politique DMARC stricte (`p=quarantine`) : un email « de » cette adresse envoyé par un autre service finirait en spam. Les emails de « mot de passe oublié » partent donc d'une adresse Gmail dédiée à l'envoi (ex. `workfloor.noreply@gmail.com`), avec la **validation en deux étapes** activée. Personne n'a besoin d'y écrire : le modèle d'email renvoie vers `workfloor@tutamail.com`.

- [ ] Gmail → *Compte Google → Sécurité → Mots de passe des applications* : créer un mot de passe d'application.
- [ ] Supabase *Authentication → Emails → SMTP Settings* : hôte `smtp.gmail.com`, port `465`, utilisateur = l'adresse Gmail, mot de passe = le mot de passe d'application, expéditeur = l'adresse Gmail, nom `WorkFloor`. Limite Gmail : environ 500 emails par jour, largement suffisant (seul « mot de passe oublié » envoie des emails).
- [ ] *Authentication → Rate Limits* : vérifier la limite d'envoi d'emails (30 par heure par défaut une fois le SMTP branché), à ajuster si besoin.
- [ ] *Email Templates → Reset password* : texte bilingue fr / en (Supabase n'envoie qu'une langue par modèle), avec la mention « Ne répondez pas à cet email, écrivez à workfloor@tutamail.com ».
- [ ] Tester sur un **build** (pas Expo Go) : « Mot de passe oublié » → email → le lien ouvre l'app sur l'écran de nouveau mot de passe.

## 5. Pages publiques exigées par les stores

Les textes sont lisibles dans l'app (Compte → liens légaux), mais les stores exigent aussi des **URL publiques** :

| Page | URL | Exigée par |
| --- | --- | --- |
| Confidentialité | `https://skyblob12.github.io/WorkFloor/privacy.html` | Apple et Google |
| Assistance | `https://skyblob12.github.io/WorkFloor/` | Apple (URL de support) |
| Suppression de compte | `https://skyblob12.github.io/WorkFloor/delete-account.html` | Google |
| Versions anglaises | même adresse avec `/en/` (ex. `.../WorkFloor/en/privacy.html`) | fiches en-US |

Les pages sont **générées depuis les mêmes traductions que l'app** (`i18n/locales/*/legal.json`) par `npm run legal:site` (aperçu local dans `dist-legal/`), puis publiées gratuitement sur GitHub Pages à chaque push sur `main` qui modifie ces textes (`.github/workflows/legal-site.yml`). Une seule source de vérité : corriger un texte dans `legal.json` met à jour l'app et les pages.

- [ ] Une seule fois : GitHub → dépôt `SkyBlob12/WorkFloor` → *Settings → Pages* → *Source* : **GitHub Actions**.
- [ ] Pousser sur `main`, puis vérifier l'onglet *Actions* (workflow « Pages légales ») et ouvrir les trois URL.
- [ ] ⚠️ Tant que les `[À COMPLÉTER]` ne sont pas remplis, ils sont visibles publiquement : le script les compte et avertit. Idéalement, compléter l'identité (étape 6) avant le premier push.
- Le dépôt est public : ne jamais y committer de secret (`.env`, `supabase/functions/.env` sont ignorés par Git).

## 6. Juridique (bloquant pour les stores)

Les textes de `i18n/locales/fr/legal.json` et `i18n/locales/en/legal.json` sont rédigés pour une app mobile éditée par un **entrepreneur individuel (micro-entrepreneur)**, données hébergées à Paris (`eu-west-3`). À faire :

- [ ] Remplacer les derniers `[À COMPLÉTER]` / `[TO COMPLETE]` (mêmes valeurs en français et en anglais) : prénom et nom, adresse, téléphone, SIRET, date de mise en ligne. En tant que professionnel, **l'adresse et le téléphone sont obligatoires** dans les mentions légales (LCEN, art. 6-III) : pas d'anonymat possible, contrairement à un particulier. Pour ne pas publier ton adresse personnelle, une **domiciliation** (adresse commerciale) est possible, elle servira aussi pour Apple.
- [ ] Mention de TVA (`[À VÉRIFIER]`) : garder « TVA non applicable, article 293 B du CGI » seulement si tu es en franchise en base de TVA ; sinon, la remplacer par ton numéro de TVA intracommunautaire.
- [ ] Faire valider par le juriste (les deux langues), en particulier :
  - **Conservation LCEN** (`[À VALIDER PAR LE JURISTE]`, politique de confidentialité section 5) : le décret n° 2021-1362 impose de garder un an les données d'identification des auteurs, alors que l'app efface tout immédiatement à la suppression du compte, et que l'IP n'est gardée que hachée (inexploitable par un juge) 30 jours. Selon sa réponse, Claude écrira la migration (table séparée, purge à un an) avec pré-vol et rollback.
  - **DSA** : exposé des motifs à l'auteur d'un avis retiré (aujourd'hui sur demande par email), contestation, point de contact unique. En micro-entreprise, l'éditeur est exempté de la plupart des obligations propres aux plateformes en ligne.
  - Adresse de contact chez Tuta (Tutao GmbH, Allemagne) et pages hébergées par GitHub (États-Unis) : mentionnées comme prestataires.
  - **Médiation de la consommation** : obligatoire ou non pour un service gratuit.
  - Sous-traitants listés (Sentry et PostHog : les retirer du texte s'ils ne sont pas activés en production).
- [ ] **Statut de commerçant (DSA)** dans App Store Connect : obligatoire pour être distribué dans l'UE. En micro-entreprise, tu es commerçant au sens du DSA : **ton nom, ton adresse, ton téléphone et ton email sont affichés publiquement** sur la fiche App Store (d'où l'intérêt d'une domiciliation et de `workfloor@tutamail.com`). Google Play affiche aussi les coordonnées du développeur.
- [ ] Tenir un registre des traitements (modèle CNIL).

## 7. Visuels et textes des stores

- [ ] Captures d'écran **avec de vraies données** (pas celles de démo) : iPhone 6,9" (1320 × 2868) et Android (1080 × 1920 min.). Liste et légendes dans [store/metadata.md](store/metadata.md).
- [ ] Image de présentation Play Store 1024 × 500, icône 512 × 512.
- [ ] Relire les textes, mots-clés et tableaux de confidentialité de [store/metadata.md](store/metadata.md).

## 8. Google Play

- [x] Application créée : `fr.workfloor.app`.
- [ ] Variables `EXPO_PUBLIC_*` déclarées dans EAS pour `preview` et `production` (les builds cloud ne lisent pas `.env`). `EXPO_PUBLIC_SITE_URL` n'est plus utilisée : la supprimer si elle existe (`npx eas-cli env:delete`).
- [ ] Build : `npx eas-cli build --platform android --profile production`.
- [ ] ⚠️ **Premier envoi à la main** : l'API Google refuse le tout premier fichier d'une app. Télécharger le `.aab` depuis expo.dev et l'importer dans *Tester et déployer → Tests internes*. `eas submit` fonctionne à partir du deuxième.
- [ ] Clé de compte de service Google (pour `eas submit`) : Google Cloud → compte de service → clé JSON → l'inviter dans Play Console *Utilisateurs et autorisations*, puis `npx eas-cli credentials` pour l'enregistrer dans EAS.
- [ ] *Contenu de l'application* :
  - Politique de confidentialité : URL de l'étape 5.
  - Accès à l'app : compte de test email + mot de passe (publication, vote, signalement sont derrière la connexion).
  - Publicités : non. Classification IARC : « les utilisateurs interagissent / partagent du contenu ».
  - Public cible : tranches « 16-17 ans » et « 18 ans et plus », cohérent avec l'âge minimum des CGU (les règles « Familles » ne concernent que les moins de 13 ans).
  - Sécurité des données : tableau de `store/metadata.md`.
  - **Suppression de compte** : URL de l'étape 5.
- [ ] Fiche du store : descriptions, icône, image de présentation, captures.
- [ ] Vérifier si un test fermé est exigé (*Aperçu des tests*). Sinon : promouvoir la version des tests internes vers la production.

## 9. App Store (Apple)

- [ ] App Store Connect → *Nouvelle app* : iOS, WorkFloor, langue principale français, bundle `fr.workfloor.app`, SKU au choix.
- [ ] *Contrats, taxes et banque* : contrat des apps gratuites accepté.
- [ ] Statut de commerçant (DSA), voir étape 6.
- [ ] *Confidentialité de l'app* : reprendre `store/metadata.md`. Suivi publicitaire : non. URL de confidentialité : étape 5.
- [ ] Classification d'âge : répondre « oui » au contenu généré par les utilisateurs (modération, signalement et blocage existent).
- [ ] Catégorie Économie et entreprise, prix gratuit, URL de support : étape 5.
- [ ] Build et envoi : `npx eas-cli build --platform ios --profile production` puis `npx eas-cli submit --platform ios`.
- [ ] Pour le workflow automatique (`.eas/workflows/release-stores.yml`) : ajouter l'identifiant Apple de l'app (*App Store Connect → Informations sur l'app → Identifiant Apple*) dans `eas.json`, `submit.production.ios.ascAppId`. Sans lui, la soumission non interactive échoue.
- [ ] **TestFlight** : tester sur un vrai iPhone la connexion Apple, Google, email, « mot de passe oublié », un avis publié, le signalement, le masquage d'auteur, la suppression du compte.
- [ ] *Informations pour la review* : compte de démo email + mot de passe avec un avis publié, et les notes de `store/metadata.md`.
- [ ] Soumettre. Compter 1 à 3 jours ; motifs de rejet fréquents : compte de démo qui ne marche pas, signalement ou blocage introuvable, contenu factice, URL de confidentialité ou de support inaccessible.

## 10. Juste avant d'ouvrir au public

- [ ] **Supprimer les données de démo** : `npm run db:demo:remove` (attendu : 0 et 0).
- [ ] Publier quelques vrais avis toi-même ou avec des proches, sur de vraies entreprises (une app vide est un motif de rejet et fait fuir).
- [ ] Sentry et PostHog (optionnels) : DSN et clé dans `.env` et EAS (SETUP étape 5).
- [ ] Routine de modération : table `reviews` en `pending`, table `reports` en `open` (SETUP étape 1.5), et boîte `abuseEmail` relevée régulièrement.
- [ ] ⚠️ Chaque push sur `main` publie une mise à jour OTA aux apps installées (`.eas/workflows/main.yml`), dès que le repo est relié à EAS.

---

## Délais à anticiper

| Étape | Délai |
| --- | --- |
| Validation juridique | selon le juriste |
| Test fermé Google (si exigé) | 14 jours minimum |
| Review Google (première publication) | quelques heures à 7 jours |
| Review Apple | 1 à 3 jours, plus en cas de rejet |
| Secret Apple dans Supabase | à régénérer tous les 6 mois |
