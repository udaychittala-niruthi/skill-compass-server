import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import express from "express";
import { schema } from "./index.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { sendResponse } from "../utils/customResponse.js";
export async function setupGraphQL(app) {
    const server = new ApolloServer({
        schema
    });
    await server.start();
    const requireAdmin = (req, res, next) => {
        // authenticate middleware must run before this to populate req.user
        const user = req.user;
        if (!user || user.role !== "ADMIN") {
            return sendResponse(res, false, "Forbidden: Admin access only", 403);
        }
        next();
    };
    app.use("/graphql", cors(), express.json(), 
    // Apply authentication middleware
    authenticate, 
    // Apply admin check
    requireAdmin, expressMiddleware(server, {
        context: async ({ req }) => ({ user: req.user })
    }));
    console.log("🚀 GraphQL server initialized at /graphql (Admin Only)");
}
