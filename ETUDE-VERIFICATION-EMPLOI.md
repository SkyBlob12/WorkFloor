# Étude : vérification de l'emploi et comptes validés

Étude préalable à la phase 3 de [VERIFICATION-AVIS.md](VERIFICATION-AVIS.md). Rien n'est implémenté : ce document compare les méthodes possibles avec les contraintes réelles du projet et propose un découpage.

---

## 1. Deux notions distinctes

| Notion | Question à laquelle elle répond | Portée |
|---|---|---|
| **Compte validé** | « Est-ce une vraie personne, avec un seul compte ? » | Le compte, toutes entreprises confondues |
| **Emploi vérifié** | « Cette personne a-t-elle travaillé dans *cette* entreprise ? » | Un couple compte + entreprise |

Un compte validé freine les campagnes (créer 20 comptes coûte cher). Un emploi vérifié rend un avis crédible. Les deux se cumulent.

---

## 2. Contraintes du projet qui orientent les choix

- **Anonymat absolu** : aucune adresse email professionnelle, aucun nom, aucun document ne doit rester en base. Une vérification ne doit jamais permettre de retrouver l'auteur d'un avis, même pour l'éditeur.
- **Pas de nom de domaine** et emails envoyés depuis un compte **GMX gratuit** : envoyer des codes à des adresses d'entreprise (filtres anti-spam stricts) est peu fiable, les limites d'envoi de GMX ne sont pas documentées, et un blocage du compte GMX casserait aussi « Mot de passe oublié ».
- **Éditeur seul, sans budget** : pas de coût par vérification élevé, pas de file de relecture manuelle lourde.
- **Pas d'éditeur vérifié chez Microsoft ni Apple Business** : la vérification d'éditeur Microsoft exige un domaine.
- **Mobile uniquement**, builds EAS pour les stores (les modules natifs sont donc possibles, mais pas dans Expo Go).

---

## 3. Emploi vérifié : les méthodes

### 3.1 Compte Google Workspace de l'entreprise (recommandé en premier)

L'utilisateur se connecte **une seule fois** avec son compte Google professionnel, uniquement pour la vérification (ce n'est pas une connexion à WorkFloor). Le jeton d'identité signé par Google contient le claim **`hd`** (domaine de l'organisation Google Workspace), présent uniquement pour un compte d'organisation. Google recommande explicitement de s'appuyer sur `hd` et non sur le domaine de l'email.

- **Pour** : aucun email à envoyer, preuve signée par Google, instantané, gratuit. Portée minimale (`openid email`), sans validation Google de l'application.
- **Contre** : seulement les entreprises sous Google Workspace ; un administrateur peut bloquer les applications tierces ; prouve l'emploi **actuel** (le compte est désactivé au départ du salarié).
- **Anonymat** : l'email n'est lu qu'en mémoire dans l'Edge Function, jamais stocké ; seule une empreinte chiffrée (HMAC avec un secret) est conservée pour empêcher qu'un même compte pro vérifie plusieurs comptes WorkFloor.

### 3.2 Compte Microsoft 365 / Entra de l'entreprise

Même principe avec un compte Microsoft professionnel : identifiant d'organisation (`tid`) et domaine de l'adresse, en exigeant le claim `xms_edov` (domaine de l'email vérifié par l'organisation) pour éviter l'usurpation d'email connue sous le nom de nOAuth.

- **Pour** : couvre la majorité des grandes entreprises françaises.
- **Contre** : sans éditeur vérifié (impossible sans domaine), beaucoup d'organisations bloquent le consentement des utilisateurs aux applications tierces. Le taux d'échec risque d'être élevé. Inscription de l'application dans Azure (gratuite) nécessaire.
- **Verdict** : à tester après Google, en mesurant le taux de réussite.

### 3.3 Code envoyé sur l'adresse professionnelle

- **Contre** : dépend de GMX (délivrabilité vers les messageries d'entreprise, limites inconnues, risque de blocage du seul compte d'envoi). Sans domaine, pas de service transactionnel possible.
- **Verdict** : **écarté** tant qu'il n'y a pas de domaine d'envoi.

### 3.4 Justificatif : fiche de paie, contrat, certificat de travail

Le document porte le **SIRET de l'employeur**, ce qui permet en plus de vérifier l'**établissement** (en lien avec les sites `company_sites` déjà en cours).

Deux variantes :

| Variante | Fonctionnement | Force de la preuve | Charge |
|---|---|---|---|
| **A. Lecture sur l'appareil** | Reconnaissance de texte locale (ML Kit), extraction du SIRET et de la date ; **le document ne quitte jamais le téléphone**, seul le SIRET est envoyé | Faible : un faux PDF passe | Aucune |
| **B. Envoi et relecture** | Photo envoyée dans un espace privé, relue à la main, **supprimée dès la décision** (7 jours maximum) ; l'utilisateur masque nom, numéro de sécurité sociale et salaire | Moyenne à bonne | Élevée pour un éditeur seul, analyse d'impact RGPD à prévoir |

