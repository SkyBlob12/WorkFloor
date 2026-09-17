# Métadonnées stores (brouillon)

Tout est à relire. Les limites de caractères sont celles des stores.

## Identité

| Champ | Valeur |
| --- | --- |
| Nom (30 car.) | WorkFloor : avis entreprise *(27 car.)* |
| Sous-titre App Store (30 car.) | Salaires, ambiance, anonyme *(27 car.)* |
| Catégorie App Store | Économie et entreprise (secondaire : Référence) |
| Catégorie Play Store | Entreprise |
| Bundle ID / package | `fr.workfloor.app` (définitif après la première publication) |
| URL confidentialité | `https://skyblob12.github.io/WorkFloor/privacy.html` (en-US : `/en/privacy.html`) |
| URL support (Apple) | `https://skyblob12.github.io/WorkFloor/` (en-US : `/en/`) |
| URL suppression de compte (Google) | `https://skyblob12.github.io/WorkFloor/delete-account.html` |
| URL marketing (App Store, optionnelle) | aucune (laisser vide : pas de site dédié) |
| Copyright (App Store) | `2026 Clément Andrieu` |
| Email de contact | `workfloor@tutamail.com` |
| Site web | aucun (première version mobile uniquement ; les pages ci-dessus sont générées par `npm run legal:site`, voir [LANCEMENT.md](../LANCEMENT.md) étape 5) |

> **Pourquoi ce nom et ce sous-titre.** Le champ Nom est le mieux indexé par la recherche App Store, devant le sous-titre, lui-même devant les mots-clés. Un nom purement marque ("WorkFloor") laisse ce levier inutilisé. `WorkFloor : avis entreprise` capte la requête la plus probable ("avis entreprise", "avis sur une entreprise") dès le titre. Le sous-titre évite de répéter les mots déjà indexés par le nom (`workfloor`, `avis`, `entreprise`) et ajoute trois mots à forte valeur (`salaires`, `ambiance`, `anonyme`) : chaque mot n'a besoin d'apparaître qu'une fois dans nom + sous-titre + mots-clés, le répéter gaspille des caractères. Détail complet : voir [Stratégie ASO](#stratégie-aso-mots-clés) en fin de fichier.

## Texte promotionnel App Store (170 car.)

Ambiance, salaire, management : lisez ce que les salariés disent vraiment de leur entreprise, et partagez votre expérience sans jamais donner votre nom. *(152 car.)*

*(Seul champ modifiable sans repasser par la review Apple. À rafraîchir 3-4 fois par an avec un angle saisonnier : rentrée de septembre, entretiens annuels de janvier-mars, négociation salariale. Le texte n'est pas indexé par la recherche, mais influence le taux de clic donc indirectement le classement.)*

## Description courte Play Store (80 car.)

Avis anonymes sur les entreprises : salaires, ambiance, avantages, emploi. *(74 car.)*

## Description longue

*(App Store : champ « Description », 4 000 car. max, 1 781 utilisés. Play Store : même texte en description complète.)*

Ambiance, salaire, management : découvrez ce que les salariés disent vraiment d'une entreprise avant de postuler, de négocier ou de rester.

WorkFloor rassemble les avis anonymes de salariés et d'anciens salariés sur leur employeur. Tout se lit librement, sans créer de compte.

CE QUE VOUS Y TROUVEZ
• La note globale d'une entreprise et son détail : ambiance, salaire, avantages, management, équilibre vie pro / perso
• Les salaires déclarés, avec le poste et le type de contrat
• La part de salariés qui recommandent leur entreprise
• Les points positifs et les points à améliorer, dans les mots des salariés
• La recherche par nom d'entreprise ou par SIREN, et l'exploration par secteur et par ville
• Les avis les plus utiles, remontés par les votes des lecteurs

VOTRE AVIS, SANS VOTRE NOM
• Ni votre nom ni votre adresse email ne sont affichés
• Seul le mois de publication apparaît, jamais la date exacte
• L'entreprise ne peut pas savoir qui a écrit
• Vous modifiez ou supprimez votre avis quand vous le voulez
• Un seul avis par entreprise, pour que les notes restent fidèles

DES FICHES FIABLES
Les entreprises sont créées à partir du répertoire officiel SIRENE de l'INSEE : le nom, le SIREN et le secteur sont vérifiés. Pas de fiche fictive, pas de doublon.

DES RÈGLES CLAIRES
On parle de l'entreprise, pas des personnes. Chaque avis est relu avant publication, peut être signalé en deux touchers, et vous pouvez masquer tous les avis d'un auteur. Les contenus illicites sont retirés.

SANS PUBLICITÉ
Application gratuite, sans abonnement, sans publicité et sans traceur publicitaire.

La consultation est libre. Un compte (Apple, Google ou email) n'est demandé que pour publier un avis, voter ou signaler.

Questions, signalement d'un contenu : workfloor@tutamail.com

## Mots-clés App Store (100 car., séparés par des virgules, sans espaces)

```
emploi,salaire,employeur,travail,recrutement,carrière,salarié,note,télétravail,avantages,management
```
*(99/100 car.)*

Ne répète pas `workfloor`, `avis`, `entreprise`, `salaires`, `ambiance`, `anonyme` : déjà indexés via le nom et le sous-titre, les répéter ici gaspille des caractères. Apple gère le pluriel/singulier automatiquement (`entreprise` couvre aussi `entreprises`) : toujours mettre le singulier dans les mots-clés.

(Ne jamais citer de marque concurrente, ex. "Glassdoor" : motif de rejet quasi systématique.)

## Fiche localisée en anglais (en-US)

L'app est déjà traduite en anglais (compte → choix de la langue) : une fiche en-US ne coûte que la traduction, capte les recherches en anglais (expatriés, filiales de groupes étrangers) sans cannibaliser la fiche française (chaque localisation a son propre index de recherche).

| Champ | Valeur |
| --- | --- |
| Nom (30 car.) | WorkFloor: Company Reviews *(26 car.)* |
| Sous-titre App Store (30 car.) | Salaries, culture, anonymous *(28 car.)* |
| Description courte Play (80 car.) | Anonymous employee reviews: salaries, culture, benefits, jobs. *(62 car.)* |

Mots-clés App Store (100 car.) :
```
job,employer,work,career,employee,rating,workplace,benefits,interview,hr,recruiter,remote,management
```
*(100/100 car., sans répéter `company`, `reviews`, `salaries`, `culture`, `anonymous` déjà indexés par le nom et le sous-titre)*

## Classification d'âge

- App Store : le questionnaire inclut « contenu généré par les utilisateurs ». S'attendre à 16+ ou 18+ selon les réponses. Répondre honnêtement ; déclarer que signalement, blocage et modération existent.
- Play Store (IARC) : cocher « les utilisateurs peuvent interagir / partager du contenu ».

## Confidentialité (App Store « App Privacy » / Play « Data safety »)

| Donnée | Collectée | Liée à l'utilisateur | Usage |
| --- | --- | --- | --- |
| Adresse email | Oui | Oui | Fonctionnement de l'app (compte) |
| Contenu utilisateur (avis) | Oui | Oui (en interne, jamais affiché) | Fonctionnement de l'app |
| Données de diagnostic (Sentry) | Oui | Non | Diagnostic |

Ne pas déclarer d'identifiant d'appareil : les notifications push ne sont pas branchées et leurs permissions Android sont bloquées (`android.blockedPermissions` dans `app.json`). L'adresse IP n'est conservée que hachée, 30 jours, pour l'anti-abus : la mentionner au juriste pour savoir s'il faut la déclarer (Google : « Appareil ou autres identifiants »).

Le salaire déclaré fait partie de l'avis (contenu utilisateur), il n'est relié à aucune donnée financière du compte.

Play « Data safety », questions générales : données chiffrées en transit, oui ; l'utilisateur peut demander la suppression de ses données, oui (dans l'app et par email) ; données partagées avec des tiers, non (les prestataires agissent pour notre compte).

