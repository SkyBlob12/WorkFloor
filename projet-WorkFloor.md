# Projet : Plateforme d'avis d'entreprises (type Glassdoor, moins restrictive)

## Contexte du projet

Application permettant aux utilisateurs de laisser des avis anonymes sur des entreprises (notes, salaire, ambiance, avantages...), dans l'esprit de Glassdoor mais avec une modération plus légère.

**Contraintes principales :**
- Disponible sous quelques jours
- Facile d'installation pour tout le monde
- Coût d'utilisation à 0€ pour démarrer
- Doit fonctionner sur **iOS, Android et Web**, avec un design responsive sur les trois

## Choix technique : Expo (React Native)

### Fonctionnement d'Expo

- **Expo (React Native)** : un seul code JS/TS compilé en app native iOS + Android
- **Expo pour le Web** : Expo utilise `react-native-web` sous le capot, donc le même code source (composants, navigation, logique) tourne aussi comme site web (`npx expo export --platform web` ou `npx expo start --web`), sans réécrire une app séparée
- **EAS (Expo Application Services)** : build dans le cloud, pas besoin de Mac pour compiler iOS
- **Publication sur les stores** : App Store (review Apple, quelques jours) et Play Store (review Google, souvent plus rapide) via EAS Submit
- **Déploiement de la version web** : export statique hébergeable sur Vercel/Netlify/Cloudflare Pages (gratuit), ou EAS Hosting (service Expo dédié, plan gratuit disponible)
- **Distribution de test avant publication** (optionnel, utile pour valider avant soumission finale) :
  - iOS : **TestFlight**, lien direct, installation en quelques taps, limité à 100 testeurs internes et expire après 90 jours
  - Android : **APK direct**, lien de téléchargement, installation immédiate (activer "sources inconnues" une fois)

### Point de vigilance : responsive sur les 3 plateformes

- Le code est partagé, mais l'affichage doit s'adapter à trois formats très différents : mobile portrait (iOS/Android), et desktop large écran (Web), prévoir des breakpoints avec `useWindowDimensions` ou des libs comme `react-native-flex-layout`, plutôt que de designer uniquement pour un écran de téléphone
- Certains composants natifs (SF Symbols, effets de flou iOS, certaines animations) n'ont pas toujours un équivalent web fidèle, à tester spécifiquement sur chaque plateforme, pas seulement sur mobile
- La navigation tactile (swipe, tab bar en bas) doit avoir un équivalent utilisable à la souris/clavier sur web (menu latéral ou top bar plutôt que tab bar collée en bas d'écran, par exemple)

### Point de vigilance : test sur device en développant depuis VS Code
- L'extension Claude Code tourne côté éditeur : pour voir l'app tourner, il faudra lancer le serveur de dev Expo (`npx expo start`) et scanner le QR code avec **Expo Go** depuis ton iPhone et ton Android physiques, l'extension aide à écrire/déboguer le code, mais ne remplace pas ce test réel
- Avec les deux appareils physiques, pas besoin de simulateur iOS ni d'émulateur Android : tu testes directement en conditions réelles sur les deux OS, ce qui est même plus fiable qu'un simulateur pour les aspects tactiles/perf
- Pour le web, `npx expo start --web` ouvre directement dans le navigateur, penser à tester aussi en redimensionnant la fenêtre (ou via les outils dev du navigateur en mode responsive) pour vérifier le comportement mobile/desktop du web
- Limite à connaître : Expo Go ne permet pas de tester du code natif custom (modules natifs non supportés par Expo Go) ; si un jour tu ajoutes une lib nécessitant ça, il faudra passer à un **development build** (via EAS Build) installé directement sur les deux téléphones

### Point de vigilance : délais de review

- Prévoir le délai de review Apple (souvent quelques jours, parfois plus en cas de rejet à corriger) dans le planning
- Bien remplir les métadonnées et captures d'écran dès le premier envoi pour limiter les allers-retours
- Anticiper les guidelines Apple/Google sur le contenu généré par les utilisateurs (obligation d'un système de modération/signalement pour ce type d'app, sous peine de rejet)

### Spécificités store pour une app avec contenu utilisateur (UGC)

- **Classification d'âge** : les apps avec contenu généré par les utilisateurs non modéré a priori sont souvent classées 17+ (App Store) / PEGI 16 (Play Store), à anticiper dans le formulaire de soumission
- **Apple est particulièrement strict sur l'UGC** : contrairement à un simple engagement futur, le bouton de signalement et le mécanisme de blocage d'un contenu/utilisateur doivent être **fonctionnels dans le build soumis**, pas seulement prévus pour plus tard, sinon rejet quasi systématique

### Assets pour les stores

À préparer en amont, souvent sous-estimé en temps :
- Icône de l'app (plusieurs tailles générées automatiquement par EAS à partir d'un fichier source)
- Splash screen
- Captures d'écran pour chaque taille d'appareil requise (iPhone, iPad si applicable, Android)
- Description courte et longue, mots-clés (App Store), catégorie

