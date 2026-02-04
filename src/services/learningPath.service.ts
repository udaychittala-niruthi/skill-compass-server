import { User, UserPreferences, LearningPath, LearningModule, Skill, Interest, Course, Branches, LearningSchedule } from "../models";
import { getJsonCompletion } from "./groq";
import { websocketService } from "./websocket.service";
import { resourceUrlService } from "./resourceUrl.service";

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
}

interface GeneratedPath {
    name: string;
    description: string;
    modules: GeneratedModule[];
    metadata?: any;
}

class LearningPathService {
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

            // Check if learning path already exists
            const existingPath = await LearningPath.findOne({ where: { userId } });

            if (existingPath) {
                console.log(`Deleting existing learning path for user ${userId}`);

                // Delete associated modules and schedules first
                await LearningModule.destroy({ where: { learningPathId: existingPath.id } });
                await LearningSchedule.destroy({ where: { learningPathId: existingPath.id } });

                // Delete the learning path
                await existingPath.destroy();
            }

            // Create initial learning path record
            const learningPath = await LearningPath.create({
                userId,
                name: `Learning Path for ${user.name}`,
                status: "generating",
                userPreferencesId: preferences.id,
                path: null,
            });

            // Emit WebSocket event: generation started
            websocketService.emitGenerationStarted(userId, {
                learningPathId: learningPath.id,
                message: "Learning path generation started",
            });

