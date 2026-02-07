import { Course, Branches, Op } from "../models";
import { getJsonCompletion } from "../services/groq";

interface BranchData {
    name: string;
    shortName: string;
}

interface BranchesResponse {
    branches: BranchData[];
}

const BranchesSeeder = async () => {
    try {
        console.log("🌱 Seeding Branches...");

        //find all courses where branches does not have the courseids

        const coursesWithBranches = await Branches.findAll({
            attributes: ["courseId"]
        });

        const courses = await Course.findAll({
            where: {
                id: {
                    [Op.notIn]: coursesWithBranches.map((branch) => branch.courseId)
                }
            }
        });

        console.log(`Found ${courses.length} courses needing branches.`);

        if (courses.length === 0) {
            console.log("⚠️ All courses already have branches. Skipping branches seeding.");
            return;
        }

        for (const course of courses) {
            console.log(`Processing course: ${course.name} (${course.category})...`);

            const prompt = `
                I need an EXHAUSTIVE and COMPREHENSIVE list of ALL possible specializations, streams, and branches for the course "${course.name}" (${course.category}) strictly within the context of the Indian education system.
                
                Don't just list the top 5. List EVERYTHING that is offered in Indian Colleges and Universities (Private, Deemed, Government, IITs, NITs, etc.).
                
                1. **Scope**:
                   - Include core branches (e.g., Civil, Mechanical).
                   - Include clear sub-disciplines if they are treated as separate majors (e.g., "Automobile Engineering" vs "Mechanical").
                   - Include modern/emerging branches (e.g., "Artificial Intelligence and Data Science", "Robotics", "Mechatronics").
                   - Include niche branches (e.g., "Mining", "Textile", "Ceramic", "Petroleum").
                
                2. **Format**:
                   - "name": The full official name of the branch.
                   - "shortName": The common abbreviation (e.g., "CSE" for Computer Science, "ME" for Mechanical). If no standard abbreviation exists, create a sensible 2-4 letter one.

                3. **Examples for Context**:
                   - If B.Tech/BE: CSE, ECE, EEE, Mechanical, Civil, IT, Chemical, Biotech, Aeronautical, Aerospace, Agriculture, Automobile, Biomedical, Ceramics, Industrial, Marine, Metallurgical, Mining, Petroleum, Textile, Instrumentation, Mechatronics, AI&DS, Cyber Security, etc.
                   - If MBA: Marketing, Finance, HRM, Operations, IB, IT, Supply Chain, Business Analytics, Rural Management, Agri-Business, Hospital Management, etc.
                   - If B.Sc/M.Sc: Physics, Chemistry, Math, Botany, Zoology, Biotech, Microbiology, computer Science, Electronics, Statistics, Psychology, Home Science, etc.
                   - If Arts: History, Geography, Pol Science, Economics, Sociology, Psychology, English, Hindi, Philosophy, etc.
                   - If Medical/Paramedical: MBBS (General), BDS, BAMS, BHMS, Nursing, MLT, Physiotherapy, Pharmacy, etc.

                4. **Edge Cases**:
                   - If the course HAS NO branches (like just "BCA" in some contexts, though often it has specializations now), provide the main stream or common electives as branches if suitable, or at least one entry representing the general course.
                   - Do NOT return an empty list unless it is absolutely impossible to classify any streams under this course.

                Output strictly in valid JSON format with the following structure:
                {
                    "branches": [
                        { "name": "Full Branch Name", "shortName": "Abbreviation or Short Name" }
                    ]
                }
            `;

            try {
                const response = await getJsonCompletion<BranchesResponse>(prompt, {
                    temperature: 0.3, // Lower temperature for more deterministic facts
                    systemPrompt: "You are an expert in the Indian Education System. Output strictly in JSON."
                });

                if (response && response.branches && Array.isArray(response.branches)) {
                    const branchesToInsert = response.branches.map((branch) => ({
                        ...branch,
                        courseId: course.id
                    }));

                    if (branchesToInsert.length > 0) {
                        await Branches.bulkCreate(branchesToInsert, {
                            ignoreDuplicates: true // Prevent duplicate errors if re-run
                        });
                        console.log(`✅ Added ${branchesToInsert.length} branches for ${course.name}`);
                    } else {
                        console.log(`ℹ️ No branches generated for ${course.name}`);
                    }
                } else {
                    console.error(`❌ Invalid response format for course ${course.name}:`, response);
                }
            } catch (error) {
                console.error(`❌ Error generating branches for ${course.name}:`, error);
            }
        }

        console.log("✅ Branches seeding completed.");
    } catch (error) {
        console.error("❌ Error in BranchesSeeder:", error);
        throw error;
    }
};

export default BranchesSeeder;