## Fonctionnalités prévues

- Recherche / liste d'entreprises
- Fiche entreprise avec avis (notes, salaire, ambiance, avantages...)
- Formulaire de dépôt d'avis (anonymisé)
- Compte utilisateur (anti-spam, sans exposition publique de l'identité)
- Vote "utile" sur les avis

### Accès invité vs compte requis

- **Consultation libre en invité** : recherche, liste d'entreprises, fiches, lecture des avis, accessible sans créer de compte, pour maximiser l'adoption et le référencement du contenu
- **Compte obligatoire pour toute action de contribution** : ajouter une note, déposer un commentaire/avis, voter "utile", signaler un contenu
- Implémentation avec Supabase Auth : les routes de lecture restent publiques (RLS en lecture ouverte), les routes d'écriture vérifient une session utilisateur active (RLS en écriture restreinte aux utilisateurs authentifiés)

### Alimentation des données entreprises

- **API SIRENE (INSEE)**, gratuite et officielle, permet de récupérer nom, SIRET, secteur d'activité des entreprises françaises directement, plutôt que de tout ressaisir à la main. Donne aussi une légitimité ("entreprise vérifiée") face à des fiches créées librement par les utilisateurs
- **Gestion des doublons** : vérifier par SIRET (identifiant unique) avant de permettre la création d'une fiche entreprise, pour qu'une même entreprise ne se retrouve pas dupliquée avec des avis éparpillés

## Points de vigilance juridiques (à garder en tête, pas bloquants)

- **Diffamation** : éviter que les avis nomment des personnes physiques précises avec des accusations ; limiter aux faits sur l'entreprise
- **Anonymat réel vs perçu** : bien séparer les données d'identification (IP, email) du contenu publié
- **Statut d'hébergeur vs éditeur** (droit FR/UE) : prévoir un bouton de signalement et un moyen de retirer un contenu clairement illégal sur demande, même sans modération a priori

### RGPD

- **Politique de confidentialité + CGU** : obligatoires, et exigées explicitement par Apple et Google à la soumission (lien à fournir dans le formulaire de review)
- **Droit à l'effacement** : un utilisateur doit pouvoir supprimer son compte et l'ensemble de ses données (avis compris, ou au minimum les anonymiser)
- **Localisation des données** : vérifier la région choisie pour le projet Supabase (privilégier une région UE pour simplifier la conformité RGPD)
- **Durée de conservation** : définir combien de temps sont gardés les logs et éventuelles IP stockées à des fins anti-abus, et le documenter dans la politique de confidentialité

## Stack technique (coût 0€ pour démarrer)

### Frontend / App
- **Expo (React Native + TypeScript)**, un seul code pour iOS + Android + Web (via `react-native-web`)
- **Expo Router** pour la navigation, fonctionne aussi en web (génère des vraies routes/URLs)
- **NativeWind** (Tailwind pour React Native) pour aller vite sur le style, compatible web
- **EAS Build** (plan gratuit avec quota limité/mois) pour compiler dans le cloud sans Mac
- **EAS Submit** le moment venu, pour publier sur les stores
- **Hébergement web** : export statique déployé sur Vercel/Netlify/Cloudflare Pages (gratuit) ou EAS Hosting

### Backend + Base de données + Auth
- **Supabase** (plan gratuit) :
  - Postgres (500 Mo)
  - Auth intégrée (email/password, magic link, ou anonyme), SDK JS compatible React Native
  - Row Level Security (RLS) pour gérer l'anonymat des avis
  - Recherche full-text native (pas besoin d'Algolia au départ)

### Notifications push
- **Expo Push Notifications** (service gratuit d'Expo), gère l'envoi vers APNs (iOS) et FCM (Android) via une seule API, pas besoin de configurer les deux séparément au départ

### Anti-spam / anti-bot
- **Cloudflare Turnstile**, équivalent gratuit de reCAPTCHA, respectueux de la vie privée
- **Règle métier : un avis par utilisateur par entreprise**, à faire respecter côté base (contrainte unique `user_id + entreprise_id`), sinon un même compte peut spammer une fiche
- **Édition/suppression de son propre avis**, l'utilisateur doit pouvoir corriger ou retirer ce qu'il a posté, pas seulement les modérateurs
- **Rate limiting** sur la création de compte et le dépôt d'avis (au-delà du captcha), Supabase Edge Functions permet d'ajouter cette limite simplement

### Modération de contenu
- **API de modération OpenAI** (`omni-moderation-latest`), gratuite, détecte harcèlement/contenu haineux
- Liste de mots-clés interdits maison en complément (noms propres, insultes)

### Emails transactionnels
- **Resend** (plan gratuit, 3000 emails/mois), s'intègre facilement via API REST, utilisable depuis n'importe quel backend

### Observabilité
- **Sentry** (plan gratuit), crash reporting, quasi indispensable dès la mise en prod pour ne pas être aveugle sur les bugs remontés par les utilisateurs
- **PostHog** (plan gratuit), analytics basique pour suivre l'usage réel (pages vues, rétention, funnel d'inscription)

### CI/CD et mises à jour
- **EAS Update**, pousse des correctifs JS instantanément sur les apps déjà installées, sans repasser par la review des stores (très utile pour corriger vite juste après le lancement)
- **EAS Workflows**, automatise build + soumission depuis GitHub (CI/CD), évite de relancer les commandes à la main à chaque nouvelle version

## Nom de domaine

- **Devient nécessaire avec la version Web**, contrairement à une app 100% native, la version web a besoin d'une URL propre à héberger (pas juste une `.vercel.app` si tu veux une image sérieuse dès le lancement, vu le sujet sensible)
- Utile aussi pour :
  - Une adresse email crédible pour les emails transactionnels (`contact@tonapp.com`)
  - Cohérence de marque entre le site web, l'app et les fiches App Store/Play Store
  - SEO si tu comptes sur le référencement naturel (les gens qui cherchent des avis sur une entreprise précise)
- **Coût** : ~10-15€/an (Namecheap, OVH, Cloudflare Registrar à prix coûtant)

## Prochaines étapes suggérées

1. Squelette de projet Expo (Router + NativeWind) + connexion Supabase, avec le mode Web activé dès le départ
2. Définir les breakpoints/layout responsive (mobile vs desktop web) avant de construire les écrans, pour éviter de tout refaire après coup
3. Configuration EAS Build et premier build de test
4. Structure de base de données (entreprises, avis, utilisateurs) + contrainte unique un avis par utilisateur/entreprise
5. Implémentation auth + RLS pour l'anonymat
6. Intégration API SIRENE pour peupler/vérifier les fiches entreprises
7. Formulaire de dépôt d'avis + modération + fonctions d'édition/suppression de son propre avis
8. Mise en place Sentry + PostHog
9. Rédaction politique de confidentialité + CGU (RGPD, droit à l'effacement)
10. Achat du nom de domaine et déploiement de la version web (Vercel/Netlify/Cloudflare Pages ou EAS Hosting)
11. Créer les comptes développeur Apple et Google Play
12. Préparer les assets stores (icône, splash, captures d'écran, description) + classification d'âge
13. Vérifier que le signalement/blocage est fonctionnel avant soumission (exigence Apple sur l'UGC)
14. Soumission App Store + Play Store via EAS Submit
15. Mettre en place EAS Update pour les correctifs rapides post-lancement

## MCP à connecter pour développer avec Claude Code

Développement prévu dans **VS Code avec l'extension Claude Code**. Les commandes ci-dessous s'exécutent telles quelles dans le terminal intégré de VS Code (l'extension partage la même config que le CLI) ; l'extension propose aussi un panneau "Manage MCP Servers" en interface graphique si tu préfères éviter les lignes de commande.

Ces MCP donnent à Claude Code un accès direct à ton projet (Expo/EAS et Supabase) pendant le développement, plus besoin de copier-coller des logs ou du schéma de base à la main.

### Expo MCP Server
Accès en direct à la doc Expo/EAS, à l'historique des builds EAS, aux updates OTA et aux métadonnées TestFlight. Nécessite un compte Expo (et un plan EAS payant pour l'usage complet du MCP).

```
claude mcp add --transport http expo-mcp https://mcp.expo.dev/mcp
```
Puis lancer `/mcp` dans Claude Code pour s'authentifier. Si le plugin Expo officiel est installé (recommandé, ajoute aussi les Expo Skills), le MCP est déjà enregistré automatiquement.

### Supabase MCP Server
Permet à Claude Code d'inspecter le schéma, écrire des requêtes, gérer l'auth et les policies RLS directement en langage naturel.

```
claude mcp add supabase -- npx -y @supabase/mcp-server-supabase@latest --access-token TON_TOKEN_SUPABASE
```
Le token se génère sur `supabase.com/dashboard/account/tokens` (à garder secret, il donne les mêmes droits que le compte).

### Autres MCP utiles selon les besoins
- **GitHub MCP**, gérer issues/PR directement depuis Claude Code si le repo est sur GitHub
- **Cloudflare MCP**, utile si Turnstile ou le nom de domaine est géré via Cloudflare

## Skills à installer pour éviter un design "AI slop"

Le plugin Expo officiel embarque des skills de design pensées pour du natif (pas du web générique), à faire lire à Claude Code avant de construire les écrans :

```
bunx skills add expo/skills
```
(ou via le plugin officiel Claude Code, qui les installe automatiquement avec le MCP Expo, voir section précédente)

- **expo-native-ui**, patterns d'UI natifs, respect des Apple Human Interface Guidelines, couleurs sémantiques, SF Symbols, animations et effets visuels propres à iOS/Android plutôt que des composants web transposés tels quels
- **expo-design-system**, construit un vrai système de design dans l'app (tokens couleur/spacing/typo/radius/ombre/motion) et audite la dérive du design system dans le temps, pour éviter l'incohérence visuelle entre écrans
- **expo-ui**, composants natifs via `@expo/ui` (SwiftUI/Jetpack Compose sous le capot) plutôt que des composants React Native génériques qui ne ressemblent à rien de plateforme
- **expo-tailwind-setup**, configure proprement NativeWind (Tailwind pour RN), utile si tu gardes cette approche de style

En complément, il existe déjà un skill de direction artistique plus général (`frontend-design`, pensé web mais dont les principes de fond s'appliquent) : éviter les défauts "generated by AI" (dégradés décoratifs, cartes toutes identiques avec la même ombre, labels en majuscules partout, emoji/flèches en excès), choisir une palette et une typographie délibérées liées au sujet (ici : univers professionnel, avis d'entreprise), et se limiter à un seul élément fort par écran plutôt que de tout décorer.
