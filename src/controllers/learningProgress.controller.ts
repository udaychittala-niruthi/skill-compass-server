import { Request, Response } from "express";
import { UserModuleProgress, Op } from "../models/index.js";
import { sendResponse } from "../utils/customResponse.js";

export const learningProgressController = {
    /**
     * Get all progress for authenticated user (requires authentication)
     */
    async getMyProgress(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;

            const progress = await UserModuleProgress.findAll({
                where: { userId },
                order: [["updatedAt", "DESC"]]
            });

            return sendResponse(res, true, "Progress retrieved successfully", 200, progress);
        } catch (error: any) {
            console.error("Get Progress Error:", error);
            return sendResponse(res, false, error.message || "Internal Server Error", 500);
        }
    },

    /**
     * Get progress for a specific module (requires authentication)
     */
    async getModuleProgress(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const moduleId = parseInt(String(req.params.moduleId));

            if (isNaN(moduleId)) {
                return sendResponse(res, false, "Invalid module ID", 400);
            }

            const progress = await UserModuleProgress.findOne({
                where: { userId, moduleId }
            });

            if (!progress) {
                return sendResponse(res, false, "Progress not found for this module", 404);
            }

            return sendResponse(res, true, "Module progress retrieved successfully", 200, progress);
        } catch (error: any) {
            console.error("Get Module Progress Error:", error);
            return sendResponse(res, false, error.message || "Internal Server Error", 500);
        }
    },

    /**
     * Update progress for a module (requires authentication)
     */
    async updateModuleProgress(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const moduleId = parseInt(String(req.params.moduleId));

            if (isNaN(moduleId)) {
                return sendResponse(res, false, "Invalid module ID", 400);
            }

            const { status, progressPercentage, timeSpent, score, maxScore, passed, rating, feedback, progressData } =
                req.body;

            // Validate status if provided
            const validStatuses = ["not-started", "in-progress", "completed", "failed"];
            if (status && !validStatuses.includes(status)) {
                return sendResponse(res, false, `Invalid status. Must be one of: ${validStatuses.join(", ")}`, 400);
            }

            // Validate progressPercentage if provided
            if (progressPercentage !== undefined) {
                if (typeof progressPercentage !== "number" || progressPercentage < 0 || progressPercentage > 100) {
                    return sendResponse(res, false, "Progress percentage must be a number between 0 and 100", 400);
                }
            }

            // Validate rating if provided
            if (rating !== undefined) {
                if (typeof rating !== "number" || rating < 1 || rating > 5) {
                    return sendResponse(res, false, "Rating must be a number between 1 and 5", 400);
                }
            }

            let progress = await UserModuleProgress.findOne({
                where: { userId, moduleId }
            });

            if (!progress) {
                // Create new progress record
                progress = await UserModuleProgress.create({
                    userId,
                    moduleId,
                    status: status || "in-progress",
                    progressPercentage: progressPercentage || 0,
                    timeSpent,
                    score,
                    maxScore,
                    passed,
                    rating,
                    feedback,
                    progressData: progressData || {},
                    completedAt: status === "completed" ? new Date() : null
                });
            } else {
                // Update existing progress
                await progress.update({
                    status,
                    progressPercentage,
                    timeSpent,
                    score,
                    maxScore,
                    passed,
                    rating,
                    feedback,
                    progressData,
                    completedAt: status === "completed" ? new Date() : progress.completedAt
                });
            }

            // Update module quality metrics for reuse algorithm
            try {
                const { LearningModule } = await import("../models/index.js");
                if (status === "completed") {
                    await LearningModule.increment("completionCount", { where: { id: moduleId } });
                }
                if (rating !== undefined) {
                    const allRatings = await UserModuleProgress.findAll({
                        where: { moduleId, rating: { [Op.not]: null } },
                        attributes: ["rating"]
                    });
                    if (allRatings.length > 0) {
                        const avg = allRatings.reduce((sum, p) => sum + (p.rating || 0), 0) / allRatings.length;
                        await LearningModule.update(
                            { averageRating: parseFloat(avg.toFixed(2)) },
                            { where: { id: moduleId } }
                        );
                    }
                }
            } catch (e) {
                console.error("[Quality Update] Error:", e);
            }

            return sendResponse(res, true, "Module progress updated successfully", 200, progress);
        } catch (error: any) {
            console.error("Update Module Progress Error:", error);
            return sendResponse(res, false, error.message || "Internal Server Error", 500);
        }
    }
};
