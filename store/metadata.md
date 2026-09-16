# Métadonnées stores (brouillon)

Tout est à relire. Les limites de caractères sont celles des stores.

## Identité

| Champ | Valeur |
| --- | --- |
| Nom (30 car.) | WorkFloor |
| Sous-titre App Store (30 car.) | Avis de salariés, anonymes |
| Catégorie App Store | Économie et entreprise (secondaire : Référence) |
| Catégorie Play Store | Entreprise |
| Bundle ID / package | `fr.workfloor.app` (définitif après la première publication) |
| URL confidentialité | `https://<domaine>/legal/privacy` |
| URL conditions | `https://<domaine>/legal/terms` |
| URL support | `https://<domaine>/legal/notice` ou adresse email de contact |

## Texte promotionnel App Store (170 car.)

Ambiance, salaires, management : lisez ce que les salariés disent vraiment de leur entreprise, et partagez votre expérience en toute discrétion.

## Description courte Play Store (80 car.)

Avis anonymes de salariés : ambiance, salaires, management, avantages.

## Description longue

Avant de postuler, de négocier ou de rester : sachez ce qui se passe vraiment derrière le bureau.

WorkFloor rassemble des avis de salariés et d'anciens salariés sur leur entreprise. Notes détaillées, salaires, avantages, points positifs et points à améliorer : tout est lisible librement, sans créer de compte.

• Recherchez une entreprise par son nom ou son SIREN
• Consultez la note globale et le détail : ambiance, salaire, avantages, management, équilibre vie pro / perso
• Découvrez les salaires déclarés et le pourcentage de salariés qui recommandent l'entreprise
• Publiez votre avis anonymement : votre nom et votre email ne sont jamais affichés
• Modifiez ou supprimez votre avis quand vous le souhaitez
• Votez pour les avis les plus utiles

Des fiches fiables
Les entreprises sont ajoutées à partir du répertoire officiel SIRENE de l'INSEE : pas de doublons, pas de fiches fictives.

Des règles claires
On parle de l'entreprise, pas des personnes. Chaque avis peut être signalé, et vous pouvez masquer les avis d'un auteur. Les contenus illicites sont retirés.

## Mots-clés App Store (100 car., séparés par des virgules, sans espaces)

avis,entreprise,salaire,employeur,emploi,travail,anonyme,recrutement,ambiance,carrière,salarié

(Ne jamais citer de marque concurrente : motif de rejet.)

## Classification d'âge

- App Store : le questionnaire inclut « contenu généré par les utilisateurs ». S'attendre à 16+ ou 18+ selon les réponses. Répondre honnêtement ; déclarer que signalement, blocage et modération existent.
- Play Store (IARC) : cocher « les utilisateurs peuvent interagir / partager du contenu ».

## Confidentialité (App Store « App Privacy » / Play « Data safety »)

| Donnée | Collectée | Liée à l'utilisateur | Usage |
| --- | --- | --- | --- |
| Adresse email | Oui | Oui | Fonctionnement de l'app (compte) |
| Contenu utilisateur (avis) | Oui | Oui (en interne, jamais affiché) | Fonctionnement de l'app |
| Données de diagnostic (Sentry) | Oui | Non | Diagnostic |
| Données d'utilisation (PostHog, si consentement) | Oui | Non | Statistiques |
| Identifiant d'appareil (push, si activé plus tard) | Oui | Oui | Fonctionnement |

Suivi publicitaire (ATT) : non. Suppression de compte in-app : oui (écran Mon compte).

## Notes pour la review Apple

Fournir un compte de démonstration (email + mot de passe) avec au moins un avis publié, et préciser :

> Consultation libre sans compte. Un compte est requis pour publier, voter et signaler.
> Signalement : menu « … » sur chaque avis → « Signaler cet avis ».
> Blocage : menu « … » → « Masquer les avis de cet auteur » (réversible dans Mon compte).
> Suppression du compte : Mon compte → « Supprimer mon compte ».
> Conditions acceptées avant toute connexion (mention « En continuant, vous acceptez… » sous les boutons Apple, Google et email).
> Connexion : Sign in with Apple, Google ou email + mot de passe. Consultation possible en invité.

## Captures d'écran à produire

- iPhone 6,9" (1320 × 2868) : accueil/recherche, fiche entreprise, avis détaillé, formulaire, compte
- Android téléphone (min. 1080 × 1920) : mêmes écrans
- iPad : non requis (`supportsTablet: false`)
- Image de présentation Play Store : 1024 × 500
