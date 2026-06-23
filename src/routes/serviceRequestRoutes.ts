import { Router } from "express";
import {
  createServiceRequest,
  getAllServiceRequests,
  updateServiceRequestStatus,
    paymentSync // ⚡ Import කරගන්න
} from "../controllers/serviceRequestController";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { UserRole } from "../model/userModel";
import { togglePaymentStatus } from "../controllers/serviceRequestController";


const router = Router();

router.post("/", createServiceRequest);

// ⚡ සේරම Requests ටික ඇඩ්මින්ට විතරක් ගන්න ආරක්ෂිතව තැබීම
router.get(
  "/",
  authenticate,
  requireRole([UserRole.ADMIN]),
  getAllServiceRequests
);

// ⚡ Request එකක Status එක (Confirmed / Cancelled) මාරු කරන PATCH endpoint එක
router.patch(
  "/:id/status",
  authenticate,
  requireRole([UserRole.ADMIN]),
  updateServiceRequestStatus
);

router.patch(
  "/:id/payment",
  authenticate,
  requireRole([UserRole.ADMIN]),
  togglePaymentStatus
);
router.put(
  "/payment-sync",
  paymentSync
);

export default router;