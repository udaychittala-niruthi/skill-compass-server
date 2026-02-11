import { Course, Branches, Interest, Skill } from "../models/index.js";
import { getJsonCompletion } from "./groq.js";
class PredictionService {
    async predictCourses(data) {
        const { interestIds, skillIds } = data;
        // 1. Fetch Metadata
        const interests = await Interest.findAll({ where: { id: interestIds } });
        const skills = await Skill.findAll({ where: { id: skillIds } });
        const AllCourses = await Course.findAll({ attributes: ["id", "name", "category", "icon", "iconLibrary"] });
        if (interests.length === 0 && skills.length === 0) {
            throw new Error("At least one interest or skill is required for prediction.");
        }
        const interestNames = interests.map((i) => i.name).join(", ");
        const skillNames = skills.map((s) => s.name).join(", ");
        // Optimize: Send minimal data to AI
        const courseMap = AllCourses.map((c) => ({ id: c.id, name: c.name, category: c.category }));
        // 2. Construct Prompt
        const prompt = `
        Match the following profile to the top 3 most suitable courses from the provided list.
        
        Your Profile:
        - Interests: [${interestNames}]
        - Skills: [${skillNames}]

        Available Courses (ID: Name - Category):
        ${JSON.stringify(courseMap)}

        Strict Instructions: 
        1. Return a JSON object with a single key "predictions".
        2. "predictions" should be an array of exactly 3 best matches.
        3. Format: { "predictions": [{ "id": <courseId>, "score": <0-100>, "reasoning": "<short explanation>" }] }
        4. "id" MUST match one of the provided IDs exacty.
        `;
        // 3. Call AI
        try {
            const aiResponse = await getJsonCompletion(prompt, {
                temperature: 0, // Deterministic
                systemPrompt: "You are a career counselor AI. return strictly valid JSON."
            });
            // Handle potential wrapping
            const items = Array.isArray(aiResponse)
                ? aiResponse
                : aiResponse.courses || aiResponse.predictions || [];
            if (!Array.isArray(items)) {
                throw new Error("AI response is not an array and could not be unwrapped.");
            }
            // 4. Map back to full objects (sanity check)
            const sortedItems = items.sort((a, b) => b.score - a.score);
            const predictions = [];
            for (let i = 0; i < sortedItems.length; i++) {
                const item = sortedItems[i];
                const course = AllCourses.find((c) => String(c.id) === String(item.id));
                if (course) {
                    predictions.push({
                        id: course.id,
                        name: course.name,
                        category: course.category,
                        icon: course.icon,
                        iconLibrary: course.iconLibrary,
                        matchPercentage: item.score,
                        reasoning: item.reasoning,
                        isTopRecommended: i === 0
                    });
                }
            }
            if (predictions.length === 0) {
                throw new Error(`No predictions matched DB records. Raw AI Items: ${JSON.stringify(items)}`);
            }
            return predictions;
        }
        catch (error) {
            console.error("Course Prediction Error:", JSON.stringify(error, null, 2));
            if (error?.response?.data)
                console.error("Groq Response:", JSON.stringify(error.response.data, null, 2));
            throw new Error(`Failed to generate predictions: ${error.message}`);
        }
    }
    async predictBranches(data) {
        const { interestIds, skillIds, courseId } = data;
        if (!courseId)
            throw new Error("Course ID is required for branch prediction.");
        const interests = await Interest.findAll({ where: { id: interestIds } });
        const skills = await Skill.findAll({ where: { id: skillIds } });
        const course = await Course.findByPk(courseId);
        const branches = await Branches.findAll({ where: { courseId } });
        if (!course)
            throw new Error("Course not found.");
        if (branches.length === 0)
            return []; // No branches to predict
        const interestNames = interests.map((i) => i.name).join(", ");
        const skillNames = skills.map((s) => s.name).join(", ");
        const branchMap = branches.map((b) => ({ id: b.id, name: b.name }));
        const prompt = `
        You have selected course: "${course.name}".
        Rank the top 3 branches/specializations based on your profile.
        
        Your Profile:
        - Interests: [${interestNames}]
        - Skills: [${skillNames}]

        Available Branches:
        ${JSON.stringify(branchMap)}

        Strict Instructions: 
        1. Return a JSON object with a single key "predictions".
        2. "predictions" should be an array of exactly 3 best matches.
        3. Format: { "predictions": [{ "id": <branchId>, "score": <0-100>, "reasoning": "<short explanation>" }] }
        4. "id" MUST match a provided ID.
        `;
        try {
            const aiResponse = await getJsonCompletion(prompt, {
                temperature: 0,
                systemPrompt: "You are an academic counselor AI. Return strictly valid JSON."
            });
            // Handle potential wrapping
            const items = Array.isArray(aiResponse) ? aiResponse : aiResponse.predictions || [];
            if (!Array.isArray(items)) {
                throw new Error("AI response is not an array and could not be unwrapped.");
            }
            const sortedItems = items.sort((a, b) => b.score - a.score);
            const predictions = [];
            for (let i = 0; i < sortedItems.length; i++) {
                const item = sortedItems[i];
                const branch = branches.find((b) => String(b.id) === String(item.id));
                if (branch) {
                    predictions.push({
                        id: branch.id,
                        name: branch.name,
                        category: course.category,
                        icon: course.icon,
                        iconLibrary: course.iconLibrary,
                        matchPercentage: item.score,
                        reasoning: item.reasoning,
                        isTopRecommended: i === 0
                    });
                }
            }
            if (predictions.length === 0) {
                throw new Error(`No branch predictions matched DB records. Raw AI Items: ${JSON.stringify(items)}`);
            }
            return predictions;
        }
        catch (error) {
            console.error("Branch Prediction Error:", JSON.stringify(error, null, 2));
            throw new Error(`Failed to generate branch predictions: ${error.message}`);
        }
    }
}
export const predictionService = new PredictionService();
