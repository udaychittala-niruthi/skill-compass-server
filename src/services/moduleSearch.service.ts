/**
 * Module Search Service
 * Searches and scores existing modules for reuse in learning path generation
 */

import { LearningModule, Op } from "../models";

interface ModuleSearchCriteria {
    userGroup: "COLLEGE_STUDENTS" | "PROFESSIONALS" | "TEENS" | "SENIORS";
    skills: number[]; // Skill IDs from user profile
    branchId?: number;
    courseId?: number;
    interestIds?: number[];
    difficulty?: "beginner" | "intermediate" | "advanced";
    minQuality?: number; // Minimum quality score (0-100)
    limit?: number;
}

interface ModuleQualityScore {
    module: any;
    score: number;
    breakdown: {
        hasResources: number;
        averageRating: number;
        completionCount: number;
        isRecent: number;
        hasPrerequisites: number;
        courseMatch?: number;
        branchMatch?: number;
    };
}

export class ModuleSearchService {
    /**
     * Find existing modules matching criteria
     */
    async findMatchingModules(criteria: ModuleSearchCriteria): Promise<any[]> {
        const { userGroup, skills, courseId, branchId, difficulty, minQuality = 60, limit = 20 } = criteria;

        try {
            // Build search query
            const whereClause: any = {
                targetUserGroups: {
                    [Op.contains]: [userGroup]
                },
                isAiGenerated: true,
                contentUrl: { [Op.not]: null },
                thumbnailUrl: { [Op.not]: null }
            };

            // Add difficulty filter if specified
            if (difficulty) {
                whereClause.difficulty = difficulty;
            }

            const modules = await LearningModule.findAll({
                where: whereClause,
                limit: limit * 4, // Fetch larger pool to rank
                order: [
                    ["completionCount", "DESC"],
                    ["averageRating", "DESC NULLS LAST"],
                    ["createdAt", "DESC"]
                ]
            });

            // Score each module
            const scoredModules = await Promise.all(
                modules.map(async (module) => this.scoreModuleQuality(module, courseId, branchId))
            );

            // Filter by minimum quality and sort
            const qualityModules = scoredModules
                .filter((sm) => sm.score >= minQuality)
                .sort((a, b) => b.score - a.score);

            // Secondary sort/rank by relevance (Skills & Interests)
            const rankedModules = this.rankModulesByRelevance(
                qualityModules.map((sm) => sm.module),
                { skills, interests: criteria.interestIds }
            );

            return rankedModules.slice(0, limit);
        } catch (error) {
            console.error("Error searching modules:", error);
            return [];
        }
    }

    /**
     * Score module quality (0-100)
     */
    async scoreModuleQuality(
        module: any,
        targetCourseId?: number,
        targetBranchId?: number
    ): Promise<ModuleQualityScore> {
        const breakdown = {
            hasResources: 0,
            averageRating: 0,
            completionCount: 0,
            isRecent: 0,
            hasPrerequisites: 0,
            courseMatch: 0,
            branchMatch: 0
        };

        // 1. Has Resources (30 points)
        if (module.contentUrl && module.thumbnailUrl) {
            breakdown.hasResources = 30;
        } else if (module.contentUrl || module.thumbnailUrl) {
            breakdown.hasResources = 15;
        }

        // 2. Average Rating (20 points)
        if (module.averageRating !== null) {
            const rating = parseFloat(module.averageRating);
            if (rating >= 4.5) breakdown.averageRating = 20;
            else if (rating >= 4.0) breakdown.averageRating = 15;
            else if (rating >= 3.5) breakdown.averageRating = 10;
            else if (rating >= 3.0) breakdown.averageRating = 5;
        } else {
            // No rating yet - neutral score
            breakdown.averageRating = 10;
        }

        // 3. Completion Count (15 points)
        const completions = module.completionCount || 0;
        if (completions >= 50) breakdown.completionCount = 15;
        else if (completions >= 20) breakdown.completionCount = 10;
        else if (completions >= 10) breakdown.completionCount = 5;

        // 4. Is Recent (15 points)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        if (module.createdAt >= sixMonthsAgo) {
            breakdown.isRecent = 15;
        } else {
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            if (module.createdAt >= oneYearAgo) {
                breakdown.isRecent = 7;
            }
        }

        // 5. Has Prerequisites (10 points)
        if (module.prerequisiteModules && module.prerequisiteModules.length > 0) {
            breakdown.hasPrerequisites = 10;
        }

        // 6. Course Match (10 points bonus)
        // If the module explicitly belongs to the same course
        if (targetCourseId && module.courseId === targetCourseId) {
            breakdown.courseMatch = 10;
        }

        // 7. Branch Match (10 points bonus)
        if (targetBranchId && module.groupSpecificMetadata?.branchId === targetBranchId) {
            breakdown.branchMatch = 10;
        }

        const totalScore = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

        return {
            module,
            score: totalScore,
            breakdown
        };
    }

    /**
     * Rank modules by relevance to user context
     */
    rankModulesByRelevance(modules: any[], userContext: { skills: number[]; interests?: number[] }): any[] {
        return modules
            .map((module) => {
                let relevanceScore = 0;

                // Convert to plain object if it's a Sequelize instance
                const plainModule = module.get ? module.get({ plain: true }) : module;

                // Check skill tag overlap
                // Assuming skillTags might contain names or IDs. If IDs are embedded stringly:
                if (plainModule.skillTags && userContext.skills) {
                    relevanceScore += 5;
                }

                // TODO: If we store interestTags on modules, check those too.

                return {
                    ...plainModule,
                    relevanceScore
                };
            })
            .sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    /**
     * Calculate reuse statistics
     */
    calculateReuseStats(totalNeeded: number, existingCount: number, newCount: number) {
        return {
            totalModules: totalNeeded,
            reusedModules: existingCount,
            newModules: newCount,
            reusePercentage: totalNeeded > 0 ? ((existingCount / totalNeeded) * 100).toFixed(1) : "0"
        };
    }

    /**
     * Get module type distribution for balanced paths
     */
    getModuleTypeDistribution(modules: any[]) {
        const distribution: Record<string, number> = {};
        modules.forEach((module) => {
            const type = module.moduleType || "course";
            distribution[type] = (distribution[type] || 0) + 1;
        });
        return distribution;
    }

    /**
     * Ensure balanced module types
     */
    balanceModuleTypes(existingModules: any[], targetDistribution: Record<string, number>): any[] {
        const balanced: any[] = [];
        const typeCounts: Record<string, number> = {};

        // Sort modules by quality first
        const sortedModules = [...existingModules].sort((a, b) => {
            const aRating = parseFloat(a.averageRating || "0");
            const bRating = parseFloat(b.averageRating || "0");
            return bRating - aRating;
        });

        // Select modules while respecting target distribution
        for (const module of sortedModules) {
            const type = module.moduleType || "course";
            const currentCount = typeCounts[type] || 0;
            const targetCount = targetDistribution[type] || 999;

            if (currentCount < targetCount) {
                balanced.push(module);
                typeCounts[type] = currentCount + 1;
            }
        }

        return balanced;
    }
}

export const moduleSearchService = new ModuleSearchService();
