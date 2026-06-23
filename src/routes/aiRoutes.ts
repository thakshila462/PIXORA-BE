import { Router } from "express";
import {
  chatWithAI,
  generateShootPlan,
  enhanceImage,
} from "../controllers/aiController";

import { upload } from "../middleware/upload";

const router = Router();

router.post("/chat", chatWithAI);
router.post("/planner", generateShootPlan);
router.post("/enhance", upload.single("image"), enhanceImage);

export default router;