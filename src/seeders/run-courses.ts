import { postgresConnection } from "../config/db";
import { sequelize } from "../models";
import InterestSeeder from "./intrests.seeder";
import SkillSeeder from "./skill.seeder";
import CourseSeeder from "./courses.seeder";
import BranchesSeeder from "./branches.seeder";

async function seedAll() {
    console.log("🚀 Seeding All Data...");

    try {
        await postgresConnection();
        console.log("📦 Database connected.");

        // console.log("⏳ Seeding Interest...");
        // await InterestSeeder(sequelize);

        // console.log("⏳ Seeding Skill...");
        // await SkillSeeder(sequelize);

        console.log("⏳ Seeding Course...");
        await CourseSeeder(sequelize);

        console.log("⏳ Seeding Branches...");
        await BranchesSeeder();

        console.log("🎉 Seeding completed!");
        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        await sequelize.close();
        process.exit(1);
    }
}

seedAll();
