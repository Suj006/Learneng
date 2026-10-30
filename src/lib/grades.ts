export const GRADES = [
  { value: "PRE_KG", label: "Pre-KG" },
  { value: "LKG", label: "LKG" },
  { value: "UKG", label: "UKG" },
  { value: "G1", label: "Grade 1" },
  { value: "G2", label: "Grade 2" },
  { value: "G3", label: "Grade 3" },
  { value: "G4", label: "Grade 4" },
  { value: "G5", label: "Grade 5" },
  { value: "G6", label: "Grade 6" },
  { value: "G7", label: "Grade 7" },
] as const;
export type Grade = (typeof GRADES)[number]["value"];
export const GRADE_VALUES = GRADES.map((g) => g.value) as [Grade, ...Grade[]];

/** Server boot loads grade_config here so admin-added grades work everywhere without code changes. */
type Registry = { bands: Record<string, number>; labels: Record<string, string> };
const registry = (): Registry => ((globalThis as any).__pvGrades ??= { bands: {}, labels: {} });
export function registerGrades(rows: { grade: string; band: number; label: string }[]) {
  const r = registry();
  for (const g of rows) { r.bands[g.grade] = g.band; r.labels[g.grade] = g.label; }
}

export const gradeLabel = (g: string) => registry().labels[g] ?? GRADES.find((x) => x.value === g)?.label ?? g;

/** Age & Grade Intelligence: starting vocabulary band for a grade. */
export function bandForGrade(g: string): 1 | 2 | 3 | 4 {
  const b = registry().bands[g];
  if (b) return b as 1 | 2 | 3 | 4;
  if (g === "PRE_KG" || g === "LKG" || g === "UKG") return 1;
  if (g === "G1" || g === "G2") return 2;
  if (g === "G3" || g === "G4") return 3;
  return 4;
}

export const BAND_LABEL: Record<number, string> = {
  1: "Little Explorers (Pre-KG–UKG)",
  2: "Junior Explorers (Grades 1–2)",
  3: "Super Explorers (Grades 3–4)",
  4: "Master Explorers (Grades 5–7)",
};

export function ageFrom(month: number, year: number, now = new Date()) {
  let age = now.getFullYear() - year;
  if (now.getMonth() + 1 < month) age -= 1;
  return age;
}
