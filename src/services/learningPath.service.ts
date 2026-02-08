import {
    User,
    UserPreferences,
    LearningPath,
    LearningModule,
    Skill,
    Interest,
    Course,
    Branches,
    LearningSchedule,
    UserModuleProgress,
    Lesson,
    Task
} from "../models/index.js";
import { getJsonCompletion } from "./groq.js";
import { websocketService } from "./websocket.service.js";
import { resourceUrlService } from "./resourceUrl.service.js";
import sequelize from "../config/db.js";
import { QueryTypes } from "sequelize";

interface GeneratedTask {
    title: string;
    type: "reading" | "coding" | "quiz" | "project" | "discussion" | "reflection";
    purpose: string;
    estimatedMinutes: number;
    instructions: any;
    completionCriteria: any;
}

interface GeneratedLesson {
    title: string;
    objective: string;
    estimatedMinutes: number;
    contentType: "video" | "article" | "interactive" | "quiz";
    whyLearnThis: string;
    tasks: GeneratedTask[];
    keyTakeaways: string[];
}

interface GeneratedModule {
    title: string;
    description: string;
    moduleType: "course" | "micro-lesson" | "project" | "assessment" | "certification" | "workshop" | "reading";
    difficulty: "beginner" | "intermediate" | "advanced" | "expert";
    duration: number;
    skillTags: string[];
    category?: string;
    subcategory?: string;
    searchKeywords?: string;
    prerequisites?: string[];
    whyLearnThis?: string;
    realWorldApplications?: string[];
    lessons?: GeneratedLesson[];
}

interface GeneratedPath {
    name: string;
    description: string;
    personalizedReason: string;
    totalEstimatedHours: number;
    modules: GeneratedModule[];
    metadata?: any;
}

class LearningPathService {
    /**
     * Main function to generate learning path for a user
     */
    /**
     * Main function to generate learning path for a user
     */
    async generateLearningPath(userId: number): Promise<void> {
        try {
            // Fetch user data
            const user = await User.findByPk(userId);
            if (!user) {
                throw new Error("User not found");
            }

            // Skip generation for KIDS
            if (user.group === "KIDS") {
                console.log(`Skipping learning path generation for KIDS user ${userId}`);
                return;
            }

            // Fetch user preferences
            const preferences = await UserPreferences.findOne({ where: { userId } });
            if (!preferences) {
                throw new Error("User preferences not found");
            }

            // Fetch the most recent learning path
            let learningPath = await LearningPath.findOne({
                where: { userId },
                order: [["createdAt", "DESC"]]
            });

            let learningPathId: number;
            let shouldCreateNew = false;

            if (learningPath) {
                // If the current path is completed, check if user finished it
                if (learningPath.status === "completed") {
                    const isFinished = await this.isPathFinishedByUser(userId, learningPath.id);
                    if (isFinished) {
                        shouldCreateNew = true;
                    }
                }
            } else {
                shouldCreateNew = true;
            }

            if (shouldCreateNew) {
                // Create initial learning path record
                learningPath = await LearningPath.create({
                    userId,
                    name: `Learning Path for ${user.name} #${(await LearningPath.count({ where: { userId } })) + 1}`,
                    status: "generating",
                    userPreferencesId: preferences.id,
                    path: null
                });
                learningPathId = learningPath.id;
            } else if (learningPath) {
                console.log(`Updating/Fixing existing learning path for user ${userId}`);
                learningPathId = learningPath.id;

                // Delete old modules and schedules for this specific path
                await LearningModule.destroy({ where: { learningPathId: learningPathId } });
                await LearningSchedule.destroy({ where: { learningPathId: learningPathId } });

                // Update status to generating
                await learningPath.update({
                    status: "generating",
                    path: null,
                    userPreferencesId: preferences.id
                });
            } else {
                throw new Error("Failed to handle learning path record");
            }

            // Emit WebSocket event: generation started
            websocketService.emitGenerationStarted(userId, {
                learningPathId: learningPathId,
                message: "Learning path generation started"
            });

            // Start async generation (don't await)
            this.performGeneration(userId, learningPathId, user, preferences).catch((error) => {
                console.error(`Failed to generate learning path for user ${userId}:`, error);
            });
        } catch (error: any) {
            console.error(`Error initiating learning path generation for user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Perform the actual generation (async)
     */
    private async performGeneration(
        userId: number,
        learningPathId: number,
        user: any,
        preferences: any
    ): Promise<void> {
        try {
            // Fetch related data
            const skills = await Skill.findAll({ where: { id: preferences.skillIds || [] } });
            const interests = await Interest.findAll({ where: { id: preferences.interestIds || [] } });

            let course = null;
            if (preferences.courseId) {
                course = await Course.findByPk(preferences.courseId);
            }
            let branch = null;
            if (preferences.branchId) {
                branch = await Branches.findByPk(preferences.branchId);
            }

            // SIMILARITY CHECK: Try to find a similar path from another user
            const similarPath = await this.findSimilarLearningPath(user, preferences);
            if (similarPath) {
                console.log(
                    `[Similarity] Found a highly similar path from user ${similarPath.userId} (Score: ${similarPath.similarityScore})`
                );
                await this.copyLearningPath(similarPath, learningPathId, userId, preferences);
                return;
            }

            // Calculate how many new modules needed from Groq
            const targetModuleCount = this.calculateTargetModuleCount(user.group, preferences.weeklyLearningHours);

            console.log(`[Learning Path] Generating ${targetModuleCount} fresh modules for path ${learningPathId}`);

            // Generate path based on user group (only for missing modules)
            let generatedPath: GeneratedPath;
            switch (user.group) {
                case "COLLEGE_STUDENTS":
                    generatedPath = await this.generateCollegeStudentPath(
                        user,
                        preferences,
                        skills,
                        interests,
                        course,
                        branch
                    );
                    break;
                case "PROFESSIONALS":
                    generatedPath = await this.generateProfessionalPath(user, preferences, skills, interests);
                    break;
                case "TEENS":
                    generatedPath = await this.generateTeenPath(user, preferences, skills, interests);
                    break;
                case "SENIORS":
                    generatedPath = await this.generateSeniorPath(user, preferences, skills, interests);
                    break;
                default:
                    throw new Error(`Unsupported user group: ${user.group}`);
            }

            // Create learning modules (all fresh)
            const moduleIds = await this.createModules(
                learningPathId,
                generatedPath.modules,
                user.group,
                preferences.courseId,
                preferences.branchId
            );

            // Update learning path with generated data
            await LearningPath.update(
                {
                    path: {
                        description: generatedPath.description,
                        modules: moduleIds,
                        metadata: generatedPath.metadata || {}
                    },
                    personalizedReason: generatedPath.personalizedReason,
                    totalEstimatedHours: generatedPath.totalEstimatedHours,
                    status: "completed",
                    generatedAt: new Date()
                },
                { where: { id: learningPathId } }
            );

            // Generate learning schedule
            await this.generateSchedule(userId, learningPathId, moduleIds, preferences.weeklyLearningHours);

            // Emit WebSocket event: generation completed
            websocketService.emitGenerationCompleted(userId, {
                learningPathId,
                message: "Learning path generated successfully",
                path: generatedPath
            });

            console.log(`Successfully generated learning path for user ${userId}`);
        } catch (error: any) {
            console.error(`Error during learning path generation for user ${userId}:`, error);

            // Update learning path with error
            await LearningPath.update(
                {
                    status: "failed",
                    generationError: error.message || "Unknown error"
                },
                { where: { id: learningPathId } }
            );

            // Emit WebSocket event: generation failed
            websocketService.emitGenerationFailed(userId, {
                learningPathId,
                error: error.message || "Unknown error"
            });
        }
    }

    /**
     * Calculate target number of modules based on user group and learning hours
     */
    private calculateTargetModuleCount(userGroup: string, _weeklyHours: number): number {
        switch (userGroup) {
            case "COLLEGE_STUDENTS":
                return 15; // Semester-based, comprehensive
            case "PROFESSIONALS":
                return 10; // Career-focused, concise
            case "TEENS":
                return 12; // Interest-driven, varied
            case "SENIORS":
                return 6; // Gentle-paced, accessible
            default:
                return 10;
        }
    }

    /**
     * Generate learning path for college students (semester-based)
     */
    private async generateCollegeStudentPath(
        user: any,
        preferences: any,
        skills: any[],
        interests: any[],
        course: any,
        branch: any
    ): Promise<GeneratedPath> {
        const prompt = `Generate a comprehensive learning path for a college student with the following details:

User Information:
- Name: ${user.name}
- Age: ${user.age}
- Course: ${course?.name || "Not specified"}
- Branch: ${branch?.name || "Not specified"}
- Current Skills: ${skills.map((s) => s.name).join(", ") || "None"}
- Interests: ${interests.map((i) => i.name).join(", ") || "None"}
- Weekly Learning Hours: ${preferences.weeklyLearningHours || 5}
- Learning Style: ${preferences.learningStyle || "mixed"}

Generate a semester-based learning path with modules mapped to their academic curriculum. The path should:
1. Include 6-8 learning modules per semester
2. Progress from foundational to advanced topics
3. Align with their branch specialization (${branch?.name || "general"})
4. Include a mix of theory, projects, and assessments
5. Consider their current skill level and interests

For EVERY module, provide a detailed granular structure including Lessons and Tasks.

Return a JSON object with:
{
  "name": "Learning path name",
  "description": "Brief description of the path",
  "personalizedReason": "EXPLAIN WHY this specific path was generated for this user based on their profile, skills, and goals.",
  "totalEstimatedHours": 45.5,
  "modules": [
    {
      "title": "Module title",
      "description": "Module description",
      "moduleType": "course|micro-lesson|project|assessment|workshop|reading",
      "difficulty": "beginner|intermediate|advanced|expert",
      "duration": 120, // total module duration in minutes
      "skillTags": ["skill1", "skill2"],
      "category": "Semester 1|Semester 2|etc",
      "subcategory": "Core|Elective|Project",
      "searchKeywords": "optimal keywords for finding YouTube videos",
      "whyLearnThis": "Explain the importance of this module in the context of their career/course",
      "realWorldApplications": ["use case 1", "use case 2"],
      "lessons": [
        {
          "title": "Lesson title",
          "objective": "What will be learned",
          "estimatedMinutes": 30,
          "contentType": "video|article|interactive|quiz",
          "whyLearnThis": "Personalized reason for this lesson",
          "keyTakeaways": ["point 1", "point 2"],
          "tasks": [
            {
              "title": "Task title",
              "type": "reading|coding|quiz|project|discussion|reflection",
              "purpose": "Why do this task",
              "estimatedMinutes": 15,
              "instructions": { "steps": ["step 1", "step 2"] },
              "completionCriteria": { "requirement": "what to submit or achieve" }
            }
          ]
        }
      ]
    }
  ],
  "metadata": {
    "totalSemesters": 8,
    "estimatedCompletionMonths": 48
  }
}`;

        return await getJsonCompletion<GeneratedPath>(prompt, {
            temperature: 0.7,
            max_tokens: 4000
        });
    }

    /**
     * Generate learning path for professionals (skill/role-based)
     */
    private async generateProfessionalPath(
        user: any,
        preferences: any,
        skills: any[],
        interests: any[]
    ): Promise<GeneratedPath> {
        const prompt = `Generate a professional development learning path for the following professional:

User Information:
- Name: ${user.name}
- Age: ${user.age}
- Current Role: ${preferences.currentRole || "Not specified"}
- Target Role: ${preferences.targetRole || "Not specified"}
- Industry: ${preferences.industry || "Not specified"}
- Years of Experience: ${preferences.yearsOfExperience || 0}
- Current Skills: ${skills.map((s) => s.name).join(", ") || "None"}
- Interests: ${interests.map((i) => i.name).join(", ") || "None"}
- Weekly Learning Hours: ${preferences.weeklyLearningHours || 5}

Generate a skill progression path that helps them transition from their current role to target role. The path should:
1. Identify skill gaps between current and target role
2. Include 8-12 learning modules
3. Progress from foundational to advanced skills
4. Include practical projects and case studies
5. Focus on industry-relevant technologies and practices

For EVERY module, provide a detailed granular structure including Lessons and Tasks.

Return a JSON object with:
{
  "name": "Learning path name",
  "description": "Brief description of the path",
  "personalizedReason": "EXPLAIN WHY this specific path was generated for this user based on their profile, skills, and target role.",
  "totalEstimatedHours": 35,
  "modules": [
    {
      "title": "Module title",
      "description": "Module description",
      "moduleType": "course|micro-lesson|project|assessment|certification|workshop|reading",
      "difficulty": "beginner|intermediate|advanced|expert",
      "duration": 120, // total module duration in minutes
      "skillTags": ["skill1", "skill2"],
      "category": "Technical Skills|Soft Skills|Leadership|Domain Knowledge",
      "subcategory": "Core|Advanced|Specialized",
      "searchKeywords": "optimal keywords for finding YouTube videos",
      "whyLearnThis": "Personalized reason for this module",
      "realWorldApplications": ["use case 1", "use case 2"],
      "lessons": [
        {
          "title": "Lesson title",
          "objective": "What will be learned",
          "estimatedMinutes": 30,
          "contentType": "video|article|interactive|quiz",
          "whyLearnThis": "Personalized reason for this lesson",
          "tasks": [
            {
              "title": "Task title",
              "type": "reading|coding|quiz|project|discussion|reflection",
              "purpose": "Why do this task",
              "estimatedMinutes": 15,
              "instructions": { "steps": ["step 1", "step 2"] },
              "completionCriteria": { "requirement": "what to submit or achieve" }
            }
          ]
        }
      ]
    }
  ],
  "metadata": {
    "skillGaps": ["gap1", "gap2"],
    "estimatedCompletionMonths": 6
  }
}`;

        return await getJsonCompletion<GeneratedPath>(prompt, {
            temperature: 0.7,
            max_tokens: 4000
        });
    }

    /**
     * Generate learning path for teens (skill learning, college prep, or interest-based)
     */
    private async generateTeenPath(
        user: any,
        preferences: any,
        skills: any[],
        interests: any[]
    ): Promise<GeneratedPath> {
        const prompt = `Generate a learning path for a teenager with the following details:

User Information:
- Name: ${user.name}
- Age: ${user.age}
- Current Skills: ${skills.map((s) => s.name).join(", ") || "None"}
- Interests: ${interests.map((i) => i.name).join(", ") || "None"}
- Weekly Learning Hours: ${preferences.weeklyLearningHours || 5}
- Learning Style: ${preferences.learningStyle || "mixed"}

Generate a learning path that focuses on:
1. Skill development in their areas of interest
2. College preparation if they're in high school
3. Career exploration based on interests
4. Mix of academic and practical skills
5. Include 6-10 engaging, age-appropriate modules

For EVERY module, provide a detailed granular structure including Lessons and Tasks.

Return a JSON object with:
{
  "name": "Learning path name",
  "description": "Brief description of the path",
  "personalizedReason": "EXPLAIN WHY this specific path was generated for this teen based on their interests and age.",
  "totalEstimatedHours": 20.0,
  "modules": [
    {
      "title": "Module title",
      "description": "Module description",
      "moduleType": "course|micro-lesson|project|assessment|workshop|reading",
      "difficulty": "beginner|intermediate|advanced",
      "duration": 60, // total module duration in minutes
      "skillTags": ["skill1", "skill2"],
      "category": "Skill Development|College Prep|Career Exploration",
      "whyLearnThis": "Fun and engaging reason for this module",
      "lessons": [
        {
          "title": "Lesson title",
          "objective": "What will be learned",
          "estimatedMinutes": 20,
          "contentType": "video|article|interactive",
          "whyLearnThis": "Personalized reason",
          "tasks": [
            {
              "title": "Task title",
              "type": "reading|coding|quiz|reflection",
              "purpose": "Why do this",
              "estimatedMinutes": 10,
              "instructions": { "steps": ["step 1"] }
            }
          ]
        }
      ]
    }
  ],
  "metadata": {
    "focusAreas": ["area1", "area2"],
    "estimatedCompletionMonths": 3
  }
}`;

        return await getJsonCompletion<GeneratedPath>(prompt, {
            temperature: 0.8,
            max_tokens: 3500
        });
    }

    /**
     * Generate learning path for seniors (gentle-paced, interest-driven)
     */
    private async generateSeniorPath(
        user: any,
        preferences: any,
        skills: any[],
        interests: any[]
    ): Promise<GeneratedPath> {
        const prompt = `Generate a gentle-paced learning path for a senior citizen with the following details:

User Information:
- Name: ${user.name}
- Age: ${user.age}
- Interests: ${interests.map((i) => i.name).join(", ") || "None"}
- Weekly Learning Hours: ${preferences.weeklyLearningHours || 3}
- Accessibility Settings: ${JSON.stringify(preferences.groupSpecificData?.accessibility || {})}

Generate a learning path that is:
1. Gentle-paced and easy to follow
2. Interest-driven and enjoyable
3. Includes 4-6 modules
4. Focuses on practical, life-enriching skills
5. Considers accessibility needs

For EVERY module, provide a detailed granular structure including Lessons and Tasks.

Return a JSON object with:
{
  "name": "Learning path name",
  "description": "Brief description of the path",
  "personalizedReason": "EXPLAIN WHY this specific path was generated for this senior user.",
  "totalEstimatedHours": 12.0,
  "modules": [
    {
      "title": "Module title",
      "description": "Module description",
      "moduleType": "course|micro-lesson|reading",
      "difficulty": "beginner",
      "duration": 30, // total module duration in minutes
      "skillTags": ["skill1", "skill2"],
      "category": "Personal Enrichment|Technology Basics|Hobbies",
      "whyLearnThis": "Gentle explanation of the purpose",
      "lessons": [
        {
          "title": "Lesson title",
          "objective": "What will be learned",
          "estimatedMinutes": 15,
          "contentType": "video|article",
          "whyLearnThis": "Personalized reason",
          "tasks": [
            {
              "title": "Task title",
              "type": "reading|reflection",
              "purpose": "Why do this",
              "estimatedMinutes": 10,
              "instructions": { "steps": ["step 1"] }
            }
          ]
        }
      ]
    }
  ],
  "metadata": {
    "paceLevel": "gentle",
    "estimatedCompletionMonths": 2
  }
}`;

        return await getJsonCompletion<GeneratedPath>(prompt, {
            temperature: 0.6,
            max_tokens: 2500
        });
    }

    private async createModules(
        learningPathId: number,
        modules: GeneratedModule[],
        userGroup: string,
        courseId?: number,
        branchId?: number
    ): Promise<number[]> {
        const createdModules: any[] = [];

        console.log(`[Learning Path] Creating ${modules.length} modules for path ${learningPathId}`);
        for (let index = 0; index < modules.length; index++) {
            const module = modules[index];

            try {
                const searchTerm = module.searchKeywords || module.title;
                const [videoUrl, thumbnailUrl, pdfResources] = await Promise.all([
                    resourceUrlService.findVideoUrl(searchTerm, module.duration).catch(() => null),
                    resourceUrlService.findThumbnail(searchTerm).catch(() => null),
                    resourceUrlService.findPdfResources(searchTerm).catch(() => [])
                ]);

                const format = resourceUrlService.getFormatMetadata(module.moduleType, module.duration);

                // Create module
                const created = await LearningModule.create({
                    title: module.title,
                    description: module.description,
                    moduleType: module.moduleType,
                    format: format.type,
                    difficulty: module.difficulty,
                    duration: module.duration,
                    contentUrl: videoUrl,
                    thumbnailUrl: thumbnailUrl,
                    category: module.category,
                    subcategory: module.subcategory,
                    skillTags: module.skillTags || [],
                    prerequisiteModules: [], // Will be handled if needed
                    targetUserGroups: [userGroup],
                    learningPathId,
                    orderInPath: index + 1,
                    isAiGenerated: true,
                    courseId: courseId || null,
                    groupSpecificMetadata: { branchId: branchId || null },
                    whyLearnThis: module.whyLearnThis || null,
                    realWorldApplications: module.realWorldApplications || [],
                    status: index === 0 ? "available" : "locked",
                    generationMetadata: {
                        generatedAt: new Date(),
                        searchKeywords: searchTerm,
                        pdfResources
                    }
                });

                // CREATE LESSONS for this module
                if (module.lessons && module.lessons.length > 0) {
                    for (let lessonIndex = 0; lessonIndex < module.lessons.length; lessonIndex++) {
                        const lessonData = module.lessons[lessonIndex];
                        const lesson = await Lesson.create({
                            moduleId: created.id,
                            title: lessonData.title,
                            objective: lessonData.objective,
                            keyTakeaways: lessonData.keyTakeaways || [],
                            contentType: lessonData.contentType,
                            estimatedMinutes: lessonData.estimatedMinutes,
                            orderInModule: lessonIndex + 1,
                            whyLearnThis: lessonData.whyLearnThis,
                            status: index === 0 && lessonIndex === 0 ? "available" : "locked"
                        });

                        // CREATE TASKS for this lesson
                        if (lessonData.tasks && lessonData.tasks.length > 0) {
                            for (let taskIndex = 0; taskIndex < lessonData.tasks.length; taskIndex++) {
                                const taskData = lessonData.tasks[taskIndex];
                                await Task.create({
                                    lessonId: lesson.id,
                                    title: taskData.title,
                                    type: taskData.type,
                                    instructions: taskData.instructions || {},
                                    purpose: taskData.purpose,
                                    completionCriteria: taskData.completionCriteria || {},
                                    estimatedMinutes: taskData.estimatedMinutes,
                                    orderInLesson: taskIndex + 1,
                                    points: 10
                                });
                            }
                        }
                    }
                }

                createdModules.push(created);
                console.log(`Created module ${index + 1}/${modules.length} with lessons and tasks`);
            } catch (error) {
                console.error(`Error creating granular module "${module.title}":`, error);

                // Fallback: Create basic module
                const created = await LearningModule.create({
                    title: module.title,
                    description: module.description,
                    moduleType: module.moduleType,
                    difficulty: module.difficulty,
                    duration: module.duration,
                    learningPathId,
                    orderInPath: index + 1,
                    isAiGenerated: true,
                    targetUserGroups: [userGroup],
                    status: index === 0 ? "available" : "locked"
                });
                createdModules.push(created);
            }
        }

        return createdModules.map((m) => m.id);
    }

    /**
     * Generate learning schedule based on weekly hours
     */
    private async generateSchedule(
        userId: number,
        learningPathId: number,
        moduleIds: number[],
        weeklyHours: number
    ): Promise<void> {
        // Calculate total duration
        const modules = await LearningModule.findAll({ where: { id: moduleIds } });
        const totalMinutes = modules.reduce((sum, m) => sum + (m.duration || 0), 0);

        // Calculate number of weeks needed
        const minutesPerWeek = weeklyHours * 60;
        const weeksNeeded = Math.ceil(totalMinutes / minutesPerWeek);

        // Create weekly schedules
        const startDate = new Date();
        const schedules = [];

        for (let week = 1; week <= weeksNeeded; week++) {
            const weekStartDate = new Date(startDate);
            weekStartDate.setDate(startDate.getDate() + (week - 1) * 7);

            const weekEndDate = new Date(weekStartDate);
            weekEndDate.setDate(weekStartDate.getDate() + 6);

            schedules.push({
                userId,
                learningPathId,
                periodType: "weekly" as const,
                periodNumber: week,
                startDate: weekStartDate,
                endDate: weekEndDate,
                scheduleData: {
                    weekNumber: week,
                    allocatedHours: weeklyHours,
                    modulesToComplete: this.distributeModules(moduleIds, week, weeksNeeded)
                },
                status: week === 1 ? ("active" as const) : ("upcoming" as const),
                completionPercentage: 0
            });
        }

        await LearningSchedule.bulkCreate(schedules);
    }

    /**
     * Distribute modules across weeks
     */
    private distributeModules(moduleIds: number[], currentWeek: number, totalWeeks: number): number[] {
        const modulesPerWeek = Math.ceil(moduleIds.length / totalWeeks);
        const startIndex = (currentWeek - 1) * modulesPerWeek;
        const endIndex = Math.min(startIndex + modulesPerWeek, moduleIds.length);
        return moduleIds.slice(startIndex, endIndex);
    }

    /**
     * Get learning path by userId
     */
    async getLearningPathByUserId(userId: number) {
        const learningPath = await LearningPath.findOne({
            where: { userId },
            order: [["createdAt", "DESC"]]
        });

        if (!learningPath) {
            return null;
        }

        // Fetch associated modules separately
        const modules = await LearningModule.findAll({
            where: { learningPathId: learningPath.id },
            order: [["orderInPath", "ASC"]]
        });

        return {
            ...learningPath.toJSON(),
            modules
        };
    }

    /**
     * Get generation status
     */
    async getGenerationStatus(userId: number) {
        const learningPath = await LearningPath.findOne({
            where: { userId },
            order: [["createdAt", "DESC"]]
        });

        if (!learningPath) {
            return {
                exists: false,
                status: null,
                message: "No learning path found"
            };
        }

        return {
            exists: true,
            status: learningPath.status,
            generatedAt: learningPath.generatedAt,
            error: learningPath.generationError
        };
    }

    /**
     * Check if a user has finished all modules in a specific learning path
     */
    private async isPathFinishedByUser(userId: number, learningPathId: number): Promise<boolean> {
        const modules = await LearningModule.findAll({
            where: { learningPathId }
        });

        if (modules.length === 0) return true;

        const moduleIds = modules.map((m) => m.id);
        const progress = await UserModuleProgress.findAll({
            where: {
                userId,
                moduleId: moduleIds,
                status: "completed"
            }
        });

        return progress.length === moduleIds.length;
    }

    /**
     * Finds a similar learning path from another user using a point-based system
     */
    private async findSimilarLearningPath(user: any, prefs: any): Promise<any> {
        // Only search for other users in the same group
        const group = user.group;
        if (!group || group === "KIDS") return null;

        const skillIds = prefs.skillIds || [];
        const interestIds = prefs.interestIds || [];

        // Construct SQL for point-based similarity
        const query = `
            SELECT 
                lp.id as lp_id,
                lp."userId",
                lp.path,
                up.id as prefs_id,
                (
                    (CASE WHEN up."courseId" = :courseId AND :courseId IS NOT NULL THEN 25 ELSE 0 END) +
                    (CASE WHEN up."branchId" = :branchId AND :branchId IS NOT NULL THEN 25 ELSE 0 END) +
                    (CASE WHEN up."industry" = :industry AND :industry IS NOT NULL THEN 15 ELSE 0 END) +
                    (CASE WHEN up."targetRole" = :targetRole AND :targetRole IS NOT NULL THEN 15 ELSE 0 END) +
                    (COALESCE((SELECT COUNT(*) FROM unnest(up."skillIds") s WHERE s = ANY(:skillIds)), 0) * 8) +
                    (COALESCE((SELECT COUNT(*) FROM unnest(up."interestIds") i WHERE i = ANY(:interestIds)), 0) * 8)
                ) as "similarityScore"
            FROM learning_paths lp
            JOIN user_preferences up ON lp."userId" = up."userId"
            JOIN users u ON lp."userId" = u.id
            WHERE 
                lp.status = 'completed' AND 
                lp."userId" != :userId AND
                u."group" = :group
            ORDER BY "similarityScore" DESC
            LIMIT 1
        `;

        const results: any[] = await sequelize.query(query, {
            replacements: {
                userId: user.id,
                group: group,
                courseId: prefs.courseId || null,
                branchId: prefs.branchId || null,
                industry: prefs.industry || null,
                targetRole: prefs.targetRole || null,
                skillIds: skillIds.length > 0 ? skillIds : [0],
                interestIds: interestIds.length > 0 ? interestIds : [0]
            },
            type: QueryTypes.SELECT
        });

        if (results.length > 0 && results[0].similarityScore >= 40) {
            return results[0];
        }

        return null;
    }

    /**
     * Copies an existing learning path's modules and structure to a new path
     */
    private async copyLearningPath(source: any, targetPathId: number, targetUserId: number, prefs: any): Promise<void> {
        console.log(`[Similarity] Cloning modules from path ${source.lp_id} to ${targetPathId}`);

        // 1. Fetch source modules
        const sourceModules = await LearningModule.findAll({
            where: { learningPathId: source.lp_id },
            order: [["orderInPath", "ASC"]]
        });

        const newModuleIds: number[] = [];

        // 2. Clone each module
        for (const mod of sourceModules) {
            const cloned = await LearningModule.create({
                title: mod.title,
                description: mod.description,
                moduleType: mod.moduleType,
                format: mod.format,
                difficulty: mod.difficulty,
                duration: mod.duration,
                contentUrl: mod.contentUrl,
                thumbnailUrl: mod.thumbnailUrl,
                category: mod.category,
                subcategory: mod.subcategory,
                skillTags: mod.skillTags,
                prerequisiteModules: [],
                targetUserGroups: mod.targetUserGroups,
                groupSpecificMetadata: mod.groupSpecificMetadata,
                courseId: mod.courseId,
                learningPathId: targetPathId,
                orderInPath: mod.orderInPath,
                isAiGenerated: false,
                whyLearnThis: mod.whyLearnThis,
                realWorldApplications: mod.realWorldApplications,
                status: mod.status,
                generationMetadata: {
                    clonedFromPath: source.lp_id,
                    clonedFromModule: mod.id,
                    clonedAt: new Date()
                }
            });

            // Clone lessons for this module
            const sourceLessons = await Lesson.findAll({ where: { moduleId: mod.id } });
            for (const lesson of sourceLessons) {
                const clonedLesson = await Lesson.create({
                    moduleId: cloned.id,
                    title: lesson.title,
                    objective: lesson.objective,
                    keyTakeaways: lesson.keyTakeaways,
                    contentType: lesson.contentType,
                    contentUrl: lesson.contentUrl,
                    estimatedMinutes: lesson.estimatedMinutes,
                    orderInModule: lesson.orderInModule,
                    whyLearnThis: lesson.whyLearnThis,
                    status: lesson.status,
                    prerequisites: lesson.prerequisites
                });

                // Clone tasks for this lesson
                const sourceTasks = await Task.findAll({ where: { lessonId: lesson.id } });
                for (const task of sourceTasks) {
                    await Task.create({
                        lessonId: clonedLesson.id,
                        title: task.title,
                        type: task.type,
                        instructions: task.instructions,
                        purpose: task.purpose,
                        completionCriteria: task.completionCriteria,
                        difficultyLevel: task.difficultyLevel,
                        estimatedMinutes: task.estimatedMinutes,
                        orderInLesson: task.orderInLesson,
                        isRequired: task.isRequired,
                        points: task.points
                    });
                }
            }

            newModuleIds.push(cloned.id);
        }

        // 3. Update the path record
        const pathData = source.path || {};
        await LearningPath.update(
            {
                path: {
                    ...pathData,
                    modules: newModuleIds,
                    cloned: true,
                    sourceUserId: source.userId
                },
                status: "completed",
                generatedAt: new Date()
            },
            { where: { id: targetPathId } }
        );

        // 4. Generate schedule
        await this.generateSchedule(targetUserId, targetPathId, newModuleIds, prefs.weeklyLearningHours);

        // 5. Emit WebSocket event
        websocketService.emitGenerationCompleted(targetUserId, {
            learningPathId: targetPathId,
            message: "Learning path assigned based on similar profiles",
            path: {
                name: source.path?.name || "Learning Path",
                description: source.path?.description || "",
                modules: sourceModules.map((m) => m.toJSON()),
                metadata: source.path?.metadata || {}
            }
        });

        console.log(`[Similarity] Successfully cloned path for user ${targetUserId}`);
    }
}

export const learningPathService = new LearningPathService();
