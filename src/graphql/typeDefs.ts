
import { buildSchema } from "graphql";

export const typeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
    group: String
    role: String
    isOnboarded: Boolean
    createdAt: String
    updatedAt: String
    learningPath: LearningPath
    preferences: UserPreferences
    assessments: [Assessment]
    certifications: [UserCertification]
    portfolio: UserPortfolio
    schedules: [LearningSchedule]
    aiAnalyses: [AiAnalysis]
    moduleProgress: [UserModuleProgress]
  }

  type Interest {
    id: ID!
    name: String!
    category: String
  }

  type Skill {
    id: ID!
    name: String!
    category: String
  }

  type Course {
    id: ID!
    name: String!
    category: String
    branches: [Branch]
    modules: [LearningModule]
  }

  type Branch {
    id: ID!
    name: String!
    courseId: ID
    course: Course
  }

  type LearningPath {
    id: ID!
    userId: ID
    user: User
    userPreferencesId: ID
    userPreferences: UserPreferences
    modules: [LearningModule]
    schedules: [LearningSchedule]
    createdAt: String
    updatedAt: String
  }

  type UserPreferences {
    id: ID!
    userId: ID
    user: User
    courseId: ID
    course: Course
    branchId: ID
    branch: Branch
    learningStyle: String
    difficultyLevel: String
    createdAt: String
    updatedAt: String
  }

  type LearningModule {
    id: ID!
    title: String
    description: String
    content: String
    contentType: String
    difficultyLevel: String
    duration: Int
    courseId: ID
    course: Course
    learningPathId: ID
    learningPath: LearningPath
    assessments: [Assessment]
    userProgress: [UserModuleProgress]
  }

  type UserModuleProgress {
    id: ID!
    userId: ID
    user: User
    moduleId: ID
    module: LearningModule
    status: String
    progress: Int
    completedAt: String
  }

  type Assessment {
    id: ID!
    title: String
    type: String
    userId: ID
    user: User
    moduleId: ID
    module: LearningModule
    score: Int
    passed: Boolean
    createdAt: String
  }

  type Certification {
    id: ID!
    name: String
    issuingOrganization: String
    validityPeriod: String
    userProgress: [UserCertification]
  }

  type UserCertification {
    id: ID!
    userId: ID
    user: User
    certificationId: ID
    certification: Certification
    issueDate: String
    expiryDate: String
    credentialUrl: String
  }

  type UserPortfolio {
    id: ID!
    userId: ID
    user: User
    title: String
    description: String
    projectUrl: String
    createdAt: String
  }

  type LearningSchedule {
    id: ID!
    userId: ID
    user: User
    learningPathId: ID
    learningPath: LearningPath
    scheduledDate: String
    status: String
    reminderSent: Boolean
  }

  type AiAnalysis {
    id: ID!
    userId: ID
    user: User
    analysisType: String
    resultData: String
    createdAt: String
  }

  type EducationalResource {
    id: ID!
    title: String
    type: String
    url: String
    description: String
    tags: [String]
  }

  type Query {
    users: [User]
    user(id: ID!): User
    interests: [Interest]
    interest(id: ID!): Interest
    skills: [Skill]
    skill(id: ID!): Skill
    courses: [Course]
    course(id: ID!): Course
    branches: [Branch]
    branch(id: ID!): Branch
    learningPaths: [LearningPath]
    learningPath(id: ID!): LearningPath
    userPreferences: [UserPreferences]
    userPreference(id: ID!): UserPreferences
    learningModules: [LearningModule]
    learningModule(id: ID!): LearningModule
    userModuleProgresses: [UserModuleProgress]
    userModuleProgress(id: ID!): UserModuleProgress
    assessments: [Assessment]
    assessment(id: ID!): Assessment
    certifications: [Certification]
    certification(id: ID!): Certification
    userCertifications: [UserCertification]
    userCertification(id: ID!): UserCertification
    userPortfolios: [UserPortfolio]
    userPortfolio(id: ID!): UserPortfolio
    learningSchedules: [LearningSchedule]
    learningSchedule(id: ID!): LearningSchedule
    aiAnalyses: [AiAnalysis]
    aiAnalysis(id: ID!): AiAnalysis
    educationalResources: [EducationalResource]
    educationalResource(id: ID!): EducationalResource
    
    # Dashboard stats
    dashboardStats: DashboardStats
  }

  type DashboardStats {
    totalUsers: Int
    totalCourses: Int
    totalModules: Int
    activeUsers: Int
  }
`;
