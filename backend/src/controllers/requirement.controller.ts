import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import {
  Requirement,
  PlannerRequirement,
  PerformerRequirement,
  CrewRequirement,
  CategoryType,
} from "../models/Requirement";

const getModelForCategory = (category: CategoryType) => {
  switch (category) {
    case "planner":
      return PlannerRequirement;
    case "performer":
      return PerformerRequirement;
    case "crew":
      return CrewRequirement;
    default:
      return Requirement;
  }
};

/**
 * POST /api/requirements
 * Create a new requirement under planner, performer, or crew discriminator
 */
export const createRequirement = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category } = req.body;
    const Model = getModelForCategory(category);

    const doc = new Model(req.body);
    const savedDoc = await doc.save();

    res.status(201).json({
      success: true,
      data: savedDoc,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/requirements?category=planner|performer|crew&page=1&limit=10
 * Get paginated list of requirements, optionally filtered by category
 */
export const getRequirements = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category, page = "1", limit = "10" } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, unknown> = {};
    if (category && ["planner", "performer", "crew"].includes(category as string)) {
      filter.category = category;
    }

    const [items, total] = await Promise.all([
      Requirement.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Requirement.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: items,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/requirements/:id
 * Retrieve a single requirement by ID
 */
export const getRequirementById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid requirement ID",
        errors: [{ path: "id", message: "Invalid ObjectId format" }],
      });
      return;
    }

    const item = await Requirement.findById(id).lean();

    if (!item) {
      res.status(404).json({
        success: false,
        message: "Requirement not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};
