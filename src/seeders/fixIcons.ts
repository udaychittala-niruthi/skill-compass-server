import { postgresConnection } from "../config/db.js";
import { sequelize } from "../models/index.js";
import IconValidatorSeeder from "./iconValidator.seeder.js";

/**
 * Standalone script to validate and fix icons in the database.
 * Run with: npx tsx src/seeders/fixIcons.ts
 * Add --rollback to preview changes without saving.
 */
async function fixIcons() {
    console.log("🔧 Icon Fix Tool Started...");
    const isRollbackMode = process.argv.includes("--rollback");

    if (isRollbackMode) {
        console.log("⚠️ ROLLBACK MODE: Changes will be reverted at the end (preview only).");
    }

    try {
        await postgresConnection();
        console.log("📦 Database connected.");
        console.log("-----------------------------------------");

        await sequelize.transaction(async (transaction) => {
            await IconValidatorSeeder(sequelize, transaction);

            if (isRollbackMode) {
                throw new Error("ROLLBACK_REQUESTED");
            }
        });

        console.log("🎉 Icon fix completed successfully!");
        await sequelize.close();
        process.exit(0);
    } catch (error: any) {
        if (error.message === "ROLLBACK_REQUESTED") {
            console.log("✅ Preview complete. No changes were saved.");
            await sequelize.close();
            process.exit(0);
        } else {
            console.error("❌ Icon fix failed:");
            console.error(error);
            await sequelize.close();
            process.exit(1);
        }
    }
}

fixIcons();
