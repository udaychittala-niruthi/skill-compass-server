import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";
/**
 * Migration to add learning path generation tracking fields
 */
export async function up() {
    const queryInterface = sequelize.getQueryInterface();
    console.log("Running migration: add learning path generation fields...");
    // Add columns to learning_paths table
    try {
        await queryInterface.addColumn("learning_paths", "status", {
            type: DataTypes.ENUM("generating", "completed", "failed"),
            defaultValue: "generating",
            allowNull: false
        });
        console.log("✅ Added status column to learning_paths");
    }
    catch (error) {
        if (error.message.includes("already exists")) {
            console.log("⚠️  status column already exists");
        }
        else {
            throw error;
        }
    }
    try {
        await queryInterface.addColumn("learning_paths", "generationError", {
            type: DataTypes.TEXT,
            allowNull: true
        });
        console.log("✅ Added generationError column to learning_paths");
    }
    catch (error) {
        if (error.message.includes("already exists")) {
            console.log("⚠️  generationError column already exists");
        }
        else {
            throw error;
        }
    }
    try {
        await queryInterface.addColumn("learning_paths", "generatedAt", {
            type: DataTypes.DATE,
            allowNull: true
        });
        console.log("✅ Added generatedAt column to learning_paths");
    }
    catch (error) {
        if (error.message.includes("already exists")) {
            console.log("⚠️  generatedAt column already exists");
        }
        else {
            throw error;
        }
    }
    // Make path column nullable
    try {
        await queryInterface.changeColumn("learning_paths", "path", {
            type: DataTypes.JSONB,
            allowNull: true
        });
        console.log("✅ Made path column nullable in learning_paths");
    }
    catch (error) {
        console.log("⚠️  Could not change path column:", error.message);
    }
    // Add timestamps if they don't exist
    try {
        await queryInterface.addColumn("learning_paths", "createdAt", {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        });
        console.log("✅ Added createdAt column to learning_paths");
    }
    catch (error) {
        if (error.message.includes("already exists")) {
            console.log("⚠️  createdAt column already exists");
        }
        else {
            throw error;
        }
    }
    try {
        await queryInterface.addColumn("learning_paths", "updatedAt", {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        });
        console.log("✅ Added updatedAt column to learning_paths");
    }
    catch (error) {
        if (error.message.includes("already exists")) {
            console.log("⚠️  updatedAt column already exists");
        }
        else {
            throw error;
        }
    }
    // Add columns to learning_modules table
    try {
        await queryInterface.addColumn("learning_modules", "learningPathId", {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "learning_paths",
                key: "id"
            }
        });
        console.log("✅ Added learningPathId column to learning_modules");
    }
    catch (error) {
        if (error.message.includes("already exists")) {
            console.log("⚠️  learningPathId column already exists");
        }
        else {
            throw error;
        }
    }
    try {
        await queryInterface.addColumn("learning_modules", "orderInPath", {
            type: DataTypes.INTEGER,
            allowNull: true
        });
        console.log("✅ Added orderInPath column to learning_modules");
    }
    catch (error) {
        if (error.message.includes("already exists")) {
            console.log("⚠️  orderInPath column already exists");
        }
        else {
            throw error;
        }
    }
    try {
        await queryInterface.addColumn("learning_modules", "isAiGenerated", {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        });
        console.log("✅ Added isAiGenerated column to learning_modules");
    }
    catch (error) {
        if (error.message.includes("already exists")) {
            console.log("⚠️  isAiGenerated column already exists");
        }
        else {
            throw error;
        }
    }
    try {
        await queryInterface.addColumn("learning_modules", "generationMetadata", {
            type: DataTypes.JSONB,
            defaultValue: {}
        });
        console.log("✅ Added generationMetadata column to learning_modules");
    }
    catch (error) {
        if (error.message.includes("already exists")) {
            console.log("⚠️  generationMetadata column already exists");
        }
        else {
            throw error;
        }
    }
    // Add indexes
    try {
        await queryInterface.addIndex("learning_paths", ["userId"], {
            name: "learning_paths_userId"
        });
        console.log("✅ Added userId index to learning_paths");
    }
    catch (error) {
        if (error.message.includes("already exists")) {
            console.log("⚠️  userId index already exists");
        }
        else {
            throw error;
        }
    }
    try {
        await queryInterface.addIndex("learning_paths", ["status"], {
            name: "learning_paths_status"
        });
        console.log("✅ Added status index to learning_paths");
    }
    catch (error) {
        if (error.message.includes("already exists")) {
            console.log("⚠️  status index already exists");
        }
        else {
            throw error;
        }
    }
    console.log("✅ Migration completed successfully!");
}
/**
 * Rollback migration
 */
export async function down() {
    const queryInterface = sequelize.getQueryInterface();
    console.log("Rolling back migration: remove learning path generation fields...");
    // Remove columns from learning_paths
    await queryInterface.removeColumn("learning_paths", "status");
    await queryInterface.removeColumn("learning_paths", "generationError");
    await queryInterface.removeColumn("learning_paths", "generatedAt");
    await queryInterface.removeColumn("learning_paths", "createdAt");
    await queryInterface.removeColumn("learning_paths", "updatedAt");
    // Remove columns from learning_modules
    await queryInterface.removeColumn("learning_modules", "learningPathId");
    await queryInterface.removeColumn("learning_modules", "orderInPath");
    await queryInterface.removeColumn("learning_modules", "isAiGenerated");
    await queryInterface.removeColumn("learning_modules", "generationMetadata");
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
