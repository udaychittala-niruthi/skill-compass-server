import { Skill, Interest, Course } from "../models/index.js";
import { validateSeederItems } from "./utils.js";
/**
 * Icon Validator Seeder
 * This seeder scans existing Skills, Interests, and Courses in the database
 * and updates any invalid icons to valid fallback icons.
 * It does NOT generate new items - only fixes invalid icons on existing records.
 */
const IconValidatorSeeder = async (_sequelize, transaction) => {
    console.log("🔍 Validating and fixing icons in database...");
    let skillsFixed = 0;
    let interestsFixed = 0;
    let coursesFixed = 0;
    try {
        // 1. Fix Skills
        console.log("📋 Checking Skills...");
        const skills = await Skill.findAll({ transaction });
        for (const skill of skills) {
            const original = {
                name: skill.name,
                icon: skill.icon || "",
                iconLibrary: skill.iconLibrary || ""
            };
            if (!original.icon || !original.iconLibrary) {
                // Skip items without icons set
                continue;
            }
            const [validated] = validateSeederItems([original], "skill");
            if (validated.icon !== original.icon || validated.iconLibrary !== original.iconLibrary) {
                await skill.update({
                    icon: validated.icon,
                    iconLibrary: validated.iconLibrary
                }, { transaction });
                console.log(`  ✓ Fixed skill "${skill.name}": ${original.icon} (${original.iconLibrary}) → ${validated.icon} (${validated.iconLibrary})`);
                skillsFixed++;
            }
        }
        console.log(`  Skills: ${skillsFixed} fixed out of ${skills.length}`);
        // 2. Fix Interests
        console.log("📋 Checking Interests...");
        const interests = await Interest.findAll({ transaction });
        for (const interest of interests) {
            const original = {
                name: interest.name,
                icon: interest.icon || "",
                iconLibrary: interest.iconLibrary || ""
            };
            if (!original.icon || !original.iconLibrary) {
                continue;
            }
            const [validated] = validateSeederItems([original], "interest");
            if (validated.icon !== original.icon || validated.iconLibrary !== original.iconLibrary) {
                await interest.update({
                    icon: validated.icon,
                    iconLibrary: validated.iconLibrary
                }, { transaction });
                console.log(`  ✓ Fixed interest "${interest.name}": ${original.icon} (${original.iconLibrary}) → ${validated.icon} (${validated.iconLibrary})`);
                interestsFixed++;
            }
        }
        console.log(`  Interests: ${interestsFixed} fixed out of ${interests.length}`);
        // 3. Fix Courses
        console.log("📋 Checking Courses...");
        const courses = await Course.findAll({ transaction });
        for (const course of courses) {
            const original = {
                name: course.name,
                icon: course.icon || "",
                iconLibrary: course.iconLibrary || ""
            };
            if (!original.icon || !original.iconLibrary) {
                continue;
            }
            const [validated] = validateSeederItems([original], "course");
            if (validated.icon !== original.icon || validated.iconLibrary !== original.iconLibrary) {
                await course.update({
                    icon: validated.icon,
                    iconLibrary: validated.iconLibrary
                }, { transaction });
                console.log(`  ✓ Fixed course "${course.name}": ${original.icon} (${original.iconLibrary}) → ${validated.icon} (${validated.iconLibrary})`);
                coursesFixed++;
            }
        }
        console.log(`  Courses: ${coursesFixed} fixed out of ${courses.length}`);
        const totalFixed = skillsFixed + interestsFixed + coursesFixed;
        console.log(`✅ Icon validation complete. Total fixed: ${totalFixed}`);
    }
    catch (error) {
        console.error("❌ Error validating icons:", error);
        throw error;
    }
};
export default IconValidatorSeeder;
