import { ServiceAccess, UserContext } from "../types/access";

export class AccessChecker {
    public getAccessForUser(user: UserContext): ServiceAccess {
        const access: ServiceAccess = {
            canAccessLearningModules: true,
            canSubmitAssessments: false,
            canEarnCertifications: false,
            canCallAIAnalysis: false,
            canUpdateProfile: true,
            canModifyContent: false,
            canAccessClipModule: false,
            allowedUpdateFields: [],
            allowedModuleTypes: [],
            allowedAIFeatures: []
        };


        if (user.role === 'ADMIN') {
            return {
                canAccessLearningModules: true,
                canSubmitAssessments: true,
                canEarnCertifications: true,
                canCallAIAnalysis: true,
                canUpdateProfile: true,
                canModifyContent: true,
                canAccessClipModule: true,
                allowedModuleTypes: ['ALL'],
                allowedAIFeatures: ['ALL']
            };
        }

        if (user.role === 'MODERATOR') {
            access.canModifyContent = true;
            access.allowedAIFeatures = ['content-moderation'];
        }

        // Enforce Onboarding
        if (!user.isOnboarded) {
            return {
                canAccessLearningModules: false,
                canSubmitAssessments: false,
                canEarnCertifications: false,
                canCallAIAnalysis: false,
                canUpdateProfile: true, // Allow them to onboard
                canModifyContent: false,
                canAccessClipModule: false,
                allowedUpdateFields: [],
                allowedModuleTypes: [],
                allowedAIFeatures: []
            };
        }


        switch (user.group) {
            case 'KIDS':
                access.allowedModuleTypes = ['interactive-story', 'gamified-lesson'];
                access.canSubmitAssessments = false;
                access.canCallAIAnalysis = false;
                access.canAccessClipModule = true;
                access.allowedUpdateFields = ['interests', 'avatar'];
                break;
            case 'TEENS':
                access.allowedModuleTypes = ['interactive-story', 'gamified-lesson', 'quiz'];
                access.canSubmitAssessments = true;
                access.canCallAIAnalysis = true;
                access.allowedAIFeatures = ['homework-help'];
                access.allowedUpdateFields = ['interests', 'bio', 'learningStyle'];
                break;
            case 'COLLEGE_STUDENTS':
                access.allowedModuleTypes = ['lecture', 'project', 'quiz', 'lab'];
                access.canSubmitAssessments = true;
                access.canEarnCertifications = true;
                access.canCallAIAnalysis = true;
                access.allowedAIFeatures = ['skill-gap', 'career-path', 'resume-review'];
                access.allowedUpdateFields = ['interests', 'bio', 'skills', 'certificationStatus', 'linkedin'];
                break;
            case 'PROFESSIONALS':
                access.allowedModuleTypes = ['lecture', 'project', 'case-study'];
                access.canSubmitAssessments = true;
                access.canEarnCertifications = true;
                access.canCallAIAnalysis = true;
                access.allowedAIFeatures = ['skill-gap', 'career-path', 'market-analysis'];
                access.allowedUpdateFields = ['interests', 'bio', 'skills', 'portfolio', 'experience'];
                break;
            case 'SENIORS':
                access.allowedModuleTypes = ['simplified-lesson', 'video-guide'];
                access.canCallAIAnalysis = true;
                access.allowedAIFeatures = ['basic-guidance'];
                access.allowedUpdateFields = ['interests', 'accessibilitySettings'];
                break;
        }

        if (user.subscriptionStatus === 'FREE') {
            if (access.allowedAIFeatures && access.allowedAIFeatures.length > 0) {
                access.allowedAIFeatures = access.allowedAIFeatures.filter(f => !['career-path', 'market-analysis'].includes(f));
            }
            // Could also restrict module types here if needed
        } else if (user.subscriptionStatus === 'PAID') {
        }

        return access;
    }
}

export const accessChecker = new AccessChecker();
