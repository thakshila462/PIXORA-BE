import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PackageModel } from "../model/PackageModel";

import { v2 as cloudinary } from "cloudinary";
import Replicate from "replicate";
import * as fs from "fs";

// ENV checks
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing");
}

if (!process.env.REPLICATE_API_KEY) {
  throw new Error("REPLICATE_API_KEY is missing");
}

// Gemini init
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Replicate init
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});

// ===============================
// IMAGE ENHANCE
// ===============================
export const enhanceImage = async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image uploaded." });
    }

    const prompt = req.body.prompt || "enhance quality, high resolution, detailed";

    // 💡 Vercel Serverless වලදී file path එකක් නැති නිසා, Buffer එක base64 කරලා Cloudinary එකට අප්ලෝඩ් කිරීම:
    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    
    const cloudinaryUpload = await cloudinary.uploader.upload(fileBase64, {
      folder: "pixora_ai_edits",
      resource_type: "auto"
    });
    
    const rawImageUrl = cloudinaryUpload.secure_url;

    // ✨ Replicate මොඩල් එක Run කිරීම
    const output: any = await replicate.run(
      "timothybrooks/instruct-pix2pix",
      {
        input: {
          image: rawImageUrl,
          prompt: prompt,
          num_outputs: 1,
          guidance_scale: 7.5,
          image_guidance_scale: 1.5,
          num_inference_steps: 25,
        },
      }
    );

    const finalImageUrl = Array.isArray(output) ? output[0] : output;

    return res.status(200).json({
      success: true,
      result: { output: [ finalImageUrl ] }
    });

  } catch (err: any) {
    console.error("AI Generation Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Enhancement failed internally",
    });
  }
};

// ===============================
// CHAT AI
// ===============================
export const chatWithAI = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        reply: "Message required",
      });
    }

    const packages = await PackageModel.find();

    const packageInfo = packages
      .map(
        (pkg) => `
Title: ${pkg.title}
Price: ${pkg.price}
`
      )
      .join("\n");

    const prompt = `
You are PIXORA AI.

Packages:
${packageInfo}

User: ${message}
`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const result = await model.generateContent(prompt);

    return res.status(200).json({
      success: true,
      reply: result.response.text(),
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      reply: "AI error",
    });
  }
};

// ===============================
// SHOOT PLANNER
// ===============================
export const generateShootPlan = async (req: Request, res: Response) => {
  try {
    const { eventType, budget, guests, locationType, specialNotes } = req.body;

    const packages = await PackageModel.find();

    const packageInfo = packages
      .map(
        (pkg) => `
Package: ${pkg.title}
Price: ${pkg.price}
`
      )
      .join("\n");

    const prompt = `
You are Pixora Planner.

Packages:
${packageInfo}

Event: ${eventType}
Budget: ${budget}
Guests: ${guests}
Location: ${locationType}
Notes: ${specialNotes}
`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent(prompt);

    return res.status(200).json({
      success: true,
      plan: result.response.text(),
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Planner failed",
    });
  }
};