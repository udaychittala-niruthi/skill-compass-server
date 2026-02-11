import { User, UserPreferences, LearningPath, LearningModule, Skill, Interest, Course, Branches, LearningSchedule, UserModuleProgress } from "../models/index.js";
import { getJsonCompletion } from "./groq.js";
import { websocketService } from "./websocket.service.js";
import { resourceUrlService } from "./resourceUrl.service.js";
import sequelize from "../config/db.js";
import { QueryTypes } from "sequelize";
class LearningPathService {
    /**
     * Main function to generate learning path for a user
     */
    /**
     * Main function to generate learning path for a user
     */
    async generateLearningPath(userId) {
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
            // Fetch skills for module search
            const skillIds = preferences.skillIds || [];
            // Fetch the most recent learning path
            let learningPath = await LearningPath.findOne({
                where: { userId },
                order: [["createdAt", "DESC"]]
            });
            let learningPathId;
            let shouldCreateNew = false;
            if (learningPath) {
                // If the current path is completed, check if user finished it
                if (learningPath.status === "completed") {
                    const isFinished = await this.isPathFinishedByUser(userId, learningPath.id);
                    if (isFinished) {
                        shouldCreateNew = true;
                    }
                }
            }
            else {
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
            }
            else if (learningPath) {
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
            }
            else {
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
        }
        catch (error) {
            console.error(`Error initiating learning path generation for user ${userId}:`, error);
            throw error;
        }
    }
    /**
     * Perform the actual generation (async)
     */
    async performGeneration(userId, learningPathId, user, preferences) {
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
                console.log(`[Similarity] Found a highly similar path from user ${similarPath.userId} (Score: ${similarPath.similarityScore})`);
                await this.copyLearningPath(similarPath, learningPathId, userId, preferences);
                return;
            }
            // Calculate how many new modules needed from Groq
            const targetModuleCount = this.calculateTargetModuleCount(user.group, preferences.weeklyLearningHours);
            console.log(`[Learning Path] Generating ${targetModuleCount} fresh modules for path ${learningPathId}`);
            // Generate path based on user group (only for missing modules)
            let generatedPath;
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
            // Create learning modules (all fresh)
            const moduleIds = await this.createModules(learningPathId, generatedPath.modules, user.group, preferences.courseId, preferences.branchId);
            // Update learning path with generated data
            await LearningPath.update({
                path: {
                    description: generatedPath.description,
                    modules: moduleIds,
                    metadata: generatedPath.metadata || {}
                },
                status: "completed",
                generatedAt: new Date()
            }, { where: { id: learningPathId } });
            // Generate learning schedule
            await this.generateSchedule(userId, learningPathId, moduleIds, preferences.weeklyLearningHours);
            // Emit WebSocket event: generation completed
            websocketService.emitGenerationCompleted(userId, {
                learningPathId,
                message: "Learning path generated successfully",
                path: generatedPath
            });
            console.log(`Successfully generated learning path for user ${userId}`);
        }
        catch (error) {
            console.error(`Error during learning path generation for user ${userId}:`, error);
            // Update learning path with error
            await LearningPath.update({
                status: "failed",
                generationError: error.message || "Unknown error"
            }, { where: { id: learningPathId } });
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
    calculateTargetModuleCount(userGroup, _weeklyHours) {
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
    async generateCollegeStudentPath(user, preferences, skills, interests, course, branch) {
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
        return await getJsonCompletion(prompt, {
            temperature: 0.7,
            max_tokens: 4000
        });
    }
    /**
     * Generate learning path for professionals (skill/role-based)
     */
    async generateProfessionalPath(user, preferences, skills, interests) {
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
        return await getJsonCompletion(prompt, {
            temperature: 0.7,
            max_tokens: 4000
        });
    }
    /**
     * Generate learning path for teens (skill learning, college prep, or interest-based)
     */
    async generateTeenPath(user, preferences, skills, interests) {
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
        return await getJsonCompletion(prompt, {
            temperature: 0.8,
            max_tokens: 3000
        });
    }
    /**
     * Generate learning path for seniors (gentle-paced, interest-driven)
     */
    async generateSeniorPath(user, preferences, skills, interests) {
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
        return await getJsonCompletion(prompt, {
            temperature: 0.6,
            max_tokens: 2000
        });
    }
    async createModules(learningPathId, modules, userGroup, courseId, branchId) {
        const createdModules = [];
        // Create new modules from Groq generation
        console.log(`[Learning Path] Creating ${modules.length} modules`);
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
                    resourceUrlService.findPdfResources(searchTerm)
                ]);
                // Get format metadata
                const format = resourceUrlService.getFormatMetadata(module.moduleType, module.duration);
                // Map prerequisites to already-created module IDs
                const prerequisiteIds = [];
                if (module.prerequisites && module.prerequisites.length > 0) {
                    for (const prereqTitle of module.prerequisites) {
                        // Find by title match
                        const foundModule = createdModules.find((m) => m.title.toLowerCase().includes(prereqTitle.toLowerCase()) ||
                            prereqTitle.toLowerCase().includes(m.title.toLowerCase()));
                        if (foundModule) {
                            prerequisiteIds.push(foundModule.id);
                        }
                    }
                }
                // Create module with all enhancements
                const created = await LearningModule.create({
                    title: module.title,
                    description: module.description,
                    moduleType: this.mapModuleType(module.moduleType),
                    format: format.type, // Set format type
                    difficulty: this.mapDifficulty(module.difficulty),
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
                    courseId: courseId || null,
                    groupSpecificMetadata: { branchId: branchId || null },
                    generationMetadata: {
                        generatedAt: new Date(),
                        generatedFor: learningPathId,
                        searchKeywords: searchTerm,
                        formatMetadata: format,
                        pdfResources: pdfResources,
                        originalPrerequisites: module.prerequisites || []
                    }
                });
                createdModules.push(created);
                console.log(`Created module ${index + 1}/${modules.length}: ${module.title}`);
            }
            catch (error) {
                console.error(`Error creating module "${module.title}":`, error);
                // Create module without resources rather than failing
                const created = await LearningModule.create({
                    title: module.title,
                    description: module.description,
                    moduleType: this.mapModuleType(module.moduleType),
                    difficulty: this.mapDifficulty(module.difficulty),
                    duration: module.duration,
                    skillTags: module.skillTags || [],
                    category: module.category,
                    subcategory: module.subcategory,
                    learningPathId,
                    orderInPath: index + 1,
                    isAiGenerated: true,
                    targetUserGroups: [userGroup],
                    courseId: courseId || null,
                    groupSpecificMetadata: { branchId: branchId || null },
                    generationMetadata: {
                        generatedAt: new Date(),
                        generatedFor: learningPathId,
                        error: error.message || "Failed to fetch resources"
                    }
                });
                createdModules.push(created);
            }
        }
        return createdModules.map((m) => m.id);
    }
    /**
     * Generate learning schedule based on weekly hours
     */
    async generateSchedule(userId, learningPathId, moduleIds, weeklyHours) {
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
                periodType: "weekly",
                periodNumber: week,
                startDate: weekStartDate,
                endDate: weekEndDate,
                scheduleData: {
                    weekNumber: week,
                    allocatedHours: weeklyHours,
                    modulesToComplete: this.distributeModules(moduleIds, week, weeksNeeded)
                },
                status: week === 1 ? "active" : "upcoming",
                completionPercentage: 0
            });
        }
        await LearningSchedule.bulkCreate(schedules);
    }
    /**
     * Distribute modules across weeks
     */
    distributeModules(moduleIds, currentWeek, totalWeeks) {
        const modulesPerWeek = Math.ceil(moduleIds.length / totalWeeks);
        const startIndex = (currentWeek - 1) * modulesPerWeek;
        const endIndex = Math.min(startIndex + modulesPerWeek, moduleIds.length);
        return moduleIds.slice(startIndex, endIndex);
    }
    /**
     * Get learning path by userId
     */
    async getLearningPathByUserId(userId) {
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
    async getGenerationStatus(userId) {
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
    async isPathFinishedByUser(userId, learningPathId) {
        const modules = await LearningModule.findAll({
            where: { learningPathId }
        });
        if (modules.length === 0)
            return true;
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
    async findSimilarLearningPath(user, prefs) {
        // Only search for other users in the same group
        const group = user.group;
        if (!group || group === "KIDS")
            return null;
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
                    (COALESCE((SELECT COUNT(*) FROM unnest(up."skillIds") s WHERE s = ANY(ARRAY[:skillIds])), 0) * 8) +
                    (COALESCE((SELECT COUNT(*) FROM unnest(up."interestIds") i WHERE i = ANY(ARRAY[:interestIds])), 0) * 8)
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
        const results = await sequelize.query(query, {
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
    async copyLearningPath(source, targetPathId, targetUserId, prefs) {
        console.log(`[Similarity] Cloning modules from path ${source.lp_id} to ${targetPathId}`);
        // 1. Fetch source modules
        const sourceModules = await LearningModule.findAll({
            where: { learningPathId: source.lp_id },
            order: [["orderInPath", "ASC"]]
        });
        const newModuleIds = [];
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
                prerequisiteModules: [], // Re-map later if needed, but simple clone for now
                targetUserGroups: mod.targetUserGroups,
                groupSpecificMetadata: mod.groupSpecificMetadata,
                courseId: mod.courseId,
                learningPathId: targetPathId,
                orderInPath: mod.orderInPath,
                isAiGenerated: false, // It's a clone
                generationMetadata: {
                    clonedFromPath: source.lp_id,
                    clonedFromModule: mod.id,
                    clonedAt: new Date()
                }
            });
            newModuleIds.push(cloned.id);
        }
        // 3. Update the path record
        const pathData = source.path || {};
        await LearningPath.update({
            path: {
                ...pathData,
                modules: newModuleIds,
                cloned: true,
                sourceUserId: source.userId
            },
            status: "completed",
            generatedAt: new Date()
        }, { where: { id: targetPathId } });
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
    /**
     * Map AI-generated difficulty to valid enum values
     */
    mapDifficulty(difficulty) {
        const d = difficulty?.toLowerCase() || "";
        if (d.includes("beginner") || d.includes("foundational") || d.includes("basic") || d.includes("entry"))
            return "beginner";
        if (d.includes("advanced") || d.includes("hard"))
            return "advanced";
        if (d.includes("expert") || d.includes("pro") || d.includes("master"))
            return "expert";
        return "intermediate";
    }
    /**
     * Map AI-generated module type to valid enum values
     */
    mapModuleType(type) {
        const t = type?.toLowerCase() || "";
        if (t.includes("course"))
            return "course";
        if (t.includes("micro") || t.includes("lesson"))
            return "micro-lesson";
        if (t.includes("project"))
            return "project";
        if (t.includes("assessment") || t.includes("test") || t.includes("quiz"))
            return "assessment";
        if (t.includes("certification") || t.includes("cert"))
            return "certification";
        if (t.includes("workshop") || t.includes("seminar"))
            return "workshop";
        if (t.includes("reading") || t.includes("article") || t.includes("book"))
            return "reading";
        return "course";
    }
}
export const learningPathService = new LearningPathService();
