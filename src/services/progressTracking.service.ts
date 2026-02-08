import {
    UserProgress,
    LearningPath,
    LearningModule,
    Lesson,
    Task,
    TaskSubmission,
    UserModuleProgress,
    LearningAnalytics
} from "../models/index.js";
import sequelize from "../config/db.js";
import { Transaction } from "sequelize";
import { gamificationService } from "./gamification.service.js";

class ProgressTrackingService {
    /**
     * Track progress for a specific entity (path, module, lesson, task)
     */
    async updateProgress(params: {
        userId: number;
        pathId: number;
        moduleId?: number;
        lessonId?: number;
        taskId?: number;
        status: "started" | "in_progress" | "completed";
        score?: number;
        metadata?: any;
    }): Promise<void> {
        const { userId, pathId, moduleId, lessonId, taskId, status, metadata } = params;

        await sequelize.transaction(async (t) => {
            // 1. Upsert detailed progress record
            const [progress] = await UserProgress.findOrCreate({
                where: {
                    userId,
                    pathId,
                    moduleId: moduleId || null,
                    lessonId: lessonId || null,
                    taskId: taskId || null
                },
                defaults: {
                    status,
                    completionPercentage: status === "completed" ? 100 : 0,
                    lastAccessedAt: new Date(),
                    completedAt: status === "completed" ? new Date() : null,
                    metadata: metadata || {}
                },
                transaction: t
            });

            if (progress) {
                await progress.update(
                    {
                        status,
                        completionPercentage: status === "completed" ? 100 : progress.completionPercentage,
                        lastAccessedAt: new Date(),
                        completedAt: status === "completed" ? new Date() : progress.completedAt,
                        metadata: { ...(progress.metadata || {}), ...(metadata || {}) }
                    },
                    { transaction: t }
                );
            }

            // 2. Cascade completion logic
            if (status === "completed") {
                if (taskId) {
                    await this.handleTaskCompletion(userId, pathId, moduleId!, lessonId!, taskId, t);
                } else if (lessonId) {
                    await this.handleLessonCompletion(userId, pathId, moduleId!, lessonId, t);
                } else if (moduleId) {
                    await this.handleModuleCompletion(userId, pathId, moduleId, t);
                }
            }

            // 3. Update active pointers in LearningPath
            if (status === "started" || status === "in_progress") {
                await LearningPath.update(
                    {
                        currentModuleId: moduleId || null,
                        currentTaskId: taskId || null
                    },
                    {
                        where: { id: pathId, userId },
                        transaction: t
                    }
                );
            }
        });
    }

    private async handleTaskCompletion(
        userId: number,
        pathId: number,
        moduleId: number,
        lessonId: number,
        taskId: number,
        transaction: Transaction
    ): Promise<void> {
        // Check if all tasks in lesson are completed
        const allTasks = await Task.findAll({ where: { lessonId }, transaction });
        const taskIds = allTasks.map((t) => t.id);

        const completedTasksCount = await UserProgress.count({
            where: {
                userId,
                lessonId,
                taskId: taskIds,
                status: "completed"
            },
            transaction
        });

        if (completedTasksCount === allTasks.length) {
            await this.updateProgress({
                userId,
                pathId,
                moduleId,
                lessonId,
                status: "completed"
            });
        }

        // Award points for task completion
        await gamificationService.awardPoints(userId, 10, "Task Completion");

        // Update daily analytics
        await this.updateDailyAnalytics(userId, { tasksCompleted: 1 });

        // Trigger achievement check
        gamificationService.checkAchievements(userId).catch(console.error);
    }

    private async handleLessonCompletion(
        userId: number,
        pathId: number,
        moduleId: number,
        lessonId: number,
        transaction: Transaction
    ): Promise<void> {
        // Check if all lessons in module are completed
        const allLessons = await Lesson.findAll({ where: { moduleId }, transaction });
        const lessonIds = allLessons.map((l) => l.id);

        const completedLessonsCount = await UserProgress.count({
            where: {
                userId,
                moduleId,
                lessonId: lessonIds,
                taskId: null,
                status: "completed"
            },
            transaction
        });

        if (completedLessonsCount === allLessons.length) {
            await this.updateProgress({
                userId,
                pathId,
                moduleId,
                status: "completed"
            });

            // Award points for lesson/topic mastery
            await gamificationService.awardPoints(userId, 50, "Lesson Mastery");
        }
    }

    private async handleModuleCompletion(
        userId: number,
        pathId: number,
        moduleId: number,
        transaction: Transaction
    ): Promise<void> {
        // Sync with legacy UserModuleProgress for compatibility
        await UserModuleProgress.findOrCreate({
            where: { userId, moduleId },
            defaults: { status: "completed", completedAt: new Date() },
            transaction
        });

        // Calculate path completion percentage
        const allModules = await LearningModule.findAll({ where: { learningPathId: pathId }, transaction });
        const moduleIds = allModules.map((m) => m.id);

        const completedModulesCount = await UserProgress.count({
            where: {
                userId,
                pathId,
                moduleId: moduleIds,
                lessonId: null,
                taskId: null,
                status: "completed"
            },
            transaction
        });

        const percentage = Math.round((completedModulesCount / allModules.length) * 100);

        await LearningPath.update(
            {
                completionPercentage: percentage,
                status: percentage === 100 ? "completed" : "generating"
            },
            {
                where: { id: pathId },
                transaction
            }
        );

        // Award points for module completion
        await gamificationService.awardPoints(userId, 200, "Module Completion");
    }

    private async updateDailyAnalytics(
        userId: number,
        data: { tasksCompleted?: number; timeSpent?: number }
    ): Promise<void> {
        const { startOfDay } = require("date-fns");
        const today = startOfDay(new Date());

        const [analytic] = await LearningAnalytics.findOrCreate({
            where: { userId, date: today },
            defaults: {
                pointsEarned: 0,
                tasksCompleted: 0,
                timeSpentMinutes: 0,
                activeStreakDays: 1
            }
        });

        await analytic.update({
            tasksCompleted: (analytic.tasksCompleted || 0) + (data.tasksCompleted || 0),
            timeSpentMinutes: (analytic.timeSpentMinutes || 0) + (data.timeSpent || 0)
        });
    }

    /**
     * Submit a task for review/completion
     */
    async submitTask(params: { userId: number; taskId: number; submissionData: any }): Promise<any> {
        const { userId, taskId, submissionData } = params;

        // Fetch task to get info
        const task = await Task.findByPk(taskId, {
            include: [{ model: Lesson, as: "lesson" }]
        });
        if (!task) throw new Error("Task not found");

        const lesson = (task as any).lesson;
        const moduleId = lesson.moduleId as number;

        // Find pathId
        const module = await LearningModule.findByPk(moduleId);
        if (!module) throw new Error("Module not found");
        const pathId = module.learningPathId as number;

        const submission = await TaskSubmission.create({
            userId,
            taskId,
            submissionData,
            status: "submitted",
            submittedAt: new Date()
        });

        // Auto-complete for now (later add AI review)
        await this.updateProgress({
            userId,
            pathId,
            moduleId,
            lessonId: task.lessonId,
            taskId,
            status: "completed",
            metadata: { submissionId: submission.id }
        });

        return submission;
    }
}

export const progressTrackingService = new ProgressTrackingService();
