import { postgresConnection } from "../config/db";
import { sequelize } from "../models";
import InterestSeeder from "./intrests.seeder";
import SkillSeeder from "./skill.seeder";
import CourseSeeder from "./courses.seeder";
import BranchesSeeder from "./branches.seeder";
import { EducationalResourcesSeeder } from "./educationalResources.seeder";

const educationalResourcesSeeder = new EducationalResourcesSeeder();

const seeders = [
    { name: "Interest", run: InterestSeeder },
    { name: "Skill", run: SkillSeeder },
    { name: "Course", run: CourseSeeder },
    { name: "Branches", run: BranchesSeeder },
    { name: "EducationalResources", run: (seq: any, trans?: any) => educationalResourcesSeeder.seed(seq, trans) }
];

async function seedAll() {
    console.log("🚀 Seeding process started...");
    const isRollbackMode = process.argv.includes("--rollback");

    if (isRollbackMode) {
        console.log("⚠️ ROLLBACK MODE ENABLED: Changes will be reverted at the end.");
    }

    try {
        // Initialize Database Connection
        await postgresConnection();
        console.log("📦 Database connected and synced.");
        console.log("-----------------------------------------");

        await sequelize.transaction(async (transaction) => {
            for (const seeder of seeders) {
                console.log(`⏳ Seeding ${seeder.name}...`);
                await seeder.run(sequelize, transaction);
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
