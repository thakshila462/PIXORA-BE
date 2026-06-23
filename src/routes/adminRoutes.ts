import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { UserRole } from "../model/userModel";
import { getAdminDashboard } from "../controllers/adminController";

const router = Router();

// ADMIN DASHBOARD
router.get(
  "/dashboard",
  authenticate,
  requireRole([UserRole.ADMIN]),
  getAdminDashboard
);

export default router;