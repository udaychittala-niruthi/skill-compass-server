import sequelize from "../config/db";
import { QueryInterface, DataTypes } from "sequelize";

/**
 * Migration: Enhanced Learning Structure
 * Phase 1: Database Layer
 */
export async function up() {
    const queryInterface: QueryInterface = sequelize.getQueryInterface();

    console.log("🚀 Starting migration: Enhanced Learning Structure (Phase 1)...");

    // 1. ADD COLUMNS TO LEARNING_PATHS
    console.log("--- Updating learning_paths table ---");
    const lpColumns = {
        personalizedReason: { type: DataTypes.TEXT, allowNull: true },
        totalEstimatedHours: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
        currentModuleId: { type: DataTypes.INTEGER, allowNull: true },
        currentTaskId: { type: DataTypes.INTEGER, allowNull: true },
        completionPercentage: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 }
    };

    for (const [col, spec] of Object.entries(lpColumns)) {
        try {
            await queryInterface.addColumn("learning_paths", col, spec);
            console.log(`✅ Added ${col} to learning_paths`);
        } catch (error: any) {
            console.log(`⚠️  ${col} in learning_paths: ${error.message}`);
        }
    }

    // 2. ADD COLUMNS TO LEARNING_MODULES
    console.log("--- Updating learning_modules table ---");
    const lmColumns = {
        whyLearnThis: { type: DataTypes.TEXT, allowNull: true },
        realWorldApplications: { type: DataTypes.JSONB, defaultValue: {} },
        unlocks: { type: DataTypes.JSONB, defaultValue: {} },
        status: {
            type: DataTypes.ENUM("locked", "available", "in_progress", "completed"),
            defaultValue: "locked"
        }
    };

    for (const [col, spec] of Object.entries(lmColumns)) {
        try {
            await queryInterface.addColumn("learning_modules", col, spec);
            console.log(`✅ Added ${col} to learning_modules`);
        } catch (error: any) {
            console.log(`⚠️  ${col} in learning_modules: ${error.message}`);
        }
    }

    // 3. CREATE LESSONS TABLE
    console.log("--- Creating lessons table ---");
    try {
        await queryInterface.createTable("lessons", {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            moduleId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "learning_modules", key: "id" },
                onDelete: "CASCADE"
            },
            title: { type: DataTypes.STRING, allowNull: false },
            objective: { type: DataTypes.TEXT, allowNull: true },
            keyTakeaways: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
            contentType: {
                type: DataTypes.ENUM("video", "article", "interactive", "quiz"),
                allowNull: false
            },
            contentUrl: { type: DataTypes.STRING(500), allowNull: true },
            estimatedMinutes: { type: DataTypes.INTEGER, defaultValue: 15 },
            orderInModule: { type: DataTypes.INTEGER, allowNull: false },
            whyLearnThis: { type: DataTypes.TEXT, allowNull: true },
            prerequisites: { type: DataTypes.ARRAY(DataTypes.INTEGER), defaultValue: [] },
            status: {
                type: DataTypes.ENUM("locked", "available", "in_progress", "completed"),
                defaultValue: "locked"
            },
            createdAt: { type: DataTypes.DATE, allowNull: false },
            updatedAt: { type: DataTypes.DATE, allowNull: false }
        });
        console.log("✅ Created lessons table");
    } catch (error: any) {
        console.log(`⚠️  lessons table: ${error.message}`);
    }

    // 4. CREATE TASKS TABLE
    console.log("--- Creating tasks table ---");
    try {
        await queryInterface.createTable("tasks", {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            lessonId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "lessons", key: "id" },
                onDelete: "CASCADE"
            },
            title: { type: DataTypes.STRING, allowNull: false },
            type: {
                type: DataTypes.ENUM("reading", "coding", "quiz", "project", "discussion", "reflection"),
                allowNull: false
            },
            instructions: { type: DataTypes.JSONB, defaultValue: {} },
            purpose: { type: DataTypes.TEXT, allowNull: true },
            completionCriteria: { type: DataTypes.JSONB, defaultValue: {} },
            difficultyLevel: { type: DataTypes.INTEGER, defaultValue: 1 },
            estimatedMinutes: { type: DataTypes.INTEGER, defaultValue: 5 },
            orderInLesson: { type: DataTypes.INTEGER, allowNull: false },
            isRequired: { type: DataTypes.BOOLEAN, defaultValue: true },
            points: { type: DataTypes.INTEGER, defaultValue: 10 },
            createdAt: { type: DataTypes.DATE, allowNull: false },
            updatedAt: { type: DataTypes.DATE, allowNull: false }
        });
        console.log("✅ Created tasks table");
    } catch (error: any) {
        console.log(`⚠️  tasks table: ${error.message}`);
    }

    // 5. CREATE RESOURCES TABLE
    console.log("--- Creating resources table ---");
    try {
        await queryInterface.createTable("resources", {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            lessonId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: { model: "lessons", key: "id" },
                onDelete: "CASCADE"
            },
            moduleId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: { model: "learning_modules", key: "id" },
                onDelete: "CASCADE"
            },
            type: {
                type: DataTypes.ENUM("video", "article", "pdf", "interactive", "documentation"),
                allowNull: false
            },
            title: { type: DataTypes.STRING, allowNull: false },
            url: { type: DataTypes.STRING(500), allowNull: false },
            description: { type: DataTypes.TEXT, allowNull: true },
            isPrimary: { type: DataTypes.BOOLEAN, defaultValue: false },
            estimatedTime: { type: DataTypes.INTEGER, defaultValue: 10 },
            provider: { type: DataTypes.STRING, allowNull: true },
            createdAt: { type: DataTypes.DATE, allowNull: false },
            updatedAt: { type: DataTypes.DATE, allowNull: false }
        });
        console.log("✅ Created resources table");
    } catch (error: any) {
        console.log(`⚠️  resources table: ${error.message}`);
    }

    // 6. CREATE USER_PROGRESS TABLE
    console.log("--- Creating user_progress table ---");
    try {
        await queryInterface.createTable("user_progress", {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "users", key: "id" },
                onDelete: "CASCADE"
            },
            pathId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: { model: "learning_paths", key: "id" },
                onDelete: "SET NULL"
            },
            moduleId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: { model: "learning_modules", key: "id" },
                onDelete: "SET NULL"
            },
            lessonId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: { model: "lessons", key: "id" },
                onDelete: "SET NULL"
            },
            taskId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: { model: "tasks", key: "id" },
                onDelete: "SET NULL"
            },
            status: {
                type: DataTypes.ENUM("not_started", "in_progress", "completed", "skipped"),
                defaultValue: "not_started"
            },
            timeSpentMinutes: { type: DataTypes.INTEGER, defaultValue: 0 },
            score: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
            completedAt: { type: DataTypes.DATE, allowNull: true },
            bookmarked: { type: DataTypes.BOOLEAN, defaultValue: false },
            notes: { type: DataTypes.TEXT, allowNull: true },
            createdAt: { type: DataTypes.DATE, allowNull: false },
            updatedAt: { type: DataTypes.DATE, allowNull: false }
        });

        await queryInterface.addIndex("user_progress", ["userId", "pathId"]);
        await queryInterface.addIndex("user_progress", ["userId", "moduleId"]);
        await queryInterface.addIndex("user_progress", ["userId", "lessonId"]);
        await queryInterface.addIndex("user_progress", ["userId", "taskId"]);

        console.log("✅ Created user_progress table with indexes");
    } catch (error: any) {
        console.log(`⚠️  user_progress table: ${error.message}`);
    }

    // 7. CREATE TASK_SUBMISSIONS TABLE
    console.log("--- Creating task_submissions table ---");
    try {
        await queryInterface.createTable("task_submissions", {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            taskId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "tasks", key: "id" },
                onDelete: "CASCADE"
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "users", key: "id" },
                onDelete: "CASCADE"
            },
            submissionContent: { type: DataTypes.TEXT, allowNull: false },
            submissionUrl: { type: DataTypes.STRING(500), allowNull: true },
            submittedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            feedback: { type: DataTypes.TEXT, allowNull: true },
            score: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
            status: {
                type: DataTypes.ENUM("submitted", "reviewed", "approved", "needs_revision"),
                defaultValue: "submitted"
            },
            createdAt: { type: DataTypes.DATE, allowNull: false },
            updatedAt: { type: DataTypes.DATE, allowNull: false }
        });
        console.log("✅ Created task_submissions table");
    } catch (error: any) {
        console.log(`⚠️  task_submissions table: ${error.message}`);
    }

    // 8. CREATE LEARNING_ANALYTICS TABLE
    console.log("--- Creating learning_analytics table ---");
    try {
        await queryInterface.createTable("learning_analytics", {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "users", key: "id" },
                onDelete: "CASCADE"
            },
            date: { type: DataTypes.DATEONLY, allowNull: false },
            totalTimeMinutes: { type: DataTypes.INTEGER, defaultValue: 0 },
            tasksCompleted: { type: DataTypes.INTEGER, defaultValue: 0 },
            lessonsCompleted: { type: DataTypes.INTEGER, defaultValue: 0 },
            modulesCompleted: { type: DataTypes.INTEGER, defaultValue: 0 },
            averageScore: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
            streakDays: { type: DataTypes.INTEGER, defaultValue: 0 },
            xpEarned: { type: DataTypes.INTEGER, defaultValue: 0 },
            createdAt: { type: DataTypes.DATE, allowNull: false },
            updatedAt: { type: DataTypes.DATE, allowNull: false }
        });

        await queryInterface.addIndex("learning_analytics", ["userId", "date"], { unique: true });
        console.log("✅ Created learning_analytics table");
    } catch (error: any) {
        console.log(`⚠️  learning_analytics table: ${error.message}`);
    }

    // 9. CREATE ACHIEVEMENTS TABLE
    console.log("--- Creating achievements table ---");
    try {
        await queryInterface.createTable("achievements", {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            name: { type: DataTypes.STRING, allowNull: false },
            description: { type: DataTypes.TEXT, allowNull: false },
            iconUrl: { type: DataTypes.STRING(500), allowNull: true },
            category: {
                type: DataTypes.ENUM("streak", "completion", "mastery", "social", "milestone"),
                allowNull: false
            },
            criteria: { type: DataTypes.JSONB, defaultValue: {} },
            points: { type: DataTypes.INTEGER, defaultValue: 50 },
            rarity: {
                type: DataTypes.ENUM("common", "rare", "epic", "legendary"),
                defaultValue: "common"
            },
            createdAt: { type: DataTypes.DATE, allowNull: false },
            updatedAt: { type: DataTypes.DATE, allowNull: false }
        });
        console.log("✅ Created achievements table");
    } catch (error: any) {
        console.log(`⚠️  achievements table: ${error.message}`);
    }

    // 10. CREATE USER_ACHIEVEMENTS TABLE
    console.log("--- Creating user_achievements table ---");
    try {
        await queryInterface.createTable("user_achievements", {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "users", key: "id" },
                onDelete: "CASCADE"
            },
            achievementId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "achievements", key: "id" },
                onDelete: "CASCADE"
            },
            earnedAt: { type: DataTypes.DATE, allowNull: true },
            progress: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
            createdAt: { type: DataTypes.DATE, allowNull: false },
            updatedAt: { type: DataTypes.DATE, allowNull: false }
        });

        await queryInterface.addIndex("user_achievements", ["userId", "achievementId"], { unique: true });
        console.log("✅ Created user_achievements table");
    } catch (error: any) {
        console.log(`⚠️  user_achievements table: ${error.message}`);
    }

    console.log("✨ Migration completed successfully!");
}

