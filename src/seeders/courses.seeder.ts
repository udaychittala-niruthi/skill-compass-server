import { aiGenerateService, SyncCourseInput } from "../services/aiGenerate.service";
import { Course, Op } from "../models/index.js";

const courses: Record<string, string> = {
    BE: "TECH",
    BTech: "TECH",
    MTech: "TECH",
    BCA: "TECH",
    MCA: "TECH",
    Biotechnology: "TECH",

    BCom: "COMMERCE",
    BAF: "COMMERCE",
    BBA: "COMMERCE",
    BMS: "COMMERCE",
    "Bachelor of Management Studies": "COMMERCE",
    MBA: "COMMERCE",
    PGDM: "COMMERCE",
    TYBCom: "COMMERCE",
    MCom: "COMMERCE",
    "Chartered Accountancy": "COMMERCE",

    Arts: "ARTS",
    BA: "ARTS",
    MA: "ARTS",
    "Bachelor of Journalism": "ARTS",
    "Master of Journalism": "ARTS",
    Journalism: "ARTS",
    BAC: "ARTS",
    BALLB: "ARTS",
    "Law Hons": "ARTS",
    Economics: "ARTS",
    "Commercial Art Visual Art": "ARTS",

    BPharm: "MEDICAL",
    BPharmacy: "MEDICAL",
    "Diploma in Pharmacy": "MEDICAL",
    MDCS: "MEDICAL",
    Doctor: "MEDICAL",
    "GNM Nursing": "MEDICAL",
    Pharmacy: "MEDICAL",

    "Agri Diploma": "DIPLOMA",
    Diploma: "DIPLOMA",
    DEd: "DIPLOMA",
    DME: "DIPLOMA",
    BHMCT: "DIPLOMA",
    HH: "DIPLOMA",
    PooSc: "DIPLOMA",
    Degree: "DIPLOMA"
};

const CourseSeeder = async (_sequelize: any, transaction?: any) => {
    console.log("Syncing Courses via AI Generate Service...");

    try {
        const inputCourseNames = Object.keys(courses);

        // 1. Delete courses that are not in the predefined list
        const deletedCount = await Course.destroy({
            where: {
                name: {
                    [Op.notIn]: inputCourseNames
                }
            },
            transaction
        });

        if (deletedCount > 0) {
            console.log(`🗑️ Deleted ${deletedCount} stale courses.`);
        }

        const inputCourses: SyncCourseInput[] = Object.entries(courses).map(([name, category]) => ({
            name,
            category
        }));

        const results = await aiGenerateService.enrichCourseIcons(inputCourses);
        let createdCount = 0;
        let updatedCount = 0;

        for (const item of results) {
            const [course, wasCreated] = await Course.findOrCreate({
                where: { name: item.name },
                defaults: {
                    name: item.name,
                    category: item.category,
                    icon: item.icon ?? null,
                    iconLibrary: item.iconLibrary ?? null
                },
                transaction
            });

            if (wasCreated) {
                createdCount++;
            } else {
                // Update existing record
                course.category = item.category;
                course.icon = item.icon ?? null;
                course.iconLibrary = item.iconLibrary ?? null;
                await course.save({ transaction });
                updatedCount++;
            }
        }

        console.log(
            `✅ Courses synchronization completed:
            Created: ${createdCount}
            Updated: ${updatedCount}
            Removed: ${deletedCount}
        `
        );
    } catch (error) {
        console.error("❌ Error syncing courses in seeder:", error);
        throw error;
    }
};

export default CourseSeeder;
