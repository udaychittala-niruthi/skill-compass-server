export interface UserContext {
    id: number;
    age: number;
    role: 'USER' | 'ADMIN' | 'MODERATOR';
    group: 'KIDS' | 'TEENS' | 'COLLEGE_STUDENTS' | 'PROFESSIONALS' | 'SENIORS';
    isOnboarded: boolean;
    preferences?: {
        interests: string[];
        skills: string[];
        learningStyle?: string;
    };
    subscriptionStatus?: 'FREE' | 'PAID' | 'TRIAL';
    certificationStatus?: Record<string, 'INTERESTED' | 'PREPARING' | 'PASSED'>;
}

export interface ServiceAccess {
    canAccessLearningModules: boolean;
    canSubmitAssessments: boolean;
    canEarnCertifications: boolean;
    canCallAIAnalysis: boolean;
    canUpdateProfile: boolean;
    canModifyContent: boolean;
    canAccessClipModule: boolean;
    allowedUpdateFields?: string[];
    allowedModuleTypes?: string[];
    allowedAIFeatures?: string[];
}
