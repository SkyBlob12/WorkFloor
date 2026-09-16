import type { IconName } from '@app-types/icons';

/** Sections de la nomenclature NAF (lettre renvoyée par SIRENE). Libellé : `companies:sector.<lettre>`. */
export const NAF_SECTIONS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K',
  'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U',
] as const;

/** Tranches d'effectif salarié INSEE. Libellé : `companies:employeeRange.<code>`. */
export const EMPLOYEE_RANGES = [
  'NN', '00', '01', '02', '03', '11', '12', '21', '22',
  '31', '32', '41', '42', '51', '52', '53',
] as const;

/** Pictogramme de chaque section NAF (cartes « Explorer par secteur »). */
export const SECTOR_ICONS: Record<(typeof NAF_SECTIONS)[number], IconName> = {
  A: 'sun',
  B: 'hexagon',
  C: 'tool',
  D: 'zap',
  E: 'droplet',
  F: 'home',
  G: 'shopping-bag',
  H: 'truck',
  I: 'coffee',
  J: 'monitor',
  K: 'credit-card',
  L: 'key',
  M: 'briefcase',
  N: 'clipboard',
  O: 'flag',
  P: 'book-open',
  Q: 'heart',
  R: 'music',
  S: 'scissors',
  T: 'users',
  U: 'globe',
};

/**
 * Annuaire chargé une fois pour la page de découverte (secteurs, villes, classements calculés côté app).
 * Au-delà de quelques centaines de fiches, remplacer par des agrégats SQL (RPC).
 */
export const DIRECTORY_LIMIT = 500;
export const TOP_RATED_MIN_REVIEWS = 2;
export const HOME_CAROUSEL_SIZE = 8;
export const CITY_FACET_LIMIT = 8;
export const MOST_REVIEWED_LIMIT = 10;

export const SEARCH_DEBOUNCE_MS = 300;
export const SIRENE_DEBOUNCE_MS = 400;
export const SIRENE_MIN_QUERY_LENGTH = 3;
export const SEARCH_RESULTS_LIMIT = 20;
export const SIRENE_SEARCH_URL = 'https://recherche-entreprises.api.gouv.fr/search';
