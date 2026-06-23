import { Router } from "express";
import {
  createPackage,
  getAllPackages,
  updatePackage,
  deletePackage,
} from "../controllers/packageController";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { UserRole } from "../model/userModel";

const router = Router();

// public (frontend)
router.get("/", getAllPackages);

// admin only add/update packages
router.post("/", authenticate, requireRole([UserRole.ADMIN]), createPackage);
router.put("/:id", authenticate, requireRole([UserRole.ADMIN]), updatePackage);
router.delete("/:id", authenticate, requireRole([UserRole.ADMIN]), deletePackage);

export default router;
