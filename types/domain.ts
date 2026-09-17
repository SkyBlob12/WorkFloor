import type { EMPLOYEE_RANGES, NAF_SECTIONS } from '@constants/companies';
import type {
  CONTRACT_TYPES,
  EMPLOYMENT_STATUSES,
  HOLD_REASONS,
  MODERATION_DECISIONS,
  RATING_CRITERIA,
  REPORT_REASONS,
  REVIEW_SORTS,
  REVIEW_STATUSES,
  SALARY_PERIODS,
} from '@constants/reviews';
import type { SERVICE_ERROR_CODES } from '@constants/serviceErrors';

export type EmploymentStatus = (typeof EMPLOYMENT_STATUSES)[number];
export type ContractType = (typeof CONTRACT_TYPES)[number];
export type SalaryPeriod = (typeof SALARY_PERIODS)[number];
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];
export type HoldReason = (typeof HOLD_REASONS)[number];
export type ReportReason = (typeof REPORT_REASONS)[number];
export type ModerationDecision = (typeof MODERATION_DECISIONS)[number];
export type RatingCriterion = (typeof RATING_CRITERIA)[number];
export type ReviewSort = (typeof REVIEW_SORTS)[number];
export type NafSection = (typeof NAF_SECTIONS)[number];
export type EmployeeRange = (typeof EMPLOYEE_RANGES)[number];
/** URL de la photo d'illustration de chaque section NAF (table `sector_photos`), partielle si une ligne manque. */
export type SectorPhotos = Partial<Record<NafSection, string>>;
export type ServiceErrorCode = (typeof SERVICE_ERROR_CODES)[number];

export type RatingField = `rating_${RatingCriterion}`;
export type AverageField = `avg_${RatingCriterion}`;

/** Ligne de la vue `companies_with_stats`. */
export interface Company extends Record<AverageField, number | null> {
  id: string;
  siren: string | null;
  siret: string | null;
  name: string;
  naf_code: string | null;
  sector: string | null;
  city: string | null;
  postal_code: string | null;
  employee_range: string | null;
  is_active: boolean;
  verified: boolean;
  created_at: string;
  review_count: number;
  avg_overall: number | null;
  recommend_pct: number | null;
  /** Activité inhabituelle détectée : les avis récents sont exclus des moyennes le temps d'une vérification. */
  under_review: boolean;
}

/** Contenu éditable d'un avis. */
export interface ReviewDraft extends Record<RatingField, number | null> {
  rating_overall: number;
  recommends: boolean | null;
  title: string;
  pros: string;
  cons: string;
  benefits: string | null;
  job_title: string | null;
  employment_status: EmploymentStatus;
  contract_type: ContractType | null;
  salary_amount: number | null;
  salary_period: SalaryPeriod | null;
}

/** Ligne de la vue `reviews_public` : aucune donnée d'identification. */
export interface PublicReview extends ReviewDraft {
  id: string;
  company_id: string;
  helpful_count: number;
  published_month: string;
  is_edited: boolean;
  is_mine: boolean;
  voted_helpful: boolean;
  /** Ville du site, null tant que la ville compte moins de SITE_CITY_MIN_REVIEWS avis (anonymat). */
  site_city: string | null;
}

/** Site d'un avis relu par son auteur (table `company_sites`, RLS : sites de ses avis). */
export interface ReviewSite {
  siret: string;
  city: string | null;
  postal_code: string | null;
}

/** Avis de l'utilisateur connecté (table `reviews`, RLS : ses propres lignes). */
export interface OwnReview extends ReviewDraft {
  id: string;
  company_id: string;
  status: ReviewStatus;
  hold_reason: HoldReason | null;
  held_until: string | null;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  company: { name: string } | null;
  site_id: string | null;
  site: ReviewSite | null;
}

/** Entreprise trouvée dans le répertoire SIRENE, normalisée. */
export interface SireneCompany {
  siren: string;
  siret: string | null;
  name: string;
  city: string | null;
  postalCode: string | null;
  nafCode: string | null;
  sectionCode: string | null;
  employeeRange: string | null;
  isActive: boolean;
  isSoleProprietor: boolean;
}

/** Établissement d'une entreprise trouvé dans SIRENE, normalisé. */
export interface CompanySite {
  siret: string;
  city: string | null;
  postalCode: string | null;
  address: string | null;
  isActive: boolean;
  isHeadquarters: boolean;
}

/** Site choisi dans le formulaire d'avis. */
export type SelectedSite = Pick<CompanySite, 'siret' | 'city' | 'postalCode'>;

/** Ligne de `company_city_stats` : villes atteignant le seuil d'anonymat. */
export interface CityStat {
  city: string;
  review_count: number;
  avg_overall: number | null;
}

/** Réponse de l'Edge Function submit-review. */
export interface SubmitReviewResult {
  id: string;
  status: ReviewStatus;
  hold_reason: HoldReason | null;
}

export interface ReviewsPage {
  reviews: PublicReview[];
  nextOffset: number | null;
}

/** Signalement ouvert, sans identité de l'auteur du signalement. */
export interface ModerationReport {
  id: string;
  reason: ReportReason;
  details: string | null;
  created_at: string;
}

/** Ligne de la fonction `moderation_queue` (modérateurs seulement, jamais d'identifiant d'auteur). */
export interface ModerationItem {
  review_id: string;
  company_id: string;
  company_name: string;
  status: ReviewStatus;
  hold_reason: HoldReason | null;
  rating_overall: number;
  title: string;
  pros: string;
  cons: string;
  benefits: string | null;
  job_title: string | null;
  moderation_flags: Record<string, unknown> | null;
  report_count: number;
  created_at: string;
  reports: ModerationReport[];
}
