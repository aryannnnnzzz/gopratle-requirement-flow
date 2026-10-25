import { PlannerStep2 } from "../components/steps/planner/PlannerStep2";
import { PlannerStep3 } from "../components/steps/planner/PlannerStep3";
import { PerformerStep2 } from "../components/steps/performer/PerformerStep2";
import { PerformerStep3 } from "../components/steps/performer/PerformerStep3";
import { CrewStep2 } from "../components/steps/crew/CrewStep2";
import { CrewStep3 } from "../components/steps/crew/CrewStep3";
import { CategoryKey } from "./schemas";
import React from "react";

export const stepConfig: Record<CategoryKey, [React.FC, React.FC]> = {
  planner: [PlannerStep2, PlannerStep3],
  performer: [PerformerStep2, PerformerStep3],
  crew: [CrewStep2, CrewStep3],
};
