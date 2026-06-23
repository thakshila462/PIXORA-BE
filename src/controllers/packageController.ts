import { Request, Response } from "express";
import { PackageModel } from "../model/PackageModel";

// 🔥 SAFE NUMBER HELPER
const parseNumber = (val: any, fallback?: number) => {
  if (val === undefined || val === null || val === "") {
    return fallback;
  }

  const num = Number(val);
  return Number.isFinite(num) ? num : fallback;
};

// CREATE
export const createPackage = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    const price = parseNumber(body.price);
    const duration = parseNumber(body.duration);
    const photosCount = parseNumber(body.photosCount);

    if (price !== undefined && price < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be 0 or higher",
      });
    }

    if (duration !== undefined && duration < 1) {
      return res.status(400).json({
        success: false,
        message: "Duration must be at least 1",
      });
    }

    if (photosCount !== undefined && photosCount < 0) {
      return res.status(400).json({
        success: false,
        message: "Photos count must be 0 or higher",
      });
    }

    const pkg = await PackageModel.create({
      category: body.category,
      title: body.title?.trim(),

      price,
      duration,
      photosCount,

      features: Array.isArray(body.features)
        ? body.features.map((f: string) => f.trim()).filter(Boolean)
        : [],

      isPopular: Boolean(body.isPopular),
    });

    return res.status(201).json({
      success: true,
      message: "Package created",
      data: pkg,
    });
  } catch (err: any) {
    console.error("CREATE PACKAGE ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Error creating package",
      error: err.message,
    });
  }
};

// GET ALL
export const getAllPackages = async (req: Request, res: Response) => {
  try {
    const packages = await PackageModel.find().lean();

    return res.status(200).json({
      success: true,
      data: packages,
    });
  } catch (err: any) {
    console.error("GET PACKAGES ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Error fetching packages",
      error: err.message,
    });
  }
};

// UPDATE
export const updatePackage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const updateData: any = {};

    if (req.body.category !== undefined)
      updateData.category = req.body.category;
    if (req.body.title !== undefined) updateData.title = req.body.title?.trim();

    const price = parseNumber(req.body.price);
    if (price !== undefined) updateData.price = price;

    const duration = parseNumber(req.body.duration);
    if (duration !== undefined) updateData.duration = duration;

    const photosCount = parseNumber(req.body.photosCount);
    if (photosCount !== undefined) updateData.photosCount = photosCount;

    if (price !== undefined && price < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be 0 or higher",
      });
    }

    if (duration !== undefined && duration < 1) {
      return res.status(400).json({
        success: false,
        message: "Duration must be at least 1",
      });
    }

    if (photosCount !== undefined && photosCount < 0) {
      return res.status(400).json({
        success: false,
        message: "Photos count must be 0 or higher",
      });
    }

    if (Array.isArray(req.body.features)) {
      updateData.features = req.body.features
        .map((f: string) => f.trim())
        .filter(Boolean);
    }

    if (req.body.isPopular !== undefined) {
      updateData.isPopular = Boolean(req.body.isPopular);
    }

    const updated = await PackageModel.findByIdAndUpdate(id, updateData, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Updated successfully",
      data: updated,
    });
  } catch (err: any) {
    console.error("UPDATE ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Error updating package",
      error: err.message,
    });
  }
};

// DELETE
export const deletePackage = async (req: Request, res: Response) => {
  try {
    const deleted = await PackageModel.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Deleted successfully",
      data: deleted,
    });
  } catch (err: any) {
    console.error("DELETE ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Error deleting package",
      error: err.message,
    });
  }
};
