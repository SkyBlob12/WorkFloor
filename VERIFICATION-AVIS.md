# Vérification des avis : lutte contre les faux avis

Ce document explique comment WorkFloor limite les faux avis et les campagnes de désinformation, ce qu'il faut faire au quotidien pour la modération, et ce qui reste à construire.

> **À retenir** : aucune preuve d'emploi n'est exigée pour l'instant. La phase 1 ne vérifie pas qu'une personne a travaillé dans l'entreprise : elle rend les faux avis **plus risqués**, **plus lents à publier** et **plus faciles à repérer quand ils arrivent en groupe**.

---

## 1. Parcours d'un avis

### Dans l'app : l'attestation sur l'honneur

Avant d'envoyer son avis, l'auteur coche :

> « J'atteste sur l'honneur travailler ou avoir travaillé chez {{entreprise}}, et que cet avis décrit mon expérience personnelle. Un faux avis entraîne son retrait et peut engager ma responsabilité. »

- La case n'est jamais pré-cochée, y compris quand on modifie un avis existant.
- Sans elle, l'app bloque l'envoi, et le serveur refuse aussi une requête qui la contournerait (code `ATTESTATION_REQUIRED`).
- La date de l'attestation est enregistrée à chaque envoi (`reviews.attested_at`).
- La clause figure dans les CGU (article 4). Elle ne prouve rien, mais elle engage l'auteur et fonde juridiquement le retrait d'un faux avis.

### Sur le serveur : `submit-review`

Dans l'ordre :

1. **Connexion obligatoire.**
2. **Limite de débit** : 5 avis par jour par compte, 15 par adresse IP (chiffrée).
3. **Modération du texte** : insultes, mots interdits, données personnelles, analyse OpenAI.
4. **Analyse de l'activité récente de l'entreprise** (nouveaux avis uniquement, pas les modifications).
5. **Décision** : publier tout de suite ou mettre en attente.

---

## 2. Détection des campagnes

À chaque nouvel avis, la base calcule les statistiques de l'entreprise sur les **7 derniers jours** et les compare aux **12 semaines précédentes** (fonction SQL `company_activity_stats`).

| Indice | Déclenché quand |
|---|---|
| Pic de volume | Au moins 4 avis en 7 jours, **et** 3 fois plus que le rythme habituel de l'entreprise |
| Pic massif | Au moins 10 avis en 7 jours, **et** 5 fois plus que le rythme habituel |
| Comptes récents | Au moins 60 % des auteurs avaient un compte de moins de 7 jours en écrivant |
| Notes extrêmes | Au moins 80 % de notes à 1/5 ou 5/5 |
| Même réseau | Au moins 3 auteurs distincts derrière la même adresse IP chiffrée |
| Texte recopié | Similarité d'au moins 0,5 avec un autre avis récent de l'entreprise (trigrammes `pg_trgm`) |

### Quand une campagne est-elle retenue ?

Pour éviter les fausses alertes, **un pic seul ne suffit pas**. La surveillance s'ouvre si :

- il y a un **pic de volume et au moins un autre indice** (comptes récents, notes extrêmes ou même réseau) ;
- **ou** un **pic massif** ;
- **ou** un **texte recopié** ;
- **ou** l'entreprise est **déjà sous surveillance**.

Le seuil « même réseau » est volontairement haut : sur les réseaux mobiles, beaucoup d'abonnés partagent la même adresse IP.

---

## 3. Décision de publication

| Situation | Résultat | Ce que voit l'auteur |
|---|---|---|
| Rien de suspect, compte de plus de 24 h | Publié immédiatement | « Merci, votre avis est publié » |
| Rien de suspect, compte de moins de 24 h | Publié automatiquement une fois les 24 h du compte écoulées | « Publication sous 24 h » |
| Campagne détectée | En attente jusqu'à la clôture de la surveillance | « Avis en cours de relecture » |
| Texte signalé par la modération | Relecture humaine, jamais publié automatiquement | « Avis en cours de relecture » |

La relecture demandée par la modération prime sur tout le reste.

### Poids dans la note

Un avis écrit pendant les **7 premiers jours** d'un compte compte **pour moitié** (`reviews.trust_weight = 0,5`) dans les moyennes de la fiche. Il reste affiché normalement dans la liste.

### Pourquoi le délai de 24 h est la pièce centrale

Une campagne, c'est en général plusieurs comptes créés d'un coup qui publient vite. Grâce au délai :

1. les premiers faux avis attendent au lieu d'être publiés ;
2. les avis suivants font apparaître le pic et la part de comptes récents ;
3. la surveillance s'ouvre ;
4. les avis encore en attente restent bloqués jusqu'à la relecture et **ne sont jamais publiés**.

---

## 4. Entreprise sous surveillance

Quand la surveillance s'ouvre (table `company_watches`) :

- les avis de l'entreprise créés depuis `window_start` **sortent de la note** (ils restent visibles dans la liste) ;
- **tout nouvel avis attend** la clôture de la surveillance (`hold_reason = company_surge`) ;
- la fiche affiche **« Activité inhabituelle »** ;
- si tous les avis comptés tombent dans la période surveillée, la fiche affiche « Note en cours de vérification ».

Aucune information sur les auteurs n'est stockée dans `company_watches`, et la table n'est lisible que par le serveur.

---

## 5. Modération au quotidien

À faire **chaque jour** dans le *Table Editor* de Supabase : une entreprise reste gelée tant que personne ne clôt sa surveillance.

