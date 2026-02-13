import sequelize from "../config/db.js";
import { QueryInterface, DataTypes } from "sequelize";

/**
 * Migration to create the kid_drawing_images table
 */
export async function up() {
    const queryInterface: QueryInterface = sequelize.getQueryInterface();

    console.log("Running migration: create kid_drawing_images table...");

    try {
        await queryInterface.createTable("kid_drawing_images", {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            url: {
                type: DataTypes.STRING(1024),
                allowNull: false
            },
            type: {
                type: DataTypes.ENUM("svg", "png"),
                allowNull: false,
                defaultValue: "svg"
            },
            category: {
                type: DataTypes.STRING(100),
                allowNull: true
            },
            isValid: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            },
            lastChecked: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            }
        });
        console.log("✅ Created kid_drawing_images table");
    } catch (error: any) {
        if (error.message.includes("already exists")) {
            console.log("⚠️  kid_drawing_images table already exists");
        } else {
            throw error;
        }
    }
}

/**
 * Rollback migration
 */
export async function down() {
    const queryInterface: QueryInterface = sequelize.getQueryInterface();
    console.log("Rolling back migration: drop kid_drawing_images table...");
    try {
        await queryInterface.dropTable("kid_drawing_images");
        console.log("✅ Rollback completed!");
    } catch (error: any) {
        console.error("❌ Rollback failed:", error.message);
    }
}
