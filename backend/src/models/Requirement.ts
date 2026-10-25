import mongoose, { Schema, Document, Model } from "mongoose";

export type EventType =
  | "Wedding"
  | "Corporate"
  | "Concert"
  | "Birthday"
  | "Festival"
  | "Other";

export type DateType = "single" | "range";
export type CategoryType = "planner" | "performer" | "crew";

// Base interface
export interface IRequirementBase extends Document {
  eventName: string;
  eventType: EventType;
  dateType: DateType;
  startDate: Date;
  endDate?: Date;
  location: string;
  venue?: string;
  category: CategoryType;
  createdAt: Date;
  updatedAt: Date;
}

// Planner details interface
export interface IPlannerDetails {
  services: string[];
  guestCount: number;
  theme?: string;
  budgetMin: number;
  budgetMax: number;
  planningDeadline?: Date;
  notes?: string;
}

export interface IPlannerRequirement extends IRequirementBase {
  category: "planner";
  details: IPlannerDetails;
}

// Performer details interface
export interface IPerformerDetails {
  performerType: "DJ" | "Singer" | "Band" | "Dancer" | "Comedian" | "Magician" | "Other";
  genre: string;
  performanceDurationMins: number;
  numberOfPerformers: number;
  equipmentProvidedByHost: boolean;
  technicalRequirements?: string;
  budgetPerPerformance: number;
  travelAccommodationCovered: boolean;
}

export interface IPerformerRequirement extends IRequirementBase {
  category: "performer";
  details: IPerformerDetails;
}

// Crew details interface
export interface ICrewRole {
  role: "Sound" | "Lighting" | "Stage" | "Security" | "Photography" | "Videography" | "Catering Staff" | "Other";
  count: number;
}

export interface ICrewDetails {
  roles: ICrewRole[];
  shiftHours: number;
  experienceLevel: "Entry" | "Intermediate" | "Expert";
  dailyRate: number;
  callTime: string;
  requiredCertifications?: string[];
}

export interface ICrewRequirement extends IRequirementBase {
  category: "crew";
  details: ICrewDetails;
}

// Discriminator Base Schema
const baseSchema = new Schema(
  {
    eventName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
    },
    eventType: {
      type: String,
      required: true,
      enum: ["Wedding", "Corporate", "Concert", "Birthday", "Festival", "Other"],
    },
    dateType: {
      type: String,
      required: true,
      enum: ["single", "range"],
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: function (this: IRequirementBase) {
        return this.dateType === "range";
      },
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    venue: {
      type: String,
      trim: true,
      default: undefined,
    },
  },
  {
    discriminatorKey: "category",
    collection: "requirements",
    timestamps: true,
  }
);

// Base Model
export const Requirement: Model<IRequirementBase> =
  mongoose.models.Requirement || mongoose.model<IRequirementBase>("Requirement", baseSchema);

// Planner Discriminator Schema
const plannerSchema = new Schema({
  details: {
    services: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length >= 1,
        message: "At least one service is required",
      },
    },
    guestCount: {
      type: Number,
      required: true,
      min: 1,
    },
    theme: {
      type: String,
      trim: true,
    },
    budgetMin: {
      type: Number,
      required: true,
      min: 0,
    },
    budgetMax: {
      type: Number,
      required: true,
      min: 0,
    },
    planningDeadline: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
});

export const PlannerRequirement: Model<IPlannerRequirement> =
  (Requirement.discriminators && (Requirement.discriminators.planner as Model<IPlannerRequirement>)) ||
  Requirement.discriminator<IPlannerRequirement>("planner", plannerSchema);

// Performer Discriminator Schema
const performerSchema = new Schema({
  details: {
    performerType: {
      type: String,
      required: true,
      enum: ["DJ", "Singer", "Band", "Dancer", "Comedian", "Magician", "Other"],
    },
    genre: {
      type: String,
      required: true,
      trim: true,
    },
    performanceDurationMins: {
      type: Number,
      required: true,
      min: 15,
    },
    numberOfPerformers: {
      type: Number,
      required: true,
      min: 1,
    },
    equipmentProvidedByHost: {
      type: Boolean,
      required: true,
    },
    technicalRequirements: {
      type: String,
      trim: true,
    },
    budgetPerPerformance: {
      type: Number,
      required: true,
      min: 0,
    },
    travelAccommodationCovered: {
      type: Boolean,
      required: true,
    },
  },
});

export const PerformerRequirement: Model<IPerformerRequirement> =
  (Requirement.discriminators && (Requirement.discriminators.performer as Model<IPerformerRequirement>)) ||
  Requirement.discriminator<IPerformerRequirement>("performer", performerSchema);

// Crew Discriminator Schema
const crewRoleSchema = new Schema(
  {
    role: {
      type: String,
      required: true,
      enum: ["Sound", "Lighting", "Stage", "Security", "Photography", "Videography", "Catering Staff", "Other"],
    },
    count: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const crewSchema = new Schema({
  details: {
    roles: {
      type: [crewRoleSchema],
      required: true,
      validate: {
        validator: (v: ICrewRole[]) => Array.isArray(v) && v.length >= 1,
        message: "At least one role is required",
      },
    },
    shiftHours: {
      type: Number,
      required: true,
      min: 1,
      max: 24,
    },
    experienceLevel: {
      type: String,
      required: true,
      enum: ["Entry", "Intermediate", "Expert"],
    },
    dailyRate: {
      type: Number,
      required: true,
      min: 0,
    },
    callTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    requiredCertifications: {
      type: [String],
      default: [],
    },
  },
});

export const CrewRequirement: Model<ICrewRequirement> =
  (Requirement.discriminators && (Requirement.discriminators.crew as Model<ICrewRequirement>)) ||
  Requirement.discriminator<ICrewRequirement>("crew", crewSchema);
