import { Router } from "express";
import {
  registerUser,
  login,
  getMyDetails,
  registerAdmin,
  getAdminDashboard,
} from "../controllers/authController";

import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { UserRole } from "../model/userModel";

const router = Router();

router.post("/register", registerUser);
router.post("/login", login);

router.get("/me", authenticate, getMyDetails);

router.get(
  "/admin/dashboard",
  authenticate,
  requireRole([UserRole.ADMIN]),
  getAdminDashboard,
);

router.post(
  "/admin/create",
  authenticate,
  requireRole([UserRole.ADMIN]),
  registerAdmin,
);

export default router;
