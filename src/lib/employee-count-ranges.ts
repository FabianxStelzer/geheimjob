export const EMPLOYEE_COUNT_RANGE_OPTIONS = [
  "1–10",
  "11–50",
  "51–200",
  "201–500",
  "500+",
] as const;

export type EmployeeCountRange = (typeof EMPLOYEE_COUNT_RANGE_OPTIONS)[number];

export function isValidEmployeeCountRange(value: string): value is EmployeeCountRange {
  return (EMPLOYEE_COUNT_RANGE_OPTIONS as readonly string[]).includes(value);
}

export function companyAgeYears(foundedYear: number | null | undefined): number | null {
  if (!foundedYear || foundedYear < 1800 || foundedYear > new Date().getFullYear()) {
    return null;
  }
  return new Date().getFullYear() - foundedYear;
}
