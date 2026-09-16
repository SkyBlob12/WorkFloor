-- =============================================================================
-- DONNÉES DE DÉMO (à coller dans le SQL Editor, APRÈS lecture du pré-vol)
--   Pré-vol  : supabase/preflight/20260915000200_demo_data.sql
--   Rollback : supabase/rollbacks/20260915000200_demo_data.sql (à lancer avant l'ouverture au public)
--
-- Volontairement hors de supabase/migrations/ : `db push` ne doit jamais l'appliquer.
-- Rejouable : identifiants fixes et `on conflict do nothing`.
--
-- Garde-fous :
--   * 9 entreprises INVENTÉES, SIREN 000000001 à 000000009 (clé de Luhn invalide : aucun
--     SIREN réel ne peut correspondre, donc aucun faux avis sur une vraie société).
--   * 10 auteurs sans mot de passe (connexion impossible), emails en .invalid (domaine réservé).
--   * Identifiants préfixés dc000000- (entreprises) et da000000- (auteurs) pour le rollback.
-- =============================================================================

begin;

do $$
begin
  if to_regclass('public.companies') is null or to_regclass('public.reviews') is null then
    raise exception 'Schéma absent : appliquer d’abord les migrations.';
  end if;
  if exists (
    select 1 from public.companies
    where siren ~ '^00000000[1-9]$' and id::text not like 'dc000000-0000-4000-8000-%'
  ) then
    raise exception 'Un SIREN de démo est déjà utilisé par une autre fiche : arrêt.';
  end if;
end
$$;

-- Auteurs fictifs (connexion impossible : mot de passe vide).
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
select
  '00000000-0000-0000-0000-000000000000',
  ('da000000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid,
  'authenticated',
  'authenticated',
  format('auteur-demo-%s@demo.behindthedesk.invalid', lpad(n::text, 2, '0')),
  '',
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"demo": true}'::jsonb,
  now(),
  now(),
  '', '', '', ''
from generate_series(1, 10) as n
on conflict (id) do nothing;

-- Entreprises fictives (secteur déduit du code NAF, effectif en tranche INSEE).
insert into public.companies (id, siren, name, naf_code, city, postal_code, employee_range, is_active, verified)
values
  ('dc000000-0000-4000-8000-000000000001', '000000001', 'Atelier Lumen', '62.01Z', 'Lyon', '69002', '21', true, true),
  ('dc000000-0000-4000-8000-000000000002', '000000002', 'Nordline Logistique', '52.29B', 'Lille', '59000', '32', true, true),
  ('dc000000-0000-4000-8000-000000000003', '000000003', 'Maison Carmin', '56.10A', 'Bordeaux', '33000', '12', true, true),
  ('dc000000-0000-4000-8000-000000000004', '000000004', 'Clinique des Tilleuls', '86.10Z', 'Nantes', '44000', '41', true, true),
  ('dc000000-0000-4000-8000-000000000005', '000000005', 'Verdane Conseil', '70.22Z', 'Paris', '75009', '22', true, true),
  ('dc000000-0000-4000-8000-000000000006', '000000006', 'Bâtisud Construction', '41.20A', 'Toulouse', '31000', '11', true, true),
  ('dc000000-0000-4000-8000-000000000007', '000000007', 'Hexa Formation', '85.59A', 'Rennes', '35000', '03', true, true),
  ('dc000000-0000-4000-8000-000000000008', '000000008', 'Épicerie Solstice', '47.11F', 'Marseille', '13001', '02', false, true),
  ('dc000000-0000-4000-8000-000000000009', '000000009', 'Studio Pollen', '74.10Z', 'Montpellier', '34000', '01', true, true)
on conflict do nothing;

-- Avis publiés. Colonnes : entreprise, auteur, notes (globale, ambiance, salaire, avantages, management,
-- équilibre), recommande, titre, points positifs, points à améliorer, avantages, poste, statut, contrat,
-- salaire, période, votes utiles, ancienneté en jours.
insert into public.reviews (
  company_id, user_id, rating_overall, rating_culture, rating_salary, rating_benefits, rating_management,
  rating_work_life, recommends, title, pros, cons, benefits, job_title, employment_status, contract_type,
  salary_amount, salary_period, helpful_count, status, created_at, updated_at
)
select
  ('dc000000-0000-4000-8000-' || lpad(v.company::text, 12, '0'))::uuid,
  ('da000000-0000-4000-8000-' || lpad(v.author::text, 12, '0'))::uuid,
  v.overall, v.culture, v.salary, v.perks, v.management, v.work_life,
  v.recommends, v.title, v.pros, v.cons, v.benefits, v.job,
  v.employment::public.employment_status, v.contract::public.contract_type,
  v.amount, v.period::public.salary_period, v.helpful, 'published',
  now() - make_interval(days => v.days), now() - make_interval(days => v.days)
from (values
  (1, 1, 5, 5, 4, 4, 5, 5, true, 'Une équipe qui fait grandir', 'Relectures de code bienveillantes, vrai temps dédié à la veille technique et projets variés.', 'Les périodes de livraison peuvent être intenses, avec quelques soirées en fin de sprint.', 'Télétravail 3 jours, mutuelle prise en charge à 100 %', 'Développeur front-end', 'current', 'cdi', 48000, 'year', 14, 20),
  (1, 2, 4, 5, 3, 4, 4, 4, true, 'Bon cadre pour débuter', 'Intégration structurée, un référent attitré pendant trois mois et une documentation à jour.', 'Grille salariale en dessous du marché, augmentations annuelles modestes.', null, 'Développeuse junior', 'current', 'cdi', 38000, 'year', 9, 45),
  (1, 3, 5, 5, 4, 5, 4, 5, true, 'Ambiance au top et vraie flexibilité', 'Horaires libres, séminaire annuel, outils modernes et encadrement qui écoute les propositions.', 'Peu de perspectives vers des postes de direction, la structure reste petite.', 'Budget formation de 1 500 € par an', 'Chef de projet', 'former', 'cdi', null, null, 6, 120),
  (1, 4, 3, 4, 3, 3, 2, 3, null, 'Bien, mais organisation à revoir', 'Collègues compétents et entraide réelle entre les équipes techniques.', 'Priorités qui changent souvent en cours de sprint, peu de visibilité sur la feuille de route.', null, 'Designer UX', 'former', 'freelance', null, null, 3, 210),
  (1, 5, 4, 4, 4, 4, 4, 5, true, 'Stage formateur', 'Missions concrètes dès la première semaine et gratification au-dessus du minimum légal.', 'Open space un peu bruyant, difficile de se concentrer certains jours.', null, 'Stagiaire développement', 'former', 'internship', 1400, 'month', 2, 300),
  (1, 6, 5, null, null, null, null, null, true, 'Je recommande sans hésiter', 'Transparence sur les chiffres de l’entreprise, réunions utiles et respect de l’équilibre de vie.', 'Le parking est payant et les transports en commun sont un peu éloignés du bureau.', null, null, 'current', 'cdi', null, null, 1, 8),
  (2, 1, 2, 2, 3, 2, 1, 2, false, 'Cadence difficile à tenir', 'Collègues solidaires sur le terrain et primes de fin d’année versées régulièrement.', 'Objectifs de productivité très élevés, plannings communiqués tard et fort turnover.', null, 'Préparateur de commandes', 'former', 'interim', 12, 'hour', 8, 75),
  (2, 7, 3, 3, 3, 3, 2, 3, false, 'Bon salaire, encadrement distant', 'Heures supplémentaires payées sans discussion et comité social et économique actif.', 'Encadrement peu présent, décisions prises au siège sans consulter les équipes.', 'Tickets restaurant, participation', 'Chef d’équipe', 'current', 'cdi', 2300, 'month', 11, 60),
  (2, 8, 2, 2, 2, 3, 2, 1, false, 'Horaires décalés épuisants', 'Formation CACES financée par l’entreprise et équipements de sécurité de bonne qualité.', 'Rotation des horaires chaque semaine, peu de récupération entre deux postes de nuit.', null, 'Cariste', 'former', 'cdd', null, null, 7, 150),
  (2, 9, 3, 4, 3, 3, 3, 3, null, 'Correct pour un premier poste', 'Ambiance d’équipe agréable et possibilité d’évoluer vers un poste de coordination.', 'Entrepôt mal chauffé l’hiver, pauses parfois écourtées lors des pics d’activité.', null, 'Agent logistique', 'current', 'cdi', 1850, 'month', 4, 30),
  (2, 10, 2, null, null, null, 1, null, false, 'Communication interne à améliorer', 'Site bien situé, accessible et parking gratuit pour les salariés.', 'Informations importantes transmises au dernier moment, peu de reconnaissance du travail.', null, null, 'former', 'cdi', null, null, 2, 400),
  (3, 2, 4, 5, 3, 3, 4, 3, true, 'Une brigade soudée', 'Produits de qualité, encadrement exigeant mais juste et vraie transmission du métier.', 'Coupures longues entre les services et week-ends rarement libres.', 'Repas fournis pendant le service', 'Commis de cuisine', 'current', 'cdi', 1900, 'month', 5, 25),
  (3, 3, 3, 4, 2, 3, 3, 2, null, 'Beau métier, rythme intense', 'Clientèle agréable et pourboires répartis équitablement entre toute l’équipe.', 'Salaire de base bas pour les heures effectuées, heures supplémentaires difficiles à récupérer.', null, 'Serveur', 'former', 'cdd', null, null, 3, 90),
  (3, 4, 4, 4, 4, 3, 4, 4, true, 'Bonne expérience en alternance', 'Tuteur disponible et rotation sur plusieurs postes pour apprendre la salle et la cuisine.', 'Planning communiqué une semaine à l’avance seulement, peu pratique avec l’école.', null, 'Apprenti en salle', 'former', 'apprenticeship', null, null, 2, 180),
  (3, 5, 4, null, null, null, null, null, true, 'Restaurant bien tenu', 'Hygiène irréprochable, équipements récents et respect des temps de pause.', 'Peu de possibilités d’augmentation après les deux premières années.', null, 'Plongeur', 'current', 'cdi', null, null, 0, 12),
  (4, 6, 3, 4, 3, 4, 2, 2, null, 'Des soignants investis, trop peu nombreux', 'Équipe pluridisciplinaire solidaire et formations continues régulières.', 'Sous-effectif chronique, rappels fréquents sur les jours de repos.', 'Crèche d’entreprise, CSE', 'Infirmier', 'current', 'cdi', 2450, 'month', 18, 40),
  (4, 7, 2, 3, 2, 3, 1, 2, false, 'Charge de travail trop lourde', 'Patients reconnaissants et locaux rénovés récemment.', 'Plannings modifiés sans concertation, difficile de concilier vie de famille et service.', null, 'Aide-soignant', 'former', 'cdi', null, null, 12, 110),
  (4, 8, 4, 4, 4, 4, 4, 3, true, 'Bon établissement pour se former', 'Accueil des nouveaux arrivants sérieux et matériel médical moderne.', 'Stationnement compliqué autour de la clinique aux heures de relève.', null, 'Manipulateur radio', 'current', 'cdi', null, null, 4, 70),
  (4, 1, 3, 3, 3, 4, 3, 3, null, 'Mitigé', 'Bonne mutuelle, prime d’assiduité et comité social et économique dynamique.', 'Communication entre la direction et les services encore trop descendante.', 'Mutuelle et prévoyance avantageuses', 'Secrétaire médicale', 'current', 'cdd', 1750, 'month', 1, 15),
  (5, 2, 4, 3, 5, 4, 4, 2, true, 'Très formateur, très exigeant', 'Missions stratégiques pour de grands comptes et montée en compétences très rapide.', 'Semaines de 55 heures fréquentes en période de rendu, équilibre de vie compliqué.', 'Prime sur objectifs, carte déjeuner', 'Consultante junior', 'current', 'cdi', 46000, 'year', 22, 35),
  (5, 3, 5, 4, 5, 5, 4, 3, true, 'Rémunération au rendez-vous', 'Salaires et bonus nettement au-dessus du marché, formations certifiantes financées.', 'Pression commerciale forte et évaluations annuelles parfois stressantes.', 'Bonus annuel, abonnement sport', 'Manager', 'former', 'cdi', 72000, 'year', 15, 260),
  (5, 4, 3, 3, 4, 4, 2, 2, false, 'Culture du présentéisme', 'Réseau professionnel très riche et grande diversité des secteurs couverts.', 'Réunions tardives, attentes implicites de disponibilité le soir et le week-end.', null, 'Consultant', 'former', 'cdi', 52000, 'year', 9, 190),
  (5, 9, 4, 5, 3, 4, 5, 4, true, 'Encadrement à l’écoute', 'Entretiens individuels réguliers, retours constructifs et mobilité interne encouragée.', 'Grille des salaires peu transparente pour les profils en reconversion.', null, 'Analyste', 'current', 'cdi', null, null, 5, 55),
  (5, 10, 4, 4, 4, 4, 4, 3, true, 'Bon tremplin', 'Stage correctement rémunéré avec de vraies responsabilités sur les livrables clients.', 'Peu de retours formels à la fin du stage sur les axes d’amélioration.', null, 'Stagiaire en conseil', 'former', 'internship', 1800, 'month', 3, 330),
  (6, 5, 4, 5, 3, 3, 4, 4, true, 'Esprit d’équipe sur les chantiers', 'Collègues expérimentés qui transmettent volontiers, matériel bien entretenu.', 'Déplacements fréquents et temps de trajet non comptés dans les heures.', 'Paniers repas, véhicule de service', 'Maçon', 'current', 'cdi', 2100, 'month', 6, 50),
  (6, 6, 3, 3, 3, 2, 3, 3, null, 'Correct sans plus', 'Sécurité prise au sérieux avec des formations régulières sur les chantiers.', 'Primes irrégulières et peu d’informations sur les critères d’attribution.', null, 'Conducteur de travaux', 'former', 'cdi', null, null, 2, 240),
  (6, 8, 4, null, null, null, null, null, true, 'Entreprise familiale sérieuse', 'Paie toujours versée à l’heure, direction accessible et respectueuse.', 'Outils de gestion un peu datés pour le suivi des chantiers.', null, null, 'current', 'cdi', null, null, 1, 20),
  (7, 9, 5, 5, 4, 4, 5, 5, true, 'Une mission qui a du sens', 'Accompagner des personnes en reconversion est très gratifiant, équipe pédagogique soudée.', 'Contrats courts en début de parcours avant d’obtenir un poste stable.', 'Horaires aménageables', 'Formatrice', 'current', 'cdd', 2200, 'month', 4, 28),
  (7, 10, 4, 4, 3, 4, 4, 4, true, 'Structure humaine', 'Autonomie dans la conception des modules et reconnaissance du travail accompli.', 'Budget matériel limité, certains supports de cours sont à refaire soi-même.', null, 'Coordinateur pédagogique', 'former', 'cdi', null, null, 1, 140),
  (8, 7, 3, 4, 2, 2, 3, 4, null, 'Petite équipe, grande liberté', 'Autonomie sur les commandes et ambiance très conviviale avec les clients du quartier.', 'Salaire au minimum légal et aucune perspective d’évolution dans une si petite structure.', null, 'Vendeur', 'former', 'cdi', null, null, 0, 500)
) as v(company, author, overall, culture, salary, perks, management, work_life, recommends, title, pros, cons,
       benefits, job, employment, contract, amount, period, helpful, days)
on conflict do nothing;

commit;

-- Vérification : 9 fiches de démo, 30 avis publiés (Studio Pollen reste sans avis, Épicerie Solstice est fermée).
select name, review_count, avg_overall, recommend_pct
from public.companies_with_stats
where id::text like 'dc000000-0000-4000-8000-%'
order by review_count desc, name;
