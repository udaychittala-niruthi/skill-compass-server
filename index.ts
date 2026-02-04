import app from "./src/app.js";
import dotenv from "dotenv";
import { postgresConnection } from "./src/config/db.js";

dotenv.config();

const port = process.env.PORT || 5001;

async function startServer() {
    await postgresConnection();

    app
        .listen(port, () => {
            console.log(`🚀 Server is running in port ${port}`);
        })
        .on("error", (error) => {
            console.error("❌ Failed to start the Server: ", error);
        });
}
startServer()

