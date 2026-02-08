import { Achievement, UserAchievement, LearningAnalytics, UserProgress } from "../models/index.js";
import { Op } from "sequelize";
import { startOfDay, subDays, isSameDay } from "date-fns";

class GamificationService {
    /**
     * Award points to a user
     */
    async awardPoints(userId: number, points: number, reason: string): Promise<void> {
        // Log in analytics
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
            pointsEarned: analytic.pointsEarned + points
        });

        console.log(`Awarded ${points} points to user ${userId} for: ${reason}`);
    }

    /**
     * Check and award achievements based on recent activity
     */
    async checkAchievements(userId: number): Promise<void> {
        // Fetch all defined achievements
        const allAchievements = await Achievement.findAll();

        // Fetch user's earned achievements
        const earnedAchievementIds = (
            await UserAchievement.findAll({
                where: { userId }
            })
        ).map((ua) => ua.achievementId);

        const unearnedAchievements = allAchievements.filter((a) => !earnedAchievementIds.includes(a.id));

        for (const achievement of unearnedAchievements) {
            const isQualified = await this.evaluateAchievement(userId, achievement);
            if (isQualified) {
                await UserAchievement.create({
                    userId,
                    achievementId: achievement.id,
                    earnedAt: new Date(),
                    metadata: { category: achievement.category, criteria: achievement.criteria }
                });
                console.log(`User ${userId} earned achievement: ${achievement.name}`);

                // Award bonus points for achievement
                await this.awardPoints(userId, achievement.points || 50, `Achievement: ${achievement.name}`);
            }
        }
    }

    private async evaluateAchievement(userId: number, achievement: Achievement): Promise<boolean> {
        const { category, criteria } = achievement as any;

        switch (category) {
            case "streak": {
                const streakTarget = criteria.days || 3;
                const currentStreak = await this.calculateCurrentStreak(userId);
                return currentStreak >= streakTarget;
            }

            case "completion": {
                if (criteria.entity === "module") {
                    const moduleCount = await UserProgress.count({
                        where: { userId, moduleId: { [Op.ne]: null }, lessonId: null, status: "completed" }
                    });
                    return moduleCount >= (criteria.count || 1);
                }
                if (criteria.entity === "task") {
                    const taskCount = await UserProgress.count({
                        where: { userId, taskId: { [Op.ne]: null }, status: "completed" }
                    });
                    return taskCount >= (criteria.count || 5);
                }
                break;
            }

            case "points": {
                const totalPoints = await LearningAnalytics.sum("pointsEarned", { where: { userId } });
                return totalPoints >= (criteria.amount || 100);
            }

            case "special": {
                // Custom logic for onboarding or first path
                if (criteria.id === "pioneer") return true;
                break;
            }
        }

        return false;
    }

    private async calculateCurrentStreak(userId: number): Promise<number> {
        const analytics = await LearningAnalytics.findAll({
            where: { userId },
            order: [["date", "DESC"]],
            limit: 30
        });

        if (analytics.length === 0) return 0;

        let streak = 0;

        // If today hasn't been logged yet, check if yesterday was logged
        if (!isSameDay(analytics[0].date, startOfDay(new Date()))) {
            if (!isSameDay(analytics[0].date, startOfDay(subDays(new Date(), 1)))) {
                return 0; // Streak broken
            }
        }

        for (let i = 0; i < analytics.length; i++) {
            const analyticDate = analytics[i].date;
            const expectedDate = startOfDay(subDays(startOfDay(new Date()), i));

            // Allow for a missing "today" log if we're just checking
            if (isSameDay(analyticDate, expectedDate)) {
                streak++;
            } else if (i === 0 && isSameDay(analyticDate, subDays(expectedDate, 1))) {
                // Today missing but yesterday exists, count yesterday and keep going
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }

    /**
     * Seed initial achievements if they don't exist
     */
    async seedAchievements(): Promise<void> {
        const initialAchievements = [
            {
                name: "Quick Starter",
                description: "Complete your first learning task",
                category: "completion",
                criteria: { entity: "task", count: 1 },
                points: 10
            },
            {
                name: "Consistent Learner",
                description: "Maintain a 3-day learning streak",
                category: "streak",
                criteria: { days: 3 },
                points: 50
            },
            {
                name: "Path Finder",
                description: "Complete your first learning module",
                category: "completion",
                criteria: { entity: "module", count: 1 },
                points: 100
            },
            {
                name: "Scholar",
                description: "Earn 500 total points",
                category: "mastery",
                criteria: { amount: 500 },
                points: 200
            }
        ];

        for (const ach of initialAchievements) {
            await Achievement.findOrCreate({
                where: { name: ach.name },
                defaults: ach
            });
        }
    }
}

export const gamificationService = new GamificationService();
