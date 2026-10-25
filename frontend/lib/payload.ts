import { CreateRequirementPayload } from "./api";
import { EventData, AnyDetails } from "../store/wizardStore";
import { CategoryKey } from "./schemas";

/**
 * Builds a strict backend-compatible payload from wizard store state.
 *
 * Rules:
 * 1. dateType === "single" => no endDate included in payload.
 * 2. Empty optional strings (venue, theme, notes, technicalRequirements) are omitted.
 * 3. Only category-specific fields are included in `details` (backend strictly rejects unknown fields).
 */
export function buildRequirementPayload(
  event: EventData,
  category: CategoryKey,
  details: AnyDetails
): CreateRequirementPayload {
  const basePayload: any = {
    eventName: event.eventName.trim(),
    eventType: event.eventType,
    dateType: event.dateType,
    startDate: event.startDate,
    location: event.location.trim(),
    category,
  };

  if (event.dateType === "range" && event.endDate && event.endDate.trim() !== "") {
    basePayload.endDate = event.endDate.trim();
  }

  if (event.venue && event.venue.trim() !== "") {
    basePayload.venue = event.venue.trim();
  }

  let cleanDetails: Record<string, any> = {};

  if (category === "planner") {
    cleanDetails = {
      services: Array.isArray(details.services) ? details.services : [],
      guestCount: Number(details.guestCount) || 1,
      budgetMin: Number(details.budgetMin) || 0,
      budgetMax: Number(details.budgetMax) || 0,
    };

    if (details.theme && typeof details.theme === "string" && details.theme.trim() !== "") {
      cleanDetails.theme = details.theme.trim();
    }
    if (details.planningDeadline && typeof details.planningDeadline === "string" && details.planningDeadline.trim() !== "") {
      cleanDetails.planningDeadline = details.planningDeadline.trim();
    }
    if (details.notes && typeof details.notes === "string" && details.notes.trim() !== "") {
      cleanDetails.notes = details.notes.trim();
    }
  } else if (category === "performer") {
    cleanDetails = {
      performerType: details.performerType || "DJ",
      genre: (details.genre || "").trim(),
      performanceDurationMins: Number(details.performanceDurationMins) || 60,
      numberOfPerformers: Number(details.numberOfPerformers) || 1,
      equipmentProvidedByHost: Boolean(details.equipmentProvidedByHost),
      budgetPerPerformance: Number(details.budgetPerPerformance) || 0,
      travelAccommodationCovered: details.travelAccommodationCovered !== undefined ? Boolean(details.travelAccommodationCovered) : true,
    };

    if (
      details.technicalRequirements &&
      typeof details.technicalRequirements === "string" &&
      details.technicalRequirements.trim() !== ""
    ) {
      cleanDetails.technicalRequirements = details.technicalRequirements.trim();
    }
  } else if (category === "crew") {
    const rawRoles = Array.isArray(details.roles) ? details.roles : [];
    const cleanRoles = rawRoles.map((r: any) => ({
      role: r.role || "Sound",
      count: Number(r.count) || 1,
    }));

    let cleanCerts: string[] = [];
    if (Array.isArray(details.requiredCertifications)) {
      cleanCerts = details.requiredCertifications.map((c) => String(c).trim()).filter(Boolean);
    } else if (typeof details.requiredCertifications === "string") {
      cleanCerts = details.requiredCertifications
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
    }

    cleanDetails = {
      roles: cleanRoles.length > 0 ? cleanRoles : [{ role: "Sound", count: 1 }],
      shiftHours: Number(details.shiftHours) || 8,
      experienceLevel: details.experienceLevel || "Intermediate",
      dailyRate: Number(details.dailyRate) || 0,
      callTime: details.callTime || "08:00",
      requiredCertifications: cleanCerts,
    };
  }

  return {
    ...basePayload,
    details: cleanDetails,
  };
}
