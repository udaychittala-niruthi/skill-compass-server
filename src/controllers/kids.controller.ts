import type { Request, Response } from "express";
import { KidDrawingImage } from "../models/index.js";
import { sendResponse } from "../utils/customResponse.js";
import { getChatCompletion, getVisionCompletion } from "../services/groq.js";
import sequelize from "../config/db.js";

export const kidsController = {
    async getRandomDrawing(req: Request, res: Response) {
        try {
            const drawing = await KidDrawingImage.findOne({
                order: [sequelize.random()],
                where: { isValid: true }
            });

            if (!drawing) {
                return sendResponse(res, false, "No drawings available", 404);
            }

            return sendResponse(res, true, "Random drawing fetched successfully", 200, drawing);
        } catch (error: any) {
            console.error("Error fetching random drawing:", error);
            return sendResponse(res, false, "Internal server error", 500);
        }
    },

    async analyzeDrawing(req: Request, res: Response) {
        try {
            const { imageId, imageUrl } = req.body;

            if (!imageId && !imageUrl) {
                return sendResponse(res, false, "Image ID or URL is required", 400);
            }

            let url = imageUrl;
            if (imageId) {
                const drawing = await KidDrawingImage.findByPk(imageId);
                if (drawing) {
                    url = drawing.url;
                }
            }

            if (!url) {
                return sendResponse(res, false, "Valid image URL not found", 404);
            }

            const prompt = `Analyze this drawing made by a kid. Describe what you see, give positive feedback, and suggest one creative addition. Keep it encouraging and simple for a child. Output in JSON format with keys: description, feedback, suggestion.`;

            try {
                // Using the new vision capability
                const analysisText = await getVisionCompletion(prompt, url, {
                    temperature: 0.7,
                    systemPrompt: "You are a friendly art teacher for kids. Output strictly in JSON format."
                });

                let analysis;
                try {
                    analysis = JSON.parse(analysisText);
                } catch (e) {
                    // Fallback if not valid JSON
                    analysis = {
                        description: analysisText,
                        feedback: "Great playing with colors!",
                        suggestion: "Keep drawing!"
                    };
                }

                return sendResponse(res, true, "Drawing analyzed successfully", 200, analysis);
            } catch (error: any) {
                console.error("Groq vision analysis failed:", error.message);
                return sendResponse(res, false, "Failed to analyze drawing due to AI service error", 500);
            }
        } catch (error: any) {
            console.error("Error analyzing drawing:", error);
            return sendResponse(res, false, "Internal server error", 500);
        }
    }
};
