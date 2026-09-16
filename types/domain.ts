import type { EMPLOYEE_RANGES, NAF_SECTIONS } from '@constants/companies';
import type {
  CONTRACT_TYPES,
  EMPLOYMENT_STATUSES,
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
export type ReportReason = (typeof REPORT_REASONS)[number];
export type RatingCriterion = (typeof RATING_CRITERIA)[number];
export type ReviewSort = (typeof REVIEW_SORTS)[number];
export type NafSection = (typeof NAF_SECTIONS)[number];
export type EmployeeRange = (typeof EMPLOYEE_RANGES)[number];
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
}

/** Avis de l'utilisateur connecté (table `reviews`, RLS : ses propres lignes). */
export interface OwnReview extends ReviewDraft {
  id: string;
  company_id: string;
  status: ReviewStatus;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  company: { name: string } | null;
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

export interface ReviewsPage {
  reviews: PublicReview[];
  nextOffset: number | null;
}