- **Pour** : la seule méthode qui couvre les **anciens salariés** et les entreprises sans Google ni Microsoft (commerce, BTP, restauration).
- **Verdict** : variante A en complément (niveau « justificatif déclaré », poids modéré) ; variante B seulement si le volume reste faible, et après avis de l'avocat.

### 3.5 Écartées

- **LinkedIn** : l'API ne donne plus les expériences ; « Verified on LinkedIn » est réservé à des partenaires.
- **FranceConnect, API Particulier** : aucune donnée d'emploi accessible à un service privé.
- **Email envoyé par l'utilisateur à l'adresse de contact** : relecture manuelle, et l'éditeur verrait l'adresse pro (fin de l'anonymat).
- **Lier le compte Google pro au compte WorkFloor** (`linkIdentity` de Supabase) : l'email pro serait stocké dans `auth.identities`. Contraire à l'anonymat.

---

## 4. Associer un domaine à une entreprise

Les méthodes 3.1 et 3.2 donnent un **domaine** (`acme.fr`), pas un SIREN. Il faut une table de correspondance, sinon n'importe qui achète `acme-france.fr` et se « vérifie ».

Proposition : table `company_email_domains (company_id, domain, status)` avec `status` = `pending`, `approved` ou `rejected`.

1. **Domaine déjà approuvé pour l'entreprise** : vérification immédiate.
2. **Domaine inconnu** : vérification en attente, et le domaine part en file de relecture.
3. **Contrôle automatique d'appoint** : les sites d'entreprise français doivent publier leurs mentions légales avec le SIREN (LCEN). L'Edge Function peut lire la page d'accueil et les pages « mentions légales » du domaine et y chercher le SIREN : trouvé = approbation automatique, sinon relecture manuelle.
4. **Domaines publics refusés d'emblée** (gmail.com, outlook.fr, orange.fr…), même si Google ou Microsoft les renvoyait.
5. Un domaine peut couvrir plusieurs SIREN (groupes) : relation plusieurs à plusieurs, approbation au cas par cas.

---

## 5. Comptes validés

| Signal | Coût | Ce qu'il apporte | Proposition |
|---|---|---|---|
| **Connexion Apple ou Google** | Gratuit, déjà en place | Un compte Apple ou Google demande un numéro de téléphone : créer des comptes en masse coûte plus cher qu'avec un email jetable | Niveau « validé » de base, lu dans `auth.identities` |
| **Intégrité de l'app** (`@expo/app-integrity` : App Attest iOS, Play Integrity Android) | Gratuit | Refuse les scripts, émulateurs et apps modifiées sur `submit-review` | À ajouter dès les builds EAS (module en alpha, ne fonctionne ni dans Expo Go ni dans le simulateur iOS) |
| **Numéro de téléphone** (SMS via le hook d'envoi SMS de Supabase) | Environ 0,05 à 0,10 $ par vérification | Un numéro par compte (empreinte chiffrée) : frein fort aux faux comptes | Plus tard, facultatif, si le budget le permet |
| **Email + mot de passe seul** | Gratuit | Rien : adresses jetables | Non validé |

Proposition de niveaux, calculés côté serveur, jamais affichés publiquement pour un compte :

- **0** : email + mot de passe ;
- **1** : Apple ou Google, **ou** téléphone vérifié ;
- **2** : au moins un emploi vérifié.

---

## 6. Effet sur les avis

| Situation de l'auteur pour cette entreprise | Badge public | Attente comptes récents | Poids dans la note | Pendant une surveillance |
|---|---|---|---|---|
| Emploi vérifié (Google, Microsoft, relecture de justificatif) | « Emploi vérifié » | Aucune | 1 | Reste compté, publié sans attendre |
| Justificatif lu sur l'appareil | Aucun (ou « Justificatif déclaré », à décider) | 24 h | 0,75 | Comme un avis non vérifié |
| Compte validé, emploi non vérifié | Aucun | 24 h | 0,5 puis 1 après 7 jours | Retenu |
| Compte non validé | Aucun | 24 h | 0,5 puis 1 après 7 jours | Retenu |

À prévoir aussi : filtre « Avis vérifiés uniquement » sur la fiche, et « dont N vérifiés » à côté du nombre d'avis.

**Risque de réidentification** : dans une petite entreprise, « Emploi vérifié » réduit peu le cercle (tout le monde a un compte pro). Le badge n'indique jamais la méthode ni la date de vérification.

---

## 7. Modèle de données envisagé

```sql
-- Aucune adresse, aucun document : seulement le fait qu'une vérification a eu lieu.
employment_verifications (
  id uuid primary key,
  user_id uuid references auth.users on delete cascade,
  company_id uuid references companies on delete cascade,
  method text,            -- google_workspace | microsoft_entra | document_device | document_review
  domain text,            -- acme.fr (null pour un justificatif)
  evidence_hash text,     -- HMAC(secret, email normalisé ou tid + oid) : un compte pro = un compte WorkFloor
  status text,            -- pending | verified | rejected | revoked
  verified_month date,    -- mois seulement
  created_at timestamptz,
  unique (company_id, evidence_hash)
)

company_email_domains (company_id, domain, status, checked_at)

verification_attempts (state text primary key, user_id, company_id, method, expires_at)  -- 10 min, purgé
```

- Lecture : l'utilisateur voit ses propres vérifications (RLS), sans `evidence_hash`. Aucune lecture publique.
- `reviews_public` : un booléen `is_verified` calculé (vérification `verified` pour le même compte et la même entreprise), jamais la méthode.
- Suppression du compte : cascade, rien ne subsiste.

---

## 8. Parcours technique (Google Workspace)

Sans domaine, le plus simple est un **flux côté serveur**, compatible avec le client OAuth « Web » déjà créé pour la connexion Google :

1. L'app appelle `start-verification` (Edge Function) : création d'un `state` aléatoire lié au compte et à l'entreprise, renvoi de l'URL Google (`scope=openid email`, `prompt=select_account`).
2. L'app ouvre l'URL avec `WebBrowser.openAuthSessionAsync`.
3. Google redirige vers l'Edge Function `verification-callback` (URL HTTPS Supabase, autorisée comme URI de redirection).
4. La fonction échange le code contre le jeton, vérifie la signature et `aud`, `iss`, `exp`, `email_verified`, **`hd`**, puis calcule l'empreinte et contrôle le domaine (section 4). L'email est oublié à la fin de la requête.
5. Redirection vers `workfloor://verification?result=verified|pending|failed`, que l'app lit pour afficher le résultat.

Pour Microsoft : même flux, point de terminaison `organizations`, claim `xms_edov` activé dans l'inscription Azure.

Nouveaux codes d'erreur envisagés : `VERIFICATION_PERSONAL_ACCOUNT` (compte Google grand public), `VERIFICATION_DOMAIN_MISMATCH`, `VERIFICATION_ALREADY_USED`, `VERIFICATION_EXPIRED`.

---

## 9. Découpage proposé

| Étape | Contenu | Dépend de |
|---|---|---|
| **1** | Tables, niveau de compte (Apple / Google), badge « Emploi vérifié », poids et exemptions dans `submit-review` et `companies_with_stats`, vérification Google Workspace, file des domaines avec contrôle des mentions légales | Rien |
| **2** | Intégrité de l'app sur `submit-review` et les fonctions de vérification | Builds EAS |
| **3** | Vérification Microsoft Entra, puis mesure du taux de réussite | Inscription Azure |
| **4** | Justificatif lu sur l'appareil (ML Kit) | Builds EAS |
| **5** (optionnelle) | Justificatif envoyé et relu, téléphone vérifié | Avis de l'avocat, budget |

Chaque étape touchant la base suit la règle du projet : pré-vol, migration idempotente, rollback.

---

## 10. Points juridiques à faire valider

- Politique de confidentialité : nouvelle finalité (vérification facultative de l'emploi), base légale **consentement**, empreintes conservées jusqu'à la suppression du compte, documents supprimés sous 7 jours (variante B).
- Analyse d'impact (AIPD) probable pour la variante B (documents professionnels, volume potentiellement important).
- Transparence (article L111-7-2 du Code de la consommation, si applicable) : expliquer publiquement ce que signifie « Emploi vérifié » et comment il est obtenu.
- Nouveaux sous-traitants : Google et Microsoft interviennent déjà (connexion) ; aucun nouveau prestataire pour les étapes 1 à 4.

---

## 11. Décisions à prendre

1. Commencer par **Google Workspace** seul (étape 1), ou attendre de faire Google et Microsoft ensemble ?
2. **Relecture manuelle des domaines inconnus** acceptable, en plus du contrôle automatique des mentions légales ?
3. Badge **« Justificatif déclaré »** visible pour la lecture sur l'appareil, ou simple poids sans badge ?
4. Variante **justificatif envoyé et relu** : l'envisager, ou l'exclure définitivement ?
5. Vérification par **téléphone** : l'exclure pour l'instant ?

---

## Sources

- Google, OpenID Connect, claim `hd` : https://developers.google.com/identity/openid-connect/openid-connect
- Microsoft, vérification d'éditeur et consentement : https://learn.microsoft.com/en-us/entra/identity-platform/publisher-verification-overview
- Microsoft, ne plus s'appuyer sur le claim email (nOAuth) : https://docs.azure.cn/en-us/entra/identity-platform/migrate-off-email-claim-authorization
- Expo App Integrity : https://docs.expo.dev/versions/latest/sdk/app-integrity/
- Supabase, connexion par téléphone : https://supabase.com/features/phone-logins