Suivi publicitaire (ATT) : non. Suppression de compte in-app : oui (écran Compte).

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
- Image de présentation Play Store (1024 × 500) : **faite**, `store/assets/play-feature-graphic-1024x500.png`. Régénérable par `python store/feature-graphic.py` (Pillow requis, polices Segoe UI de Windows). PNG sans transparence, texte tenu à plus de 60 px des bords : Google recadre l'image selon les emplacements et superpose un bouton lecture au centre si une vidéo promo est ajoutée.

Les captures ne sont pas indexées pour la recherche mais pèsent le plus sur le taux d'installation une fois la fiche vue (donc sur le classement indirectement, via le taux de conversion). Ajouter une légende courte en surimpression sur chaque capture, dans l'ordre qui reprend la proposition de valeur avant les fonctionnalités secondaires :
1. « Les salaires et l'ambiance, avant de signer » (accueil/recherche)
2. « Notes détaillées par entreprise » (fiche entreprise)
3. « Des avis 100% anonymes » (avis détaillé)
4. « Votre avis compte, en toute discrétion » (formulaire)
5. « Sans créer de compte pour consulter » (compte / accès invité)

Traduire ces légendes pour la fiche en-US plutôt que les garder en français.

## Stratégie ASO (mots-clés)

Ce qui fait bouger le classement dans la recherche des stores, par ordre d'impact, au-delà des champs texte ci-dessus :

1. **Volume et fraîcheur des avis (notes de l'app, pas des entreprises).** C'est le signal le plus lourd pour Apple comme pour Google, et le plus facile à négliger pour une app qui ne parle *que* d'avis d'entreprises. Prévoir un appel à noter WorkFloor (`expo-store-review` / `StoreReview.requestReview()`) déclenché après un moment de satisfaction réel : avis publié avec succès, ou X sessions sans friction. Ne jamais le déclencher juste après une erreur ou un signalement.
2. **Vélocité des installations.** Une campagne Apple Search Ads "Basic" (budget libre, pas d'enchère manuelle à gérer) sur les mots-clés du fichier ci-dessus peut amorcer le classement organique dans les premières semaines ; à faire une fois la fiche stabilisée, pas avant.
3. **Texte promotionnel et in-app events (App Store).** Seuls champs modifiables sans nouvelle review : rafraîchir le texte promotionnel selon la saison (rentrée, entretiens annuels) capte des pics de recherche sans redéployer l'app.
4. **SEO web en amont du store.** La version web (`PageHead`, `components/shell/PageHead.tsx`) pose déjà un titre/description par page : vérifier que chaque fiche entreprise (`app/company/[id]/`) génère un titre du type « Avis {{nom de l'entreprise}} : salaires, ambiance, notes » et une meta description reprenant les mêmes mots que la fiche store. Google indexe ces pages ; un internaute qui cherche « avis [entreprise] » sur le web et tombe sur WorkFloor est un prescripteur d'installation, ce qui alimente indirectement le classement Play Store (Google traite le trafic web vers la fiche comme un signal).
5. **Cohérence des mots-clés dans le temps.** Ne pas changer les mots-clés à chaque version : Apple ré-indexe progressivement, un mot-clé changé perd son historique de classement. Ajuster seulement après avoir mesuré (App Store Connect → Analytics → termes de recherche) quelles requêtes amènent réellement des impressions.