            // Start async generation (don't await)
            this.performGeneration(userId, learningPath.id, user, preferences).catch((error) => {
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
            let branch = null;
            if (preferences.courseId) {
                course = await Course.findByPk(preferences.courseId);
            }
            if (preferences.branchId) {
                branch = await Branches.findByPk(preferences.branchId);
            }

            // Generate path based on user group
            let generatedPath: GeneratedPath;
            switch (user.group) {
                case "COLLEGE_STUDENTS":
                    generatedPath = await this.generateCollegeStudentPath(user, preferences, skills, interests, course, branch);
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

            // Create learning modules
            const moduleIds = await this.createModules(learningPathId, generatedPath.modules, user.group);

            // Update learning path with generated data
            await LearningPath.update(
                {
                    path: {
                        description: generatedPath.description,
                        modules: moduleIds,
                        metadata: generatedPath.metadata || {},
                    },
                    status: "completed",
                    generatedAt: new Date(),
                },
                { where: { id: learningPathId } }
            );

            // Generate learning schedule
            await this.generateSchedule(userId, learningPathId, moduleIds, preferences.weeklyLearningHours);

            // Emit WebSocket event: generation completed
            websocketService.emitGenerationCompleted(userId, {
                learningPathId,
                message: "Learning path generated successfully",
                path: generatedPath,
            });

            console.log(`Successfully generated learning path for user ${userId}`);
        } catch (error: any) {
            console.error(`Error during learning path generation for user ${userId}:`, error);

            // Update learning path with error
            await LearningPath.update(
                {
                    status: "failed",
                    generationError: error.message || "Unknown error",
                },
                { where: { id: learningPathId } }
            );

            // Emit WebSocket event: generation failed
            websocketService.emitGenerationFailed(userId, {
                learningPathId,
                error: error.message || "Unknown error",
            });
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

Return a JSON object with:
{
  "name": "Learning path name",
  "description": "Brief description of the path",
  "modules": [
    {
      "title": "Module title",
      "description": "Module description",
      "moduleType": "course|micro-lesson|project|assessment|workshop|reading",
      "difficulty": "beginner|intermediate|advanced|expert",
      "duration": 120, // in minutes
      "skillTags": ["skill1", "skill2"],
      "category": "Semester 1|Semester 2|etc",
      "subcategory": "Core|Elective|Project",
      "searchKeywords": "optimal keywords for finding YouTube videos",
      "prerequisites": [] // array of module titles or indices that must be completed first
    }
  ],
  "metadata": {
    "totalSemesters": 8,
    "estimatedCompletionMonths": 48
  }
}`;

        return await getJsonCompletion<GeneratedPath>(prompt, {
            temperature: 0.7,
            max_tokens: 4000,
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

Return a JSON object with:
{
  "name": "Learning path name",
  "description": "Brief description of the path",
  "modules": [
    {
      "title": "Module title",
      "description": "Module description",
      "moduleType": "course|micro-lesson|project|assessment|certification|workshop|reading",
      "difficulty": "beginner|intermediate|advanced|expert",
      "duration": 120, // in minutes
      "skillTags": ["skill1", "skill2"],
      "category": "Technical Skills|Soft Skills|Leadership|Domain Knowledge",
      "subcategory": "Core|Advanced|Specialized",
      "searchKeywords": "optimal keywords for finding YouTube videos",
      "prerequisites": [] // array of module titles that must be completed first
    }
  ],
  "metadata": {
    "skillGaps": ["gap1", "gap2"],
    "estimatedCompletionMonths": 6
  }
}`;

        return await getJsonCompletion<GeneratedPath>(prompt, {
            temperature: 0.7,
            max_tokens: 4000,
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

The path should be engaging, interactive, and help them explore potential career paths.

Return a JSON object with:
{
  "name": "Learning path name",
  "description": "Brief description of the path",
  "modules": [
    {
      "title": "Module title",
      "description": "Module description",
      "moduleType": "course|micro-lesson|project|assessment|workshop|reading",
      "difficulty": "beginner|intermediate|advanced",
      "duration": 60, // in minutes
      "skillTags": ["skill1", "skill2"],
      "category": "Skill Development|College Prep|Career Exploration",
      "subcategory": "Interactive|Project-Based|Theory",
      "searchKeywords": "optimal keywords for finding YouTube videos",
      "prerequisites": [] // array of module titles that must be completed first
    }
  ],
  "metadata": {
    "focusAreas": ["area1", "area2"],
    "estimatedCompletionMonths": 3
  }
}`;

        return await getJsonCompletion<GeneratedPath>(prompt, {
            temperature: 0.8,
            max_tokens: 3000,
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

Return a JSON object with:
{
  "name": "Learning path name",
  "description": "Brief description of the path",
  "modules": [
    {
      "title": "Module title",
      "description": "Module description",
      "moduleType": "course|micro-lesson|reading",
      "difficulty": "beginner",
      "duration": 30, // in minutes
      "skillTags": ["skill1", "skill2"],
      "category": "Personal Enrichment|Technology Basics|Hobbies",
      "subcategory": "Guided|Self-Paced",
      "searchKeywords": "optimal keywords for finding YouTube videos",
      "prerequisites": [] // array of module titles that must be completed first
    }
  ],
  "metadata": {
    "paceLevel": "gentle",
    "estimatedCompletionMonths": 2
  }
}`;

        return await getJsonCompletion<GeneratedPath>(prompt, {
            temperature: 0.6,
            max_tokens: 2000,
        });
    }

    /**
     * Create learning module records from generated data with real resources
     */
    private async createModules(
        learningPathId: number,
        modules: GeneratedModule[],
        userGroup: string
    ): Promise<number[]> {
        const createdModules: any[] = [];

        for (let index = 0; index < modules.length; index++) {
            const module = modules[index];

            try {
                // Get search keywords (use title if not provided)
                const searchTerm = module.searchKeywords || module.title;

                // Fetch real resources
                console.log(`Fetching resources for module: ${module.title}`);

                const [videoUrl, thumbnailUrl, pdfResources] = await Promise.all([
                    resourceUrlService.findVideoUrl(searchTerm, module.duration),
                    resourceUrlService.findThumbnail(searchTerm),
                    resourceUrlService.findPdfResources(searchTerm),
                ]);

                // Get format metadata
                const format = resourceUrlService.getFormatMetadata(module.moduleType, module.duration);

                // Map prerequisites to already-created module IDs
                const prerequisiteIds: number[] = [];
                if (module.prerequisites && module.prerequisites.length > 0) {
                    for (const prereqTitle of module.prerequisites) {
                        // Find by title match
                        const foundModule = createdModules.find((m) =>
                            m.title.toLowerCase().includes(prereqTitle.toLowerCase()) ||
                            prereqTitle.toLowerCase().includes(m.title.toLowerCase())
                        );

                        if (foundModule) {
                            prerequisiteIds.push(foundModule.id);
                        }
                    }
                }

                // Create module with all enhancements
                const created = await LearningModule.create({
                    title: module.title,
                    description: module.description,
                    moduleType: module.moduleType,
                    format: format.type, // Set format type
                    difficulty: module.difficulty,
                    duration: module.duration,
                    contentUrl: videoUrl,
                    thumbnailUrl: thumbnailUrl,
                    category: module.category,
                    subcategory: module.subcategory,
                    skillTags: module.skillTags || [],
                    prerequisiteModules: prerequisiteIds,
                    targetUserGroups: [userGroup],
                    learningPathId,
                    orderInPath: index + 1,
                    isAiGenerated: true,
                    generationMetadata: {
                        generatedAt: new Date(),
                        generatedFor: learningPathId,
                        searchKeywords: searchTerm,
                        formatMetadata: format,
                        pdfResources: pdfResources,
                        originalPrerequisites: module.prerequisites || [],
                    },
                });

                createdModules.push(created);

                console.log(`Created module ${index + 1}/${modules.length}: ${module.title}`);
            } catch (error) {
                console.error(`Error creating module "${module.title}":`, error);

                // Create module without resources rather than failing
                const created = await LearningModule.create({
                    title: module.title,
                    description: module.description,
                    moduleType: module.moduleType,
                    difficulty: module.difficulty,
                    duration: module.duration,
                    skillTags: module.skillTags || [],
                    category: module.category,
                    subcategory: module.subcategory,
                    learningPathId,
                    orderInPath: index + 1,
                    isAiGenerated: true,
                    targetUserGroups: [userGroup],
                    generationMetadata: {
                        generatedAt: new Date(),
                        generatedFor: learningPathId,
                        error: "Failed to fetch resources",
                    },
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
                    modulesToComplete: this.distributeModules(moduleIds, week, weeksNeeded),
                },
                status: week === 1 ? ("active" as const) : ("upcoming" as const),
                completionPercentage: 0,
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
        });

        if (!learningPath) {
            return null;
        }

        // Fetch associated modules separately
        const modules = await LearningModule.findAll({
            where: { learningPathId: learningPath.id },
            order: [["orderInPath", "ASC"]],
        });

        return {
            ...learningPath.toJSON(),
            modules,
        };
    }

    /**
     * Get generation status
     */
    async getGenerationStatus(userId: number) {
        const learningPath = await LearningPath.findOne({ where: { userId } });

        if (!learningPath) {
            return {
                exists: false,
                status: null,
                message: "No learning path found",
            };
        }

        return {
            exists: true,
            status: learningPath.status,
            generatedAt: learningPath.generatedAt,
            error: learningPath.generationError,
        };
    }
}

export const learningPathService = new LearningPathService();
