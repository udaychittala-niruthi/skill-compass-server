import { Course, Skill, Interest } from "../models";
import { resolveCoursesAndGenerateNew } from "./utils";

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

const CourseSeeder = async (_sequelize: any) => {
    console.log("Creating Courses...");

    try {
        // 1. Fetch Context (Skills & Interests)
        const allSkills = await Skill.findAll({ attributes: ["name"] });
        const allInterests = await Interest.findAll({ attributes: ["name"] });
        const skillNames = allSkills.map((s) => s.name);
        const interestNames = allInterests.map((i) => i.name);

        // 2. Fetch existing courses
        const existingDbCourses = await Course.findAll();
        const dbCourseMap = new Map(existingDbCourses.map((c) => [c.name.toLowerCase(), c]));

        const itemsToEnrich: { name: string; category: string }[] = [];
        const knownNames: string[] = Object.keys(courses);

        // 3. Determine items from hardcoded list that need enrichment
        for (const [name, category] of Object.entries(courses)) {
            const dbCourse = dbCourseMap.get(name.toLowerCase());
            if (dbCourse) {
                if (!dbCourse.getDataValue("icon") || !dbCourse.getDataValue("iconLibrary")) {
                    itemsToEnrich.push({ name, category });
                }
            } else {
                itemsToEnrich.push({ name, category });
            }
        }

        existingDbCourses.forEach((c) => knownNames.push(c.name));

        console.log(`Found ${itemsToEnrich.length} hardcoded courses to enrich/create.`);

        // 4. Resolve and Generate
        // Generate 15 new courses based on context
        const processedCourses = await resolveCoursesAndGenerateNew(
            itemsToEnrich,
            knownNames,
            skillNames,
            interestNames,
            15
        );

        // 5. Upsert
        let created = 0;
        let updated = 0;

        for (const item of processedCourses) {
            const [course, wasCreated] = await Course.findOrCreate({
                where: { name: item.name },
                defaults: {
                    name: item.name,
                    category: item.category,
                    icon: item.icon,
                    iconLibrary: item.iconLibrary
                }
            });

            if (wasCreated) {
                created++;
            } else {
                if (
                    course.getDataValue("icon") !== item.icon ||
                    course.getDataValue("iconLibrary") !== item.iconLibrary
                ) {
                    await course.update({
                        icon: item.icon,
                        iconLibrary: item.iconLibrary
                    });
                    updated++;
                }
            }
        }

        console.log(
            `✅  Courses seeding completed. Created ${created} new, Updated ${updated} existing. Skipped ${Object.keys(courses).length - itemsToEnrich.length} up-to-date hardcoded items.`
        );
    } catch (error) {
        console.error("❌  Error seeding courses:", error);
        throw error;
    }
};

export default CourseSeeder;
