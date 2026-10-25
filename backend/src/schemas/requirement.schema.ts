import { z } from "zod";

export const eventTypeEnum = z.enum([
  "Wedding",
  "Corporate",
  "Concert",
  "Birthday",
  "Festival",
  "Other",
]);

export const dateTypeEnum = z.enum(["single", "range"]);

// Planner Details Schema
export const plannerServicesEnum = z.enum([
  "decor",
  "catering",
  "AV",
  "photography",
  "logistics",
  "other",
]);

export const plannerDetailsSchema = z
  .object({
    services: z
      .array(plannerServicesEnum)
      .min(1, { message: "At least one service is required" }),
    guestCount: z
      .number({ required_error: "Guest count is required" })
      .int({ message: "Guest count must be an integer" })
      .min(1, { message: "Guest count must be at least 1" }),
    theme: z.string().trim().optional(),
    budgetMin: z
      .number({ required_error: "Minimum budget is required" })
      .min(0, { message: "Minimum budget cannot be negative" }),
    budgetMax: z
      .number({ required_error: "Maximum budget is required" })
      .min(0, { message: "Maximum budget cannot be negative" }),
    planningDeadline: z
      .string()
      .or(z.date())
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),
    notes: z.string().trim().optional(),
  })
  .strict({ message: "Unknown fields in planner details" })
  .refine((data) => data.budgetMax >= data.budgetMin, {
    message: "Maximum budget must be greater than or equal to minimum budget",
    path: ["budgetMax"],
  });

// Performer Details Schema
export const performerTypeEnum = z.enum([
  "DJ",
  "Singer",
  "Band",
  "Dancer",
  "Comedian",
  "Magician",
  "Other",
]);

export const performerDetailsSchema = z
  .object({
    performerType: performerTypeEnum,
    genre: z.string().trim().min(1, { message: "Genre is required" }),
    performanceDurationMins: z
      .number({ required_error: "Performance duration is required" })
      .min(15, { message: "Performance duration must be at least 15 minutes" }),
    numberOfPerformers: z
      .number({ required_error: "Number of performers is required" })
      .int()
      .min(1, { message: "Must have at least 1 performer" }),
    equipmentProvidedByHost: z.boolean({
      required_error: "equipmentProvidedByHost is required",
    }),
    technicalRequirements: z.string().trim().optional(),
    budgetPerPerformance: z
      .number({ required_error: "Budget per performance is required" })
      .min(0, { message: "Budget cannot be negative" }),
    travelAccommodationCovered: z.boolean({
      required_error: "travelAccommodationCovered is required",
    }),
  })
  .strict({ message: "Unknown fields in performer details" });

// Crew Details Schema
export const crewRoleEnum = z.enum([
  "Sound",
  "Lighting",
  "Stage",
  "Security",
  "Photography",
  "Videography",
  "Catering Staff",
  "Other",
]);

export const crewRoleItemSchema = z
  .object({
    role: crewRoleEnum,
    count: z
      .number({ required_error: "Role count is required" })
      .int()
      .min(1, { message: "Role count must be at least 1" }),
  })
  .strict({ message: "Unknown fields in crew role item" });

const callTimeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const crewDetailsSchema = z
  .object({
    roles: z
      .array(crewRoleItemSchema)
      .min(1, { message: "At least one crew role is required" }),
    shiftHours: z
      .number({ required_error: "Shift hours is required" })
      .min(1, { message: "Shift hours must be between 1 and 24" })
      .max(24, { message: "Shift hours must be between 1 and 24" }),
    experienceLevel: z.enum(["Entry", "Intermediate", "Expert"]),
    dailyRate: z
      .number({ required_error: "Daily rate is required" })
      .min(0, { message: "Daily rate cannot be negative" }),
    callTime: z.string().regex(callTimeRegex, {
      message: "Call time must be in HH:mm format (e.g. 09:00)",
    }),
    requiredCertifications: z.array(z.string().trim()).optional().default([]),
  })
  .strict({ message: "Unknown fields in crew details" });

// Date helper for not in past
const isNotPastDate = (dateVal: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateVal);
  target.setHours(0, 0, 0, 0);
  return target.getTime() >= today.getTime();
};

// Base Fields Definition
const baseFields = {
  eventName: z
    .string({ required_error: "Event name is required" })
    .trim()
    .min(3, { message: "Event name must be at least 3 characters" })
    .max(120, { message: "Event name must not exceed 120 characters" }),
  eventType: eventTypeEnum,
  dateType: dateTypeEnum,
  startDate: z
    .string({ required_error: "Start date is required" })
    .or(z.date())
    .transform((val) => new Date(val))
    .refine((date) => !isNaN(date.getTime()), { message: "Invalid start date" })
    .refine((date) => isNotPastDate(date), {
      message: "Start date cannot be in the past",
    }),
  endDate: z
    .string()
    .or(z.date())
    .optional()
    .transform((val) => (val ? new Date(val) : undefined))
    .refine((date) => (date ? !isNaN(date.getTime()) : true), {
      message: "Invalid end date",
    }),
  location: z
    .string({ required_error: "Location is required" })
    .trim()
    .min(1, { message: "Location is required" }),
  venue: z.string().trim().optional(),
};

// Raw category objects (required by z.discriminatedUnion)
export const plannerRequirementRawSchema = z
  .object({
    ...baseFields,
    category: z.literal("planner"),
    details: plannerDetailsSchema,
  })
  .strict({ message: "Unknown fields in payload" });

export const performerRequirementRawSchema = z
  .object({
    ...baseFields,
    category: z.literal("performer"),
    details: performerDetailsSchema,
  })
  .strict({ message: "Unknown fields in payload" });

export const crewRequirementRawSchema = z
  .object({
    ...baseFields,
    category: z.literal("crew"),
    details: crewDetailsSchema,
  })
  .strict({ message: "Unknown fields in payload" });

// Discriminated union across category
export const requirementBaseUnion = z.discriminatedUnion("category", [
  plannerRequirementRawSchema,
  performerRequirementRawSchema,
  crewRequirementRawSchema,
]);

// Refined schema checking date consistency and planningDeadline
export const requirementInputSchema = requirementBaseUnion.superRefine((data, ctx) => {
  if (data.dateType === "range") {
    if (!data.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "End date is required when dateType is 'range'",
      });
    } else if (data.endDate.getTime() < data.startDate.getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "End date must be on or after start date",
      });
    }
  }

  if (data.category === "planner" && data.details.planningDeadline) {
    if (data.details.planningDeadline.getTime() >= data.startDate.getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["details", "planningDeadline"],
        message: "Planning deadline must be before event start date",
      });
    }
  }
});

export type RequirementInput = z.infer<typeof requirementInputSchema>;
export type PlannerRequirementInput = z.infer<typeof plannerRequirementRawSchema>;
export type PerformerRequirementInput = z.infer<typeof performerRequirementRawSchema>;
export type CrewRequirementInput = z.infer<typeof crewRequirementRawSchema>;
