import { Router } from "express";
import {
  createRequirement,
  getRequirements,
  getRequirementById,
} from "../controllers/requirement.controller";
import { validate } from "../middleware/validate";
import { requirementInputSchema } from "../schemas/requirement.schema";

const router = Router();

router.post("/", validate(requirementInputSchema), createRequirement);
router.get("/", getRequirements);
router.get("/:id", getRequirementById);

export default router;