1. Ouvrir `company_watches`, filtrer sur `resolved_at` vide. La colonne `signals` indique ce qui a déclenché l'alerte.
2. Ouvrir `reviews`, filtrer sur `company_id` et `created_at >= window_start`. Relire les avis publiés **et** en attente ; `moderation_flags.activity_signals` montre les indices relevés pour chaque avis.
3. Passer les faux avis en `removed`.
4. Dans `company_watches`, renseigner `resolved_at` (date du jour) et `resolution` :
   - `actioned` si des avis ont été retirés ;
   - `cleared` si c'était une fausse alerte (par exemple, une équipe qui a découvert l'app en même temps).
5. Dans les 15 minutes, les avis encore retenus sont publiés et la note revient à la normale.

Une surveillance close ne se rouvre pas sur les avis déjà examinés : seuls les avis écrits après `resolved_at` comptent pour une nouvelle alerte.

Autres cas :

- **Avis `pending` avec `hold_reason = new_account`** : rien à faire, publication automatique.
- **Avis `pending` avec `hold_reason` vide** : relecture humaine classique (modération ou signalements).
- **Passer un avis retenu à `published` ou `removed` à la main** : l'attente est effacée automatiquement (trigger `reviews_clear_hold`).

---

## 6. Ce que la phase 1 ne bloque pas

| Cas | Pourquoi ça passe | Parade actuelle |
|---|---|---|
| Un faux avis isolé, écrit avec un compte de plus de 24 h | Aucun indice collectif | Signalement par les utilisateurs (masqué au 5ᵉ signalement) |
| Une campagne lente (un avis par semaine, comptes anciens) | Reste sous les seuils de volume | Poids réduit tant que les comptes ont moins de 7 jours, signalements |
| Une personne qui n'a jamais travaillé là et coche la case | Aucune preuve demandée | Clause des CGU, retrait sur signalement |

Ces trois cas demandent une vraie preuve d'emploi (voir la feuille de route).

---

## 7. Où se trouve quoi

| Élément | Emplacement |
|---|---|
| Seuils de détection, délais, poids | `supabase/functions/_shared/trust.ts` (redéployer `submit-review` après modification) |
| Tests des règles | `__tests__/supabase/trust.test.ts` |
| Appels SQL de la détection | `supabase/functions/_shared/companyWatch.ts` |
| Traitement d'un avis | `supabase/functions/submit-review/index.ts` |
| Colonnes, table, fonctions SQL, tâche cron, vue des notes | `supabase/migrations/20260917000000_review_trust.sql` |
| Pré-vol et rollback | `supabase/preflight/` et `supabase/rollbacks/`, même préfixe |
| Case d'attestation | `components/reviews/ReviewAttestation.tsx`, `hooks/useReviewForm.ts` |
| Libellé « Publication sous 24 h » | `utils/reviewStatus.ts` |
| Notice « Activité inhabituelle » | `components/companies/CompanyScore.tsx` |
| Textes légaux | `i18n/locales/*/legal.json` (CGU articles 4 et 5, confidentialité « Données anti-abus ») |

Les fenêtres de 7 jours et 12 semaines existent à deux endroits : `trust.ts` et la fonction SQL `company_activity_stats`. Les garder synchronisées.

### Colonnes ajoutées à `reviews`

| Colonne | Rôle |
|---|---|
| `attested_at` | Date de la dernière attestation (vide pour les avis antérieurs) |
| `hold_reason` | `new_account`, `company_surge`, ou vide (relecture humaine) |
| `held_until` | Date de publication automatique d'un avis `new_account` |
| `trust_weight` | Poids dans les moyennes (0,5 ou 1) |

### Déploiement

Toujours **la migration d'abord**, puis la fonction :

```bash
npm run db:review-trust:preflight   # ok = true partout
npx supabase db push
npx supabase functions deploy submit-review
```

Vérifier ensuite que la tâche `release-held-reviews` apparaît dans *Integrations → Cron*.

Rollback : redéployer d'abord l'ancienne `submit-review`, puis lancer `supabase/rollbacks/20260917000000_review_trust.sql`. Les avis retenus pour compte récent sont alors publiés, ceux d'une activité inhabituelle restent en relecture.

---

## 8. Feuille de route

### Phase 2 : n'accepter que l'app officielle

Vérifier dans `submit-review` que la requête vient de l'app installée sur un vrai appareil : **App Attest** (iOS) et **Play Integrity** (Android). Ça bloque les scripts et les émulateurs, premiers outils des campagnes automatisées.

### Phase 3 : badge « Emploi vérifié »

Vérification facultative, qui donne plus de poids à l'avis et affiche un badge public :

- **Email professionnel** : code envoyé sur une adresse de l'entreprise. Il faut associer chaque entreprise à ses domaines (SIRENE ne les fournit pas) et disposer d'un service d'envoi d'emails fiable. Exclut les anciens salariés.
- **Fiche de paie ou contrat** : lecture du SIRET, puis suppression immédiate du document. Couvre les anciens salariés, mais les données sont très sensibles (RGPD) et les cas douteux demandent une vérification à la main.

Règle d'anonymat à respecter : ne jamais conserver l'email ni le document. Enregistrer seulement le fait qu'une vérification a eu lieu (compte, entreprise, méthode, mois) et une empreinte chiffrée de l'email pour empêcher sa réutilisation sur plusieurs comptes. Seul un booléen sort dans la vue publique.

### Rejeté pour l'instant

- **Rendre la preuve d'emploi obligatoire** : exclurait les ouvriers, les employés en magasin et les anciens salariés, et empêcherait l'app de démarrer.
- **Note affichée seulement à partir de N avis** : au lancement, presque aucune fiche n'aurait de note.
- **Plafond d'avis comptés par semaine** : la surveillance couvre déjà ce cas.
- **LinkedIn** : l'API ne donne plus accès à l'historique professionnel.
- **Géolocalisation sur le lieu de travail** : intrusif, facile à tromper, inutile pour les anciens salariés.
