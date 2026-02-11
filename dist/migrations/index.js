import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function runAllMigrations() {
    console.log("🚀 Starting migration runner...");
    try {
        // Get all files in the current directory
        const files = fs
            .readdirSync(__dirname)
            .filter((file) => (file.endsWith(".ts") || file.endsWith(".js")) && file !== "index.ts" && !file.endsWith(".d.ts"))
            .sort(); // Ensure they run in order
        console.log(`Found ${files.length} migration files.`);
        for (const file of files) {
            console.log(`\n📦 Running migration: ${file}`);
            try {
                // Dynamically import the migration file
                const migrationPath = path.join(__dirname, file);
                const migration = await import(migrationPath);
                if (migration.up && typeof migration.up === "function") {
                    await migration.up();
                    console.log(`✅ ${file} completed.`);
                }
                else {
                    console.warn(`⚠️  ${file} does not export an 'up' function. Skipping.`);
                }
            }
            catch (err) {
                console.error(`❌ Error in ${file}:`, err.message);
                // Decide if we should stop or continue. Usually migrations should stop on error.
                throw err;
            }
        }
        console.log("\n🎉 All migrations executed successfully!");
        process.exit(0);
    }
    catch (error) {
        console.error("\n❌ Migration runner failed:", error);
        process.exit(1);
    }
}
runAllMigrations();
