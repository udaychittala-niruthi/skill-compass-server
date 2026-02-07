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
    { name: "EducationalResources", run: () => educationalResourcesSeeder.seed() }
];

async function seedAll() {
    console.log("🚀 Seeding process started...");

    try {
        // Initialize Database Connection
        await postgresConnection();
        console.log("📦 Database connected and synced.");
        console.log("-----------------------------------------");

        for (const seeder of seeders) {
            console.log(`⏳ Seeding ${seeder.name}...`);
            await seeder.run(sequelize);
            console.log("-----------------------------------------");
        }

        console.log("🎉 Seeding process completed successfully!");
        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed with error:");
        console.error(error);
        await sequelize.close();
        process.exit(1);
    }
}

seedAll();
