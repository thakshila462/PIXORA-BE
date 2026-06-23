import { Router } from "express";
import {
  createUser,
  getAllUser,
  updateUser,
  deleteUser,
} from "../controllers/userController";

import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { UserRole } from "../model/userModel";

const router = Router();

// PUBLIC
router.get("/", getAllUser);

// ADMIN ONLY
router.post("/", authenticate, requireRole([UserRole.ADMIN]), createUser);
router.put("/:id", authenticate, requireRole([UserRole.ADMIN]), updateUser);
router.delete("/:id", authenticate, requireRole([UserRole.ADMIN]), deleteUser);

export default router;