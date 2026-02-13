import { postgresConnection } from "../config/db.js";
import { sequelize } from "../models/index.js";
import InterestSeeder from "./intrests.seeder.js";
import SkillSeeder from "./skill.seeder.js";
import CourseSeeder from "./courses.seeder.js";
import BranchesSeeder from "./branches.seeder.js";
import { EducationalResourcesSeeder } from "./educationalResources.seeder.js";
import KidDrawingImagesSeeder from "./kidDrawingImages.seeder.js";

const educationalResourcesSeeder = new EducationalResourcesSeeder();

const seeders = [
    { name: "Interest", run: InterestSeeder },
    { name: "Skill", run: SkillSeeder },
    { name: "Course", run: CourseSeeder },
    { name: "Branches", run: BranchesSeeder },
    { name: "EducationalResources", run: (seq: any, trans?: any) => educationalResourcesSeeder.seed(seq, trans) },
    { name: "KidDrawingImages", run: (seq: any, trans?: any) => KidDrawingImagesSeeder.run(seq, trans) }
];

async function seedAll() {
    console.log("🚀 Seeding process started...");
    const args = process.argv.slice(2);
    const isRollbackMode = args.includes("--rollback");
    const isUpdateMode = args.includes("--update");

    if (isRollbackMode) {
        console.log("⚠️ ROLLBACK MODE ENABLED: Changes will be reverted at the end.");
    }

    if (isUpdateMode) {
        console.log("🔄 UPDATE MODE ENABLED: Existing records (Courses, Branches) may be updated.");
    } else {
        console.log("ℹ️  SAFE MODE: Existing records will be skipped. Use --update to force updates.");
    }

    try {
        // Initialize Database Connection
        await postgresConnection();
        console.log("📦 Database connected and synced.");
        console.log("-----------------------------------------");

        await sequelize.transaction(async (transaction) => {
            for (const seeder of seeders) {
                console.log(`⏳ Seeding ${seeder.name}...`);
                // Pass options to run method if it accepts them
                if (seeder.name === "Course" || seeder.name === "Branches") {
                    await (seeder.run as any)(sequelize, transaction, { forceUpdate: isUpdateMode });
                } else {
                    await seeder.run(sequelize, transaction);
                }
                console.log("-----------------------------------------");
            }

            if (isRollbackMode) {
                throw new Error("ROLLBACK_REQUESTED");
            }
        });

        console.log("🎉 Seeding process completed successfully!");
        await sequelize.close();
        process.exit(0);
    } catch (error: any) {
        if (error.message === "ROLLBACK_REQUESTED") {
            console.log("✅ Rollback successful. No changes were saved to the database.");
            await sequelize.close();
            process.exit(0);
        } else {
            console.error("❌ Seeding failed with error:");
            console.error(error);
            await sequelize.close();
            process.exit(1);
        }
    }
}

seedAll();
