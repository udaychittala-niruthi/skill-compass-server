import app from "./src/app.js";
import dotenv from "dotenv";
import { postgresConnection } from "./src/config/db.js";
import { createServer } from "http";
import { websocketService } from "./src/services/websocket.service.js";
import { setupGraphQL } from "./src/graphql/server.js";

dotenv.config();

const port = process.env.PORT || 5001;

async function startServer() {
    await postgresConnection();

    // Create HTTP server
    const httpServer = createServer(app);

    // Initialize WebSocket
    websocketService.initialize(httpServer);

    // Initialize GraphQL (Admin Only)
    await setupGraphQL(app);

    httpServer
        .listen(port, () => {
            console.log(`🚀 Server is running on port ${port}`);
            console.log(`🔌 WebSocket server initialized`);
        })
        .on("error", (error) => {
            console.error("❌ Failed to start the Server: ", error);
        });

    const shutdown = async () => {
        console.log("\n🛑 Gracefully shutting down...");
        try {
            const sequelize = (await import("./src/config/db.js")).default;
            await sequelize.close();
            console.log("🔌 Neon connection pool closed.");
            process.exit(0);
        } catch (error) {
            console.error("❌ Error during shutdown:", error);
            process.exit(1);
        }
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
}
startServer();
