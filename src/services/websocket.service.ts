import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

class WebSocketService {
    private io: SocketIOServer | null = null;

    /**
     * Initialize Socket.IO server with HTTP server
     */
    initialize(httpServer: HttpServer) {
        this.io = new SocketIOServer(httpServer, {
            cors: {
                origin: process.env.FRONTEND_URL || "*",
                methods: ["GET", "POST"],
                credentials: true
            }
        });

        // Middleware for authentication
        this.io.use(async (socket, next) => {
            const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;

            if (!token) {
                return next(new Error("Authentication error: Token not provided"));
            }

            const tokenString = token.startsWith("Bearer ") ? token.split(" ")[1] : token;

            jwt.verify(tokenString, process.env.JWT_SECRET || "my_jwt_scret", async (err: any, decoded: any) => {
                if (err) {
                    return next(new Error("Authentication error: Invalid token"));
                }

                try {
                    const user = await User.findByPk(decoded.id);
                    if (!user) {
                        return next(new Error("Authentication error: User not found"));
                    }

                    // Attach user to socket data
                    socket.data.user = user.toJSON();
                    next();
                } catch (dbError) {
                    console.error("Socket Auth DB Error:", dbError);
                    next(new Error("Internal server error"));
                }
            });
        });

        this.io.on("connection", (socket: Socket) => {
            console.log(`WebSocket client connected: ${socket.id}`);

            // Join user-specific room based on userId from authenticated user
            const user = socket.data.user;
            if (user && user.id) {
                const room = this.getUserRoom(user.id);
                socket.join(room);
                console.log(`User ${user.id} joined room: ${room}`);
            }

            socket.on("disconnect", () => {
                console.log(`WebSocket client disconnected: ${socket.id}`);
            });
        });

        console.log("WebSocket server initialized");
    }

    /**
     * Get room name for a specific user
     */
    getUserRoom(userId: number): string {
        return `user_${userId}`;
    }

    /**
     * Emit event to a specific user's room
     */
    emitToUser(userId: number, event: string, data: any) {
        if (!this.io) {
            console.error("Socket.IO not initialized");
            return;
        }

        const room = this.getUserRoom(userId);
        this.io.to(room).emit(event, data);
        console.log(`Emitted ${event} to user ${userId}:`, data);
    }

    /**
     * Emit learning path generation started event
     */
    emitGenerationStarted(userId: number, data: { learningPathId: number; message: string }) {
        this.emitToUser(userId, "learning_path:generation_started", data);
    }

    /**
     * Emit learning path generation progress event
     */
    emitGenerationProgress(userId: number, data: { learningPathId: number; progress: number; message: string }) {
        this.emitToUser(userId, "learning_path:generation_progress", data);
    }

    /**
     * Emit learning path generation completed event
     */
    emitGenerationCompleted(userId: number, data: { learningPathId: number; message: string; path: any }) {
        this.emitToUser(userId, "learning_path:generation_completed", data);
    }

    /**
     * Emit learning path generation failed event
     */
    emitGenerationFailed(userId: number, data: { learningPathId: number; error: string }) {
        this.emitToUser(userId, "learning_path:generation_failed", data);
    }

    /**
     * Get Socket.IO instance
     */
    getIO(): SocketIOServer | null {
        return this.io;
    }
}

export const websocketService = new WebSocketService();
