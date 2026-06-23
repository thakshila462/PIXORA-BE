import { Router } from "express";
import multer from "multer";
import axios from "axios";
import fs from "fs";

const router = Router();
const upload = multer({ dest: "uploads/" });

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * 🎯 AI IMAGE ENHANCE (FIXED VERSION)
 */
router.post("/enhance", upload.single("image"), async (req, res) => {
  let filePath: string | null = null;

  try {
    // 1. Validate file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    filePath = req.file.path;

    // 2. Check API KEY
    if (!process.env.REPLICATE_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "REPLICATE_API_KEY missing in .env",
      });
    }

    // 3. Convert image to base64
    const base64Image = fs.readFileSync(filePath, {
      encoding: "base64",
    });

    /**
     * ⚠️ IMPORTANT:
     * This MUST be a REAL Replicate model version hash
     * Example used: CodeFormer face restoration
     */
    const MODEL_VERSION =
      "cjd3j5/real-esrgan"; // ❌ replace with your real working model if needed

    // 4. CREATE PREDICTION
    const prediction = await axios.post(
      "https://api.replicate.com/v1/predictions",
      {
        version: MODEL_VERSION,
        input: {
          image: `data:image/jpeg;base64,${base64Image}`, // ✅ SAFE FORMAT
        },
      },
      {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const predictionId = prediction.data.id;

    // 5. POLLING RESULT
    let output = null;
    let status = "starting";

    for (let i = 0; i < 40; i++) {
      const check = await axios.get(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: {
            Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
          },
        }
      );

      status = check.data.status;

      if (status === "succeeded") {
        output = check.data.output;
        break;
      }

      if (status === "failed") {
        throw new Error(check.data.error || "AI processing failed");
      }

      await sleep(1000);
    }

    if (!output) {
      throw new Error("AI timeout - no result returned");
    }

    // 6. CLEANUP FILE
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // 7. RESPONSE
    return res.json({
      success: true,
      result: {
        output,
      },
    });
  } catch (error: any) {
    console.error("AI ERROR FULL:", error?.response?.data || error.message);

    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return res.status(500).json({
      success: false,
      message: "AI enhancement failed",
      error: error?.response?.data || error.message,
    });
  }
});

export default router;