// src/routes/clip.route.ts

import type { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { sendResponse } from "../utils/customResponse.js";

// Multer configuration for file uploads
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

// Interface for typed request
export interface CompareImagesRequest extends Request {
  files?:
    | {
        image1?: Express.Multer.File[];
        image2?: Express.Multer.File[];
      }
    | Express.Multer.File[]
    | undefined;
  body: { tag?: string };
}

// Upload middleware
export const uploadImages = upload.fields([
  { name: "image1", maxCount: 1 },
  { name: "image2", maxCount: 1 },
]);

// Compare images endpoint
export const compareImages = async (
  req: CompareImagesRequest,
  res: Response,
) => {
  try {
    const files = req.files as { [key: string]: Express.Multer.File[] };
    const { tag } = req.body;

    if (!files?.image1?.[0] || !files?.image2?.[0]) {
      return sendResponse(
        res,
        false,
        "Both image1 and image2 are required",
        400,
      );
    }

    const image1Path = path.resolve(files.image1[0].path);
    const image2Path = path.resolve(files.image2[0].path);

    // Call FastAPI endpoint
    const fastApiUrl = process.env.FASTAPI_URL || "http://localhost:8000";
    const FormData = require("form-data");
    const formData = new FormData();

    // Read files and append to form data
    formData.append("image1", fs.createReadStream(image1Path));
    formData.append("image2", fs.createReadStream(image2Path));
    if (tag) {
      formData.append("tag", tag);
    }

    // Make request to FastAPI
    const response = await fetch(`${fastApiUrl}/api/v1/clip/compare`, {
      method: "POST",
      body: formData,
      headers: formData.getHeaders(),
    });

    // Clean up uploaded files
    try {
      fs.unlinkSync(image1Path);
      fs.unlinkSync(image2Path);
    } catch (cleanupError) {
      console.error("Error cleaning up files:", cleanupError);
    }

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as {
        detail?: string;
      };
      console.error("FastAPI error:", errorData);
      return sendResponse(
        res,
        false,
        "FastAPI error",
        response.status,
        null,
        errorData.detail || "Unknown error",
      );
    }

    // Parse JSON response from FastAPI
    const result = await response.json();

    return sendResponse(res, true, "Image comparison completed", 200, result);
  } catch (error) {
    console.error("compareImages error:", error);

    // Cleanup files on error
    try {
      const files = req.files as { [key: string]: Express.Multer.File[] };
      if (files?.image1?.[0]) fs.unlinkSync(files.image1[0].path);
      if (files?.image2?.[0]) fs.unlinkSync(files.image2[0].path);
    } catch (cleanupError) {
      console.error("Error cleaning up files after error:", cleanupError);
    }

    return sendResponse(
      res,
      false,
      error instanceof Error ? error.message : "Unknown error",
      500,
    );
  }
};

// Optional: API info endpoint
export const getApiInfo = (req: Request, res: Response) => {
  const info = {
    description:
      "Compare two images for similarity using CLIP (Contrastive Language-Image Pre-training)",
    supported_formats: ["JPEG", "PNG", "GIF", "BMP", "WebP"],
    max_file_size: "10MB per image",
    endpoints: {
      "POST /api/clip/compare": {
        description: "Compare two images with optional text tag",
        required_fields: ["image1", "image2"],
        optional_fields: ["tag"],
        response: {
          image_similarity: "float (0-1)",
          text_similarity: "float (0-1, if tag provided)",
          decision: "string with match result",
          details: "string with similarity info",
        },
      },
      "GET /api/clip/info": {
        description: "Get API information and usage details",
      },
    },
  };

  return sendResponse(res, true, "CLIP API information", 200, info);
};
