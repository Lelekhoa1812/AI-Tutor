import { z } from "zod";

export const roleGradeSchema = z.object({
  role: z.enum(["student", "teacher", "parent"]),
  grade: z.number().min(1).max(12),
});

export const pdfUploadSchema = z.object({
  pdfUrl: z.string().url(),
});

export const calendarPreferencesSchema = z.object({
  daysPerWeek: z.number().min(1).max(7),
  hoursPerDay: z.number().min(1).max(24),
});

export const onboardingSchema = z.object({
  roleGrade: roleGradeSchema,
  pdfUpload: pdfUploadSchema,
  calendarPreferences: calendarPreferencesSchema,
});

export type RoleGrade = z.infer<typeof roleGradeSchema>;
export type PdfUpload = z.infer<typeof pdfUploadSchema>;
export type CalendarPreferences = z.infer<typeof calendarPreferencesSchema>;
export type OnboardingData = z.infer<typeof onboardingSchema>; 