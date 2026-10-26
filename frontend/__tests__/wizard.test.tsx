/**
 * Frontend unit and integration tests – Phase 6
 *
 * Required coverage:
 *  1. Step 1 blocks Next on invalid input and Continue is disabled until a category is picked
 *  2. The right Step 2 fields render per category (Planner, Performer, Crew)
 *  3. Changing category shows the confirm modal and clears old details
 *  4. payload.ts (single date omits endDate, empty optionals stripped, category-specific details only)
 *  5. Review submit success + failure (400 and network error) with a mocked fetch
 */

import React from "react";
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { buildRequirementPayload } from "../lib/payload";
import { useWizardStore } from "../store/wizardStore";

// ─── Minimal mocks for Next.js navigation and links ───────────────────────────
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/",
}));

// Stub sessionStorage for Zustand persist in jsdom
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
    removeItem: (k: string) => {
      delete store[k];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, "sessionStorage", { value: sessionStorageMock });

const initialStoreState = {
  currentStep: 1,
  event: {
    eventName: "",
    eventType: "Corporate",
    dateType: "single" as const,
    startDate: "",
    endDate: "",
    location: "",
    venue: "",
  },
  category: "" as any,
  details: {},
};

beforeEach(() => {
  sessionStorage.clear();
  useWizardStore.setState(initialStoreState);
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── 1. payload.ts Sanitization Tests ─────────────────────────────────────────

describe("payload.ts builder", () => {
  const baseEvent = {
    eventName: "Annual Gala 2027",
    eventType: "Corporate",
    dateType: "single" as const,
    startDate: "2027-03-15",
    endDate: "2027-03-20",
    location: "Mumbai",
    venue: "",
  };

  it("planner: strips endDate when dateType=single, omits empty optional strings", () => {
    const details = {
      services: ["decor", "catering"],
      guestCount: 150,
      budgetMin: 500000,
      budgetMax: 1000000,
      theme: "", // empty → should be omitted
      notes: "", // empty → should be omitted
      planningDeadline: "",
    };

    const payload = buildRequirementPayload(baseEvent, "planner", details);

    // endDate must NOT be present for single events
    expect(payload).not.toHaveProperty("endDate");
    // empty venue must not be present
    expect(payload).not.toHaveProperty("venue");
    // empty theme / notes must not be in details
    expect(payload.details).not.toHaveProperty("theme");
    expect(payload.details).not.toHaveProperty("notes");
    // required fields must be correct
    expect(payload.eventName).toBe("Annual Gala 2027");
    expect(payload.category).toBe("planner");
    expect(payload.details.services).toEqual(["decor", "catering"]);
    expect(payload.details.guestCount).toBe(150);
  });

  it("planner: includes endDate when dateType=range and endDate is provided", () => {
    const rangeEvent = { ...baseEvent, dateType: "range" as const };
    const details = {
      services: ["AV"],
      guestCount: 50,
      budgetMin: 100000,
      budgetMax: 200000,
    };

    const payload = buildRequirementPayload(rangeEvent, "planner", details);
    expect(payload.endDate).toBe("2027-03-20");
  });

  it("crew: maps comma-separated certifications string to array and preserves roles", () => {
    const crewEvent = {
      ...baseEvent,
      venue: "Main Stadium",
    };
    const details = {
      roles: [
        { role: "Sound", count: 3 },
        { role: "Lighting", count: 2 },
      ],
      shiftHours: 10,
      experienceLevel: "Expert",
      dailyRate: 2500,
      callTime: "07:00",
      requiredCertifications: "ISO 9001, First Aid, Fire Safety",
    };

    const payload = buildRequirementPayload(crewEvent, "crew", details);

    expect(payload.details.roles).toHaveLength(2);
    expect(payload.details.roles[0]).toEqual({ role: "Sound", count: 3 });
    expect(payload.details.requiredCertifications).toEqual([
      "ISO 9001",
      "First Aid",
      "Fire Safety",
    ]);
    expect(payload.venue).toBe("Main Stadium");
    expect(payload).not.toHaveProperty("endDate");
  });

  it("performer: maps performer details correctly and strips empty technicalRequirements", () => {
    const details = {
      performerType: "Singer",
      genre: "Bollywood",
      performanceDurationMins: 90,
      numberOfPerformers: 2,
      equipmentProvidedByHost: true,
      budgetPerPerformance: 75000,
      travelAccommodationCovered: false,
      technicalRequirements: "",
    };

    const payload = buildRequirementPayload(baseEvent, "performer", details);

    expect(payload.details.performerType).toBe("Singer");
    expect(payload.details.genre).toBe("Bollywood");
    expect(payload.details.equipmentProvidedByHost).toBe(true);
    expect(payload.details.travelAccommodationCovered).toBe(false);
    expect(payload.details).not.toHaveProperty("technicalRequirements");
  });
});

// ─── 2. Step 1 (EventBasics) Validation & Category Gating ───────────────────────

describe("Step 1 (EventBasics) form gating and validation", () => {
  it("Continue button is disabled until a category is chosen", async () => {
    const { EventBasics } = await import("../components/steps/EventBasics");
    render(<EventBasics />);

    const continueBtn = screen.getByRole("button", { name: /continue/i });
    expect(continueBtn).toBeDisabled();
  });

  it("blocks next on invalid input (eventName < 3 chars) and shows validation error", async () => {
    const { EventBasics } = await import("../components/steps/EventBasics");
    render(<EventBasics />);

    const eventNameInput = screen.getByLabelText(/event name/i);
    fireEvent.change(eventNameInput, { target: { value: "AB" } });
    fireEvent.blur(eventNameInput);

    await waitFor(() => {
      expect(screen.getByText(/at least 3 characters/i)).toBeInTheDocument();
    });

    const continueBtn = screen.getByRole("button", { name: /continue/i });
    expect(continueBtn).toBeDisabled();
  });
});

// ─── 3. Step 2 Category-Specific Fields Rendering ───────────────────────────────

describe("Step 2 category-specific fields rendering", () => {
  it("renders PlannerStep2 fields (Services checkboxes, guestCount)", async () => {
    const { PlannerStep2 } = await import("../components/steps/planner/PlannerStep2");
    render(<PlannerStep2 />);

    expect(screen.getByText(/decor/i)).toBeInTheDocument();
    expect(screen.getByText(/catering/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/guest count/i)).toBeInTheDocument();
  });

  it("renders PerformerStep2 fields (performerType select, genre)", async () => {
    const { PerformerStep2 } = await import("../components/steps/performer/PerformerStep2");
    render(<PerformerStep2 />);

    expect(screen.getByLabelText(/performer type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/genre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/duration/i)).toBeInTheDocument();
  });

  it("renders CrewStep2 fields (roles list, Add Position button)", async () => {
    const { CrewStep2 } = await import("../components/steps/crew/CrewStep2");
    render(<CrewStep2 />);

    expect(screen.getByRole("button", { name: /add position/i })).toBeInTheDocument();
    expect(screen.getAllByLabelText(/role category/i).length).toBeGreaterThanOrEqual(1);
  });
});

// ─── 4. Category Change Confirmation & Details Reset ────────────────────────────

describe("Category change confirmation modal and state teardown", () => {
  it("shows confirm modal when switching category with existing details and clears old details upon confirmation", async () => {
    // Seed store with an active category and existing details
    useWizardStore.setState({
      event: {
        eventName: "Annual Gala",
        eventType: "Corporate",
        dateType: "single",
        startDate: "2027-05-10",
        endDate: "",
        location: "Mumbai",
        venue: "",
      },
      category: "planner",
      details: {
        services: ["decor"],
        guestCount: 200,
      },
    });

    const { EventBasics } = await import("../components/steps/EventBasics");
    render(<EventBasics />);

    // Click Performer category card (using userEvent or fireEvent)
    const performerRadio = screen.getByRole("radio", { name: /performer/i });
    fireEvent.click(performerRadio);

    // Confirmation modal should appear with warning
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Confirm category change
    const confirmBtn = screen.getByRole("button", { name: /yes, change category/i });
    fireEvent.click(confirmBtn);

    // Old details must be completely cleared and category updated in store
    await waitFor(() => {
      const state = useWizardStore.getState();
      expect(state.category).toBe("performer");
      expect(state.details).toEqual({});
    });
  });
});

// ─── 5. Review Step Submit Paths (Mocked Fetch) ─────────────────────────────────

describe("ReviewStep submission handling", () => {
  const readyEvent = {
    eventName: "National Tech Summit 2027",
    eventType: "Corporate",
    dateType: "single" as const,
    startDate: "2027-08-20",
    endDate: "",
    location: "Bangalore",
    venue: "KTPO Convention Centre",
  };

  const readyPlannerDetails = {
    services: ["AV", "logistics"],
    guestCount: 500,
    budgetMin: 300000,
    budgetMax: 600000,
  };

  it("submits successfully and invokes onSuccess with created requirement document", async () => {
    useWizardStore.setState({
      event: readyEvent,
      category: "planner",
      details: readyPlannerDetails,
    });

    const mockResponseDoc = {
      _id: "67890abcdef1234567890abc",
      ...readyEvent,
      category: "planner",
      details: readyPlannerDetails,
      createdAt: "2026-10-26T14:00:00.000Z",
      updatedAt: "2026-10-26T14:00:00.000Z",
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        success: true,
        data: mockResponseDoc,
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const onSuccess = vi.fn();
    const { ReviewStep } = await import("../components/wizard/ReviewStep");
    render(<ReviewStep onSuccess={onSuccess} />);

    const submitBtn = screen.getByRole("button", { name: /submit requirement/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(onSuccess).toHaveBeenCalledWith(mockResponseDoc);
    });
  });

  it("displays server validation error message and field path details on HTTP 400 failure", async () => {
    useWizardStore.setState({
      event: readyEvent,
      category: "planner",
      details: readyPlannerDetails,
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        success: false,
        message: "Validation failed across fields",
        errors: [
          {
            path: "details.budgetMax",
            message: "Max budget must be greater than or equal to min budget",
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const onSuccess = vi.fn();
    const { ReviewStep } = await import("../components/wizard/ReviewStep");
    render(<ReviewStep onSuccess={onSuccess} />);

    const submitBtn = screen.getByRole("button", { name: /submit requirement/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/validation failed across fields/i)).toBeInTheDocument();
      expect(
        screen.getByText(/max budget must be greater than or equal to min budget/i)
      ).toBeInTheDocument();
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("displays network failure error message and friendly retry action when connection fails", async () => {
    useWizardStore.setState({
      event: readyEvent,
      category: "planner",
      details: readyPlannerDetails,
    });

    const fetchMock = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    vi.stubGlobal("fetch", fetchMock);

    const onSuccess = vi.fn();
    const { ReviewStep } = await import("../components/wizard/ReviewStep");
    render(<ReviewStep onSuccess={onSuccess} />);

    const submitBtn = screen.getByRole("button", { name: /submit requirement/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/unable to reach the server/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });
});
