import { EMPLOYEE_RANGES, NAF_SECTIONS } from '@constants/companies';
import type { EmployeeRange, NafSection } from '@app-types/domain';

/** Divisions NAF (2 premiers chiffres du code APE) regroupées par section. */
const DIVISION_RANGES: readonly (readonly [number, number, NafSection])[] = [
  [1, 3, 'A'],
  [5, 9, 'B'],
  [10, 33, 'C'],
  [35, 35, 'D'],
  [36, 39, 'E'],
  [41, 43, 'F'],
  [45, 47, 'G'],
  [49, 53, 'H'],
  [55, 56, 'I'],
  [58, 63, 'J'],
  [64, 66, 'K'],
  [68, 68, 'L'],
  [69, 75, 'M'],
  [77, 82, 'N'],
  [84, 84, 'O'],
  [85, 85, 'P'],
  [86, 88, 'Q'],
  [90, 93, 'R'],
  [94, 96, 'S'],
  [97, 98, 'T'],
  [99, 99, 'U'],
];

/** Section NAF (lettre) à partir d'un code APE comme « 70.10Z ». Le libellé se traduit à l'affichage. */
export function nafSectionFromCode(code: string | null): NafSection | null {
  if (!code) return null;
  const division = Number.parseInt(code.slice(0, 2), 10);
  if (Number.isNaN(division)) return null;
  return DIVISION_RANGES.find(([min, max]) => division >= min && division <= max)?.[2] ?? null;
}

export function isNafSection(value: string | null): value is NafSection {
  return value !== null && (NAF_SECTIONS as readonly string[]).includes(value);
}

export function isEmployeeRange(value: string | null): value is EmployeeRange {
  return value !== null && (EMPLOYEE_RANGES as readonly string[]).includes(value);
}
