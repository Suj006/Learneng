import { z } from "zod";

/**
 * Age range for Explorers. Single source of truth for the sign-up form, the add-child form and the server.
 * Only birth MONTH and YEAR are collected (never the full date of birth).
 */
export const AGE_MIN = 5;
export const AGE_MAX = 13;
export const AGE_MESSAGE = `PING VIBE is for children aged ${AGE_MIN}–${AGE_MAX}. Please check the birth month and year.`;
export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] as const;

/** Age in whole years on `today`, counting a birthday as reached from the first day of the birth month. */
export function ageFrom(birthMonth: number, birthYear: number, today = new Date()) {
  const m = today.getMonth() + 1;
  return today.getFullYear() - birthYear - (birthMonth > m ? 1 : 0);
}
/** Birth years that can give an allowed age (newest first). The exact check also uses the month. */
export function birthYearOptions(today = new Date()) {
  const y = today.getFullYear();
  return Array.from({ length: AGE_MAX - AGE_MIN + 2 }, (_, i) => y - AGE_MIN - i);
}

const childFields = {
  childName: z.string({ error: "Please enter your child's first name." }).trim().min(1, "Please enter your child's first name.").max(40, "Name is too long.")
    .regex(/^[\p{L} .'-]+$/u, "Use letters only for the name."),
  birthMonth: z.coerce.number({ error: "Please choose the birth month." }).int().min(1, "Please choose the birth month.").max(12, "Please choose the birth month."),
  birthYear: z.coerce.number({ error: "Please choose the birth year." }).int().min(1900, "Please choose the birth year.").max(9999, "Please choose the birth year."),
  grade: z.string({ error: "Please choose a grade." }).regex(/^[A-Z0-9_]{2,12}$/, "Please choose a grade."),
};
const ageOk = (d: { birthMonth: number; birthYear: number }) => { const a = ageFrom(d.birthMonth, d.birthYear); return a >= AGE_MIN && a <= AGE_MAX; };
const ageRule = { message: AGE_MESSAGE, path: ["birthYear"] };

export const childDetails = z.object(childFields).refine(ageOk, ageRule);

export const password = z.string().min(8, "Password needs at least 8 characters.").max(128)
  .regex(/[A-Za-z]/, "Add at least one letter to the password.").regex(/\d/, "Add at least one number to the password.");

export const registerSchema = z.object({
  ...childFields,
  parentEmail: z.string().trim().email("Please enter a valid e-mail address.").max(200),
  password,
  isParent: z.literal(true, { error: "Only a parent or legal guardian can create an account." }),
}).refine(ageOk, ageRule);

export const pinSchema = z.string().regex(/^\d{6}$/, "The secret PIN must be exactly 6 digits.")
  .refine((p) => !/^(\d)\1{5}$/.test(p) && !["123456", "654321", "012345", "123123"].includes(p), "That PIN is too easy to guess. Try another one.");
