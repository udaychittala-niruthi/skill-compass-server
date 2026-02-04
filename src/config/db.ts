import "dotenv/config";
import { Sequelize } from "sequelize";

const sequelize = new Sequelize(process.env.DATABASE_URL as string, {
  dialect: "postgres",
  logging: false,
});

export async function postgresConnection() {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgresSQL Connected successfully");
    await sequelize.sync(); // Sync models with database
    return sequelize;
  } catch (error) {
    console.error("❌ PostgresSQL Connection failed:", error);
    process.exit(1);
  }
}

export default sequelize;
