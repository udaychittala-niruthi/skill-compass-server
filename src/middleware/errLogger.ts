import morgan from "morgan";
import type { StreamOptions } from "morgan";
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

const errLogStream = fs.createWriteStream(path.join(logsDir + "../../logs/error.log"), { flags: "a" });

const errStream: StreamOptions = {
    write: (message) => {
        console.log("--- ERROR LOG ---");
        message = message.toString() + `\n ${"-".repeat(50)}\n`;
        errLogStream.write(message);
    }
};
const format = ":method :url :status :response-time ms - :res[content-length]";

export const errorLogger = morgan(format, {
    skip: (req, res) => res.statusCode < 500, // skip non-errors
    stream: errStream
});
