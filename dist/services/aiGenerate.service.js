import { Op } from "sequelize";
import { Course, Skill, Interest } from "../models/index.js";
import { getJsonCompletion } from "./groq.js";
class AiGenerateService {
    /**
     * Syncs courses from a provided list and optionally generates new ones via AI.
     * Deletes courses not in the provided list or not generated.
     */
    async syncCourses(inputCourses, generateCount = 0) {
        const results = { created: 0, updated: 0, deleted: 0, generated: 0 };
        // 1. Fetch Context (Skills & Interests) for better AI generation
        const allSkills = await Skill.findAll({ attributes: ["name"] });
        const allInterests = await Interest.findAll({ attributes: ["name"] });
        const skillNames = allSkills.map((s) => s.name);
        const interestNames = allInterests.map((i) => i.name);
        const processedCourses = [];
        const itemsToEnrich = [];
        // 2. Identify courses that need icon enrichment
        for (const item of inputCourses) {
            if (!item.icon || !item.iconLibrary) {
                itemsToEnrich.push(item);
            }
            else {
                processedCourses.push(item);
            }
        }
        // 3. AI Enrichment for icons
        if (itemsToEnrich.length > 0) {
            const enriched = await this.enrichCourseIcons(itemsToEnrich);
            processedCourses.push(...enriched);
        }
        // 4. AI Generation for new courses
        if (generateCount > 0) {
            const knownNames = processedCourses.map((c) => c.name);
            const generated = await this.generateContextualCourses(skillNames, interestNames, knownNames, generateCount);
            processedCourses.push(...generated);
            results.generated = generated.length;
        }
        // 5. Upsert courses
        const finalCourseNames = processedCourses.map((c) => c.name);
        for (const item of processedCourses) {
            const [course, wasCreated] = await Course.findOrCreate({
                where: { name: item.name },
                defaults: {
                    name: item.name,
                    category: item.category,
                    icon: item.icon || "school",
                    iconLibrary: item.iconLibrary || "MaterialIcons"
                }
            });
            if (wasCreated) {
                results.created++;
            }
            else {
                // Update if icon changed or category changed (though name is primary)
                if (course.getDataValue("icon") !== item.icon ||
                    course.getDataValue("iconLibrary") !== item.iconLibrary ||
                    course.getDataValue("category") !== item.category) {
                    await course.update({
                        category: item.category,
                        icon: item.icon,
                        iconLibrary: item.iconLibrary
                    });
                    results.updated++;
                }
            }
        }
        // 6. Delete courses NOT in the processed list
        // Note: We only delete if they are not in the list we just processed.
        const deletedCount = await Course.destroy({
            where: {
                name: {
                    [Op.notIn]: finalCourseNames
                }
            }
        });
        results.deleted = deletedCount;
        return results;
    }
    async enrichCourseIcons(items) {
        const enriched = [];
        const chunkSize = 20;
        for (let i = 0; i < items.length; i += chunkSize) {
            const chunk = items.slice(i, i + chunkSize);
            try {
                const prompt = `
                    I have a list of courses: ${JSON.stringify(chunk)}.
                    For each course, provide:
                    - "name": The exact name from input.
                    - "category": The exact category from input.
                    - "icon": A suitable icon name from Expo Vector Icons (MaterialCommunityIcons, MaterialIcons, FontAwesome, Ionicons).
                    - "iconLibrary": The library name.
                    
                    Return JSON with key "items".
                `;
                const response = await getJsonCompletion(prompt);
                if (response?.items)
                    enriched.push(...response.items);
            }
            catch (e) {
                console.error(`Error enriching course chunk ${i}:`, e);
                chunk.forEach((item) => enriched.push({ ...item, icon: "school", iconLibrary: "MaterialIcons" }));
            }
        }
        return enriched;
    }
    async generateContextualCourses(skills, interests, existingNames, count) {
        const skillContext = skills.slice(0, 50).join(", ");
        const interestContext = interests.slice(0, 30).join(", ");
        const exclusionList = existingNames.slice(0, 100);
        try {
            const prompt = `
                Generate ${count} distinct, real-world course names (degrees, diplomas, certifications) based on:
                Top Skills: ${skillContext}
                Top Interests: ${interestContext}
                
                DO NOT include these: ${JSON.stringify(exclusionList)}
                
                For each course, provide:
                - "name": Official course name.
                - "category": One of "TECH", "COMMERCE", "ARTS", "MEDICAL", "DIPLOMA", "CERTIFICATION".
                - "icon": Expo Vector Icon name.
                - "iconLibrary": Library name.
                
                Format: { "items": [{ "name": "...", "category": "...", "icon": "...", "iconLibrary": "..." }] }
            `;
            const response = await getJsonCompletion(prompt);
            return response?.items || [];
        }
        catch (e) {
            console.error("Error generating contextual courses:", e);
            return [];
        }
    }
}
export const aiGenerateService = new AiGenerateService();
