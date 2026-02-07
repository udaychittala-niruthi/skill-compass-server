import sequelize from "../config/db";
import { QueryInterface, DataTypes } from "sequelize";

export async function up() {
    const queryInterface: QueryInterface = sequelize.getQueryInterface();
    console.log("Running migration: make age and group nullable...");

    try {
        await queryInterface.changeColumn("users", "age", {
            type: DataTypes.INTEGER,
            allowNull: true
        });
        console.log("✅ Made age column nullable in users");
    } catch (error: any) {
        console.error("⚠️ Failed to change age column:", error.message);
        throw error;
    }

    try {
        await queryInterface.changeColumn("users", "group", {
            type: DataTypes.ENUM("KIDS", "TEENS", "COLLEGE_STUDENTS", "PROFESSIONALS", "SENIORS"),
            allowNull: true
        });
        console.log("✅ Made group column nullable in users");
    } catch (error: any) {
        console.error("⚠️ Failed to change group column:", error.message);
        throw error;
    }

    console.log("✅ Migration completed successfully!");
}

export async function down() {
    const queryInterface: QueryInterface = sequelize.getQueryInterface();
    console.log("Rolling back migration: make age and group NOT nullable...");

    // Warning: This might fail if data exists with null values
    await queryInterface.changeColumn("users", "age", {
        type: DataTypes.INTEGER,
        allowNull: false
    });

    await queryInterface.changeColumn("users", "group", {
        type: DataTypes.ENUM("KIDS", "TEENS", "COLLEGE_STUDENTS", "PROFESSIONALS", "SENIORS"),
        allowNull: false
    });
    console.log("✅ Rollback completed!");
}

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
