import sequelize from "../config/db";
import { QueryInterface, DataTypes } from "sequelize";

/**
 * Migration to add icon and iconLibrary columns to skills and interests tables
 */
export async function up() {
    const queryInterface: QueryInterface = sequelize.getQueryInterface();

    console.log("Running migration: add icon columns to skills and interests...");

    // Add columns to skills table
    try {
        await queryInterface.addColumn("skills", "icon", {
            type: DataTypes.STRING,
            allowNull: true
        });
        console.log("✅ Added icon column to skills");
    } catch (error: any) {
        if (error.message.includes("already exists")) {
            console.log("⚠️  icon column already exists in skills");
        } else {
            throw error;
        }
    }

    try {
        await queryInterface.addColumn("skills", "iconLibrary", {
            type: DataTypes.STRING,
            allowNull: true
        });
        console.log("✅ Added iconLibrary column to skills");
    } catch (error: any) {
        if (error.message.includes("already exists")) {
            console.log("⚠️  iconLibrary column already exists in skills");
        } else {
            throw error;
        }
    }

    // Add columns to interests table
    try {
        await queryInterface.addColumn("interests", "icon", {
            type: DataTypes.STRING,
            allowNull: true
        });
        console.log("✅ Added icon column to interests");
    } catch (error: any) {
        if (error.message.includes("already exists")) {
            console.log("⚠️  icon column already exists in interests");
        } else {
            throw error;
        }
    }

    try {
        await queryInterface.addColumn("interests", "iconLibrary", {
            type: DataTypes.STRING,
            allowNull: true
        });
        console.log("✅ Added iconLibrary column to interests");
    } catch (error: any) {
        if (error.message.includes("already exists")) {
            console.log("⚠️  iconLibrary column already exists in interests");
        } else {
            throw error;
        }
    }

    console.log("✅ Migration completed successfully!");
}

/**
 * Rollback migration
 */
export async function down() {
    const queryInterface: QueryInterface = sequelize.getQueryInterface();

    console.log("Rolling back migration: remove icon columns...");

    // Remove columns from skills
    await queryInterface.removeColumn("skills", "icon");
    await queryInterface.removeColumn("skills", "iconLibrary");

    // Remove columns from interests
    await queryInterface.removeColumn("interests", "icon");
    await queryInterface.removeColumn("interests", "iconLibrary");

    console.log("✅ Rollback completed!");
}

// Run migration if called directly
if (require.main === module) {
    up()
        .then(() => {
            console.log("Migration complete");
            process.exit(0);
        })
        .catch((error) => {
            console.error("Migration failed:", error);
            process.exit(1);
        });
}
