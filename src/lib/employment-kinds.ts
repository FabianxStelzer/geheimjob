export const EMPLOYMENT_KIND_OPTIONS = [
  "Festanstellung",
  "Ausbildung / Azubi",
  "Werkstudent",
  "Praktikum",
  "Ferienjob",
  "Aushilfe / Minijob",
  "Freiberuflich",
  "Projektbezogen",
] as const;

export type EmploymentKindOption = (typeof EMPLOYMENT_KIND_OPTIONS)[number];

export function isValidEmploymentKind(value: string): value is EmploymentKindOption {
  return (EMPLOYMENT_KIND_OPTIONS as readonly string[]).includes(value);
}
