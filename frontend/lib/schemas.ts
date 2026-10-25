import { z } from "zod";

export const eventTypeOptions = [
  "Wedding",
  "Corporate",
  "Concert",
  "Birthday",
  "Festival",
  "Other",
] as const;

export const categoryOptions = [
  {
    id: "planner",
    title: "Event Planner",
    description: "Full-service or partial event coordination, catering, decor & logistics.",
    badge: "Coordination",
  },
  {
    id: "performer",
    title: "Performer",
    description: "Musicians, DJs, dancers, bands, anchors and live stage acts.",
    badge: "Entertainment",
  },
  {
    id: "crew",
    title: "Crew & Tech",
    description: "Sound, lighting, stagehands, security, AV and catering staff.",
    badge: "Operations",
  },
] as const;

export type CategoryKey = "planner" | "performer" | "crew";

export const plannerServices = [
  { id: "decor", label: "Decor & Styling" },
  { id: "catering", label: "Food & Catering" },
  { id: "AV", label: "Audio / Visual (AV)" },
  { id: "photography", label: "Photography & Video" },
  { id: "logistics", label: "Logistics & Transport" },
  { id: "other", label: "Other Services" },
] as const;

export const performerTypes = [
  "DJ",
  "Singer",
  "Band",
  "Dancer",
  "Comedian",
  "Magician",
  "Other",
] as const;

export const crewRolesList = [
  "Sound",
  "Lighting",
  "Stage",
  "Security",
  "Photography",
  "Videography",
  "Catering Staff",
  "Other",
] as const;

export const experienceLevels = ["Entry", "Intermediate", "Expert"] as const;

// Date helper: not in the past (comparing midnight local)
const isNotPast = (dateStr: string) => {
  if (!dateStr) return false;
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return target.getTime() >= today.getTime();
};

// Step 1: Event Basics Schema
export const eventBasicsSchema = z
  .object({
    eventName: z
      .string()
      .trim()
      .min(3, "Event name must be at least 3 characters")
      .max(120, "Event name must not exceed 120 characters"),
    eventType: z.enum(eventTypeOptions, {
      message: "Please select an event type",
    }),
    dateType: z.enum(["single", "range"]),
    startDate: z
      .string()
      .min(1, "Start date is required")
      .refine(isNotPast, "Start date cannot be in the past"),
    endDate: z.string().optional(),
    location: z.string().trim().min(1, "Location is required"),
    venue: z.string().trim().optional(),
    category: z.enum(["planner", "performer", "crew"], {
      message: "Please select a category",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.dateType === "range") {
      if (!data.endDate || data.endDate.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endDate"],
          message: "End date is required for a date range",
        });
      } else {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end < start) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["endDate"],
            message: "End date must be on or after start date",
          });
        }
      }
    }
  });

export type EventBasicsFormValues = z.infer<typeof eventBasicsSchema>;

// Step 2 & 3: Planner Schemas
export const plannerStep2Schema = z.object({
  services: z.array(z.string()).min(1, "Select at least one service"),
  guestCount: z.coerce
    .number()
    .int("Guest count must be an integer")
    .min(1, "Guest count must be at least 1"),
  theme: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export type PlannerStep2FormValues = z.infer<typeof plannerStep2Schema>;

export const createPlannerStep3Schema = (eventStartDate?: string) =>
  z
    .object({
      budgetMin: z.coerce.number().min(0, "Budget cannot be negative"),
      budgetMax: z.coerce.number().min(0, "Budget cannot be negative"),
      planningDeadline: z.string().optional(),
    })
    .refine((data) => data.budgetMax >= data.budgetMin, {
      message: "Max budget must be greater than or equal to min budget",
      path: ["budgetMax"],
    })
    .refine(
      (data) => {
        if (!data.planningDeadline || !eventStartDate) return true;
        const deadline = new Date(data.planningDeadline);
        const start = new Date(eventStartDate);
        if (isNaN(deadline.getTime()) || isNaN(start.getTime())) return true;
        return deadline.getTime() < start.getTime();
      },
      {
        message: "Planning deadline must be before the event start date",
        path: ["planningDeadline"],
      }
    );

export type PlannerStep3FormValues = z.infer<ReturnType<typeof createPlannerStep3Schema>>;

// Step 2 & 3: Performer Schemas
export const performerStep2Schema = z.object({
  performerType: z.enum(performerTypes, {
    message: "Select a performer type",
  }),
  genre: z.string().trim().min(1, "Genre / Style is required"),
  performanceDurationMins: z.coerce
    .number()
    .min(15, "Duration must be at least 15 minutes"),
  numberOfPerformers: z.coerce
    .number()
    .int()
    .min(1, "Must have at least 1 performer"),
});

export type PerformerStep2FormValues = z.infer<typeof performerStep2Schema>;

export const performerStep3Schema = z.object({
  budgetPerPerformance: z.coerce
    .number()
    .min(0, "Budget cannot be negative"),
  equipmentProvidedByHost: z.boolean(),
  travelAccommodationCovered: z.boolean(),
  technicalRequirements: z.string().trim().optional(),
});

export type PerformerStep3FormValues = z.infer<typeof performerStep3Schema>;

// Step 2 & 3: Crew Schemas
export const crewRoleItemFormSchema = z.object({
  role: z.enum(crewRolesList, {
    message: "Select a role",
  }),
  count: z.coerce
    .number()
    .int()
    .min(1, "Count must be at least 1"),
});

export const crewStep2Schema = z.object({
  roles: z.array(crewRoleItemFormSchema).min(1, "At least one crew role must be specified"),
});

export type CrewStep2FormValues = z.infer<typeof crewStep2Schema>;

const callTimeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const crewStep3Schema = z.object({
  shiftHours: z.coerce
    .number()
    .min(1, "Shift hours must be between 1 and 24")
    .max(24, "Shift hours must be between 1 and 24"),
  experienceLevel: z.enum(experienceLevels, {
    message: "Select an experience level",
  }),
  dailyRate: z.coerce.number().min(0, "Daily rate cannot be negative"),
  callTime: z.string().regex(callTimeRegex, "Call time must be in HH:mm format (e.g. 09:30)"),
  requiredCertifications: z.string().optional(),
});

export type CrewStep3FormValues = z.infer<typeof crewStep3Schema>;
