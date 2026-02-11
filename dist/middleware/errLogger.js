import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();
// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Create logs folder if it doesn't exist
const logsDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}
const errorLogPath = path.join(logsDir, "error.log");
/**
 * Writes error log entry to file
 */
function writeErrorLog(entry) {
    const separator = "=".repeat(80);
    const logContent = `
${separator}
TIMESTAMP: ${entry.timestamp}
METHOD: ${entry.method}
URL: ${entry.url}
STATUS: ${entry.statusCode}
DURATION: ${entry.duration}
${"-".repeat(40)}
REQUEST HEADERS:
${JSON.stringify(entry.request.headers, null, 2)}
${"-".repeat(40)}
REQUEST BODY:
${JSON.stringify(entry.request.body, null, 2)}
${"-".repeat(40)}
REQUEST PARAMS:
${JSON.stringify(entry.request.params, null, 2)}
${"-".repeat(40)}
REQUEST QUERY:
${JSON.stringify(entry.request.query, null, 2)}
${"-".repeat(40)}
RESPONSE BODY:
${JSON.stringify(entry.response.body, null, 2)}
${separator}
`;
    // Write to file
    fs.appendFileSync(errorLogPath, logContent);
    // Also log to console in development
    if (process.env.NODE_ENV !== "production") {
        console.log("\n🚨 ERROR LOG 🚨");
        console.log(`[${entry.timestamp}] ${entry.method} ${entry.url} - ${entry.statusCode}`);
        console.log("Request Body:", JSON.stringify(entry.request.body, null, 2));
        console.log("Response Body:", JSON.stringify(entry.response.body, null, 2));
        console.log("-".repeat(50));
    }
}
/**
 * Global error logging middleware
 * Captures request/response details for all error responses (status >= 400)
 */
export function errorLoggerMiddleware(req, res, next) {
    const startTime = Date.now();
    // Store original json method
    const originalJson = res.json.bind(res);
    // Override json method to capture response body
    res.json = function (body) {
        const statusCode = res.statusCode;
        const duration = Date.now() - startTime;
        // Log if status code indicates an error (>= 400)
        if (statusCode >= 400) {
            const logEntry = {
                timestamp: new Date().toISOString(),
                method: req.method,
                url: req.originalUrl,
                statusCode,
                request: {
                    headers: sanitizeHeaders(req.headers),
                    body: req.body,
                    params: req.params,
                    query: req.query
                },
                response: {
                    body
                },
                duration: `${duration}ms`
            };
            writeErrorLog(logEntry);
        }
        // Call original json method
        return originalJson(body);
    };
    next();
}
/**
 * Sanitize headers to remove sensitive information
 */
function sanitizeHeaders(headers) {
    const sensitiveKeys = ["authorization", "cookie", "x-api-key"];
    const sanitized = { ...headers };
    for (const key of sensitiveKeys) {
        if (sanitized[key]) {
            sanitized[key] = "[REDACTED]";
        }
    }
    return sanitized;
}
/**
 * Global error handler middleware (for uncaught errors)
 * Place this at the end of middleware chain
 */
export function globalErrorHandler(err, req, res, _next) {
    const startTime = req.startTime || Date.now();
    const duration = Date.now() - startTime;
    const logEntry = {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl,
        statusCode: 500,
        request: {
            headers: sanitizeHeaders(req.headers),
            body: req.body,
            params: req.params,
            query: req.query
        },
        response: {
            body: {
                error: err.message,
                stack: process.env.NODE_ENV !== "production" ? err.stack : undefined
            }
        },
        duration: `${duration}ms`
    };
    writeErrorLog(logEntry);
    res.status(500).json({
        status: false,
        message: "Internal Server Error",
        err: process.env.NODE_ENV !== "production" ? err.message : undefined
    });
}
