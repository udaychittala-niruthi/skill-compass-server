import sequelize from "../config/db.js";
import { QueryInterface, DataTypes } from "sequelize";

/**
 * Migration to add icon and iconLibrary columns to courses table
 */
export async function up() {
    const queryInterface: QueryInterface = sequelize.getQueryInterface();

    console.log("Running migration: add icon columns to courses...");

    // Add columns to courses table
    try {
        await queryInterface.addColumn("courses", "icon", {
            type: DataTypes.STRING,
            allowNull: true
        });
        console.log("✅ Added icon column to courses");
    } catch (error: any) {
        if (error.message.includes("already exists")) {
            console.log("⚠️  icon column already exists in courses");
        } else {
            throw error;
        }
    }

    try {
        await queryInterface.addColumn("courses", "iconLibrary", {
            type: DataTypes.STRING,
            allowNull: true
        });
        console.log("✅ Added iconLibrary column to courses");
    } catch (error: any) {
        if (error.message.includes("already exists")) {
            console.log("⚠️  iconLibrary column already exists in courses");
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

    console.log("Rolling back migration: remove icon columns from courses...");

    // Remove columns from courses
    await queryInterface.removeColumn("courses", "icon");
    await queryInterface.removeColumn("courses", "iconLibrary");

    console.log("✅ Rollback completed!");
}