/**
 * Rollback
 */
export async function down() {
    const queryInterface: QueryInterface = sequelize.getQueryInterface();

    console.log("⏪ Rolling back migration: Enhanced Learning Structure...");

    const tables = [
        "user_achievements",
        "achievements",
        "learning_analytics",
        "task_submissions",
        "user_progress",
        "resources",
        "tasks",
        "lessons"
    ];

    for (const table of tables) {
        try {
            await queryInterface.dropTable(table);
            console.log(`✅ Dropped ${table} table`);
        } catch (error: any) {
            console.log(`⚠️  Could not drop ${table}: ${error.message}`);
        }
    }

    // Remove columns
    const lpCols = [
        "personalizedReason",
        "totalEstimatedHours",
        "currentModuleId",
        "currentTaskId",
        "completionPercentage"
    ];
    for (const col of lpCols) {
        try {
            await queryInterface.removeColumn("learning_paths", col);
        } catch (err) {
            // Column might not exist
        }
    }

    const lmCols = ["whyLearnThis", "realWorldApplications", "unlocks", "status"];
    for (const col of lmCols) {
        try {
            await queryInterface.removeColumn("learning_modules", col);
        } catch (err) {
            // Column might not exist
        }
    }

    console.log("✅ Rollback completed!");
}

import { fileURLToPath } from "url";
if (process.argv[1] === fileURLToPath(import.meta.url)) {
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
