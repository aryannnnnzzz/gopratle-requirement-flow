import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useEffect, useState } from "react";
import { CategoryKey, EventBasicsFormValues } from "../lib/schemas";

export interface EventData {
  eventName: string;
  eventType: string;
  dateType: "single" | "range";
  startDate: string;
  endDate: string;
  location: string;
  venue: string;
}

export type AnyDetails = Record<string, any>;

export interface WizardState {
  currentStep: number;
  event: EventData;
  category: CategoryKey | "";
  details: AnyDetails;
  
  // Actions
  setEventBasics: (data: EventBasicsFormValues) => void;
  setCategory: (category: CategoryKey, forceClearDetails?: boolean) => void;
  updateDetails: (partialDetails: AnyDetails) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  resetWizard: () => void;
}

const initialEventState: EventData = {
  eventName: "",
  eventType: "Corporate",
  dateType: "single",
  startDate: "",
  endDate: "",
  location: "",
  venue: "",
};

export const useWizardStore = create<WizardState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      event: initialEventState,
      category: "",
      details: {},

      setEventBasics: (data) => {
        const { category, ...eventData } = data;
        set(() => ({
          event: {
            eventName: eventData.eventName || "",
            eventType: eventData.eventType || "Corporate",
            dateType: eventData.dateType || "single",
            startDate: eventData.startDate || "",
            endDate: eventData.endDate || "",
            location: eventData.location || "",
            venue: eventData.venue || "",
          },
          category: (category as CategoryKey) || "",
        }));
      },

      setCategory: (newCategory, forceClearDetails = false) => {
        const currentCategory = get().category;
        if (currentCategory && currentCategory !== newCategory && forceClearDetails) {
          set({ category: newCategory, details: {} });
        } else {
          set({ category: newCategory });
        }
      },

      updateDetails: (partialDetails) => {
        set((state) => ({
          details: { ...state.details, ...partialDetails },
        }));
      },

      nextStep: () => {
        set((state) => ({
          currentStep: Math.min(4, state.currentStep + 1),
        }));
      },

      prevStep: () => {
        set((state) => ({
          currentStep: Math.max(1, state.currentStep - 1),
        }));
      },

      goToStep: (step) => {
        set({ currentStep: Math.max(1, Math.min(4, step)) });
      },

      resetWizard: () => {
        set({
          currentStep: 1,
          event: initialEventState,
          category: "",
          details: {},
        });
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("gopratle_wizard_storage");
        }
      },
    }),
    {
      name: "gopratle_wizard_storage",
      skipHydration: true,
      storage: createJSONStorage(() => (typeof window !== "undefined" ? sessionStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
    }
  )
);

/**
 * Hook to ensure client hydration finishes before rendering persisted values
 */
export const useWizardHydrated = (): boolean => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Manually trigger hydration from sessionStorage on client
    useWizardStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  return hydrated;
};
