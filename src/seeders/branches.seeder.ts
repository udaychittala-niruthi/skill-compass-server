import { Course, Branches, Op } from "../models/index.js";
import { getJsonCompletion } from "../services/groq.js";

interface BranchData {
    name: string;
    shortName: string;
}

interface BranchesResponse {
    branches: BranchData[];
}

const BranchesSeeder = async (_sequelize: any, transaction?: any) => {
    try {
        console.log("🌱 Seeding Branches...");

        const courses = await Course.findAll({ transaction });

        console.log(`Found ${courses.length} courses needing branches.`);

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
                    const generatedBranchNames = response.branches.map((b) => b.name);

                    // 1. Delete stale branches for this course
                    const deletedCount = await Branches.destroy({
                        where: {
                            courseId: course.id,
                            name: {
                                [Op.notIn]: generatedBranchNames
                            }
                        },
                        transaction
                    });

                    if (deletedCount > 0) {
                        console.log(`🗑️ Deleted ${deletedCount} stale branches for ${course.name}`);
                    }

                    // 2. Upsert generated branches
                    let updatedCount = 0;
                    let createdCount = 0;

                    for (const branchData of response.branches) {
                        const [branch, wasCreated] = await Branches.findOrCreate({
                            where: {
                                courseId: course.id,
                                name: branchData.name
                            },
                            defaults: {
                                ...branchData,
                                courseId: course.id
                            },
                            transaction
                        });

                        if (wasCreated) {
                            createdCount++;
                        } else {
                            branch.shortName = branchData.shortName;
                            await branch.save({ transaction });
                            updatedCount++;
                        }
                    }

                    console.log(
                        `✅ ${course.name}: Created ${createdCount}, Updated ${updatedCount}, Removed ${deletedCount}`
                    );
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
