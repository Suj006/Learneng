import { z } from "zod";

const thisYear = new Date().getFullYear();
export const childDetails = z.object({
  childName: z.string().trim().min(1, "Please enter your child's first name.").max(40, "Name is too long.")
    .regex(/^[\p{L} .'-]+$/u, "Use letters only for the name."),
  birthMonth: z.coerce.number().int().min(1).max(12),
  birthYear: z.coerce.number().int().min(thisYear - 15, "PING VIBE is for children aged 5–13.").max(thisYear - 3, "PING VIBE is for children aged 5–13."),
  grade: z.string({ required_error: "Please choose a grade." }).regex(/^[A-Z0-9_]{2,12}$/, "Please choose a grade."),
});

export const password = z.string().min(8, "Password needs at least 8 characters.").max(128)
  .regex(/[A-Za-z]/, "Add at least one letter to the password.").regex(/\d/, "Add at least one number to the password.");

export const registerSchema = childDetails.extend({
  parentEmail: z.string().trim().email("Please enter a valid e-mail address.").max(200),
  password,
  isParent: z.literal(true, { errorMap: () => ({ message: "Only a parent or legal guardian can create an account." }) }),
});

export const pinSchema = z.string().regex(/^\d{6}$/, "The secret PIN must be exactly 6 digits.")
  .refine((p) => !/^(\d)\1{5}$/.test(p) && !["123456", "654321", "012345", "123123"].includes(p), "That PIN is too easy to guess. Try another one.");
