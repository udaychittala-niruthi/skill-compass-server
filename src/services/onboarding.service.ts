import { User, UserPreferences } from "../models";
import { learningPathService } from "./learningPath.service";

class OnboardingService {
    async onboardKid(userId: number, data: { avatar?: string; bio?: string }) {
        const user = await User.findByPk(userId);
        if (!user) throw new Error("User not found");

        let prefs = await UserPreferences.findOne({ where: { userId } });
        if (!prefs) {
            prefs = await UserPreferences.create({ userId, ...data });
        } else {
            await prefs.update(data);
        }

        await user.update({ isOnboarded: true });

        // KIDS don't get learning paths - they only use clip module
        console.log(`Onboarding complete for KIDS user ${userId} - skipping learning path generation`);

        return prefs;
    }

    async onboardTeen(userId: number, data: { interestIds: number[]; skillIds: number[]; bio?: string }) {
        const user = await User.findByPk(userId);
        if (!user) throw new Error("User not found");

        let prefs = await UserPreferences.findOne({ where: { userId } });
        if (!prefs) {
            prefs = await UserPreferences.create({ userId, ...data });
        } else {
            await prefs.update(data);
        }

        await user.update({ isOnboarded: true });

        // Trigger learning path generation (async - don't wait)
        learningPathService.generateLearningPath(userId).catch(err => {
            console.error(`Failed to initiate learning path generation for user ${userId}:`, err);
        });

        return prefs;
    }

    async onboardStudent(
        userId: number,
        data: { courseId: number; branchId: number; bio?: string; skills?: number[] }
    ) {
        const user = await User.findByPk(userId);
        if (!user) throw new Error("User not found");

        let prefs = await UserPreferences.findOne({ where: { userId } });
        if (!prefs) {
            prefs = await UserPreferences.create({
                userId,
                courseId: data.courseId,
                branchId: data.branchId,
                skillIds: data.skills || [],
                bio: data.bio
            });
        } else {
            await prefs.update({
                courseId: data.courseId,
                branchId: data.branchId,
                skillIds: data.skills || [],
                bio: data.bio
            });
        }

        await user.update({ isOnboarded: true });

        // Trigger learning path generation (async - don't wait)
        learningPathService.generateLearningPath(userId).catch(err => {
            console.error(`Failed to initiate learning path generation for user ${userId}:`, err);
        });

        return prefs;
    }

    async onboardProfessional(
        userId: number,
        data: { currentRole: string; industry: string; yearsOfExperience: number; skills?: number[]; bio?: string }
    ) {
        const user = await User.findByPk(userId);
        if (!user) throw new Error("User not found");

        let prefs = await UserPreferences.findOne({ where: { userId } });
        if (!prefs) {
            prefs = await UserPreferences.create({
                userId,
                currentRole: data.currentRole,
                industry: data.industry,
                yearsOfExperience: data.yearsOfExperience,
                skillIds: data.skills || [],
                bio: data.bio
            });
        } else {
            await prefs.update({
                currentRole: data.currentRole,
                industry: data.industry,
                yearsOfExperience: data.yearsOfExperience,
                skillIds: data.skills || [],
                bio: data.bio
            });
        }

        await user.update({ isOnboarded: true });

        // Trigger learning path generation (async - don't wait)
        learningPathService.generateLearningPath(userId).catch(err => {
            console.error(`Failed to initiate learning path generation for user ${userId}:`, err);
        });

        return prefs;
    }

    async onboardSenior(userId: number, data: { interestIds?: number[]; bio?: string; accessibilitySettings?: any }) {
        const user = await User.findByPk(userId);
        if (!user) throw new Error("User not found");

        let prefs = await UserPreferences.findOne({ where: { userId } });
        if (!prefs) {
            prefs = await UserPreferences.create({
                userId,
                interestIds: data.interestIds || [],
                bio: data.bio,
                groupSpecificData: { accessibility: data.accessibilitySettings }
            });
        } else {
            await prefs.update({
                interestIds: data.interestIds || [],
                bio: data.bio,
                groupSpecificData: { ...prefs.groupSpecificData, accessibility: data.accessibilitySettings }
            });
        }

        await user.update({ isOnboarded: true });

        // Trigger learning path generation (async - don't wait)
        learningPathService.generateLearningPath(userId).catch(err => {
            console.error(`Failed to initiate learning path generation for user ${userId}:`, err);
        });

        return prefs;
    }

    async getOnboardingStatus(userId: number) {
        const user = await User.findByPk(userId);
        if (!user) throw new Error("User not found");
        return { isOnboarded: user.isOnboarded };
    }
}

export const onboardingService = new OnboardingService();
