import "dotenv/config";
import { resourceUrlService } from "../services/resourceUrl.service.js";

async function verify() {
    console.log("Checking YouTube URL generation...");

    const topics = [
        "Introduction to Python",
        "Python Basics",
        "Advanced Python",
        "React for Beginners",
        "Advanced React Patterns",
        "Machine Learning 101",
        "Deep Learning with Python",
        "Unknown Topic 123",
        "civil engineering"
    ];

    for (const topic of topics) {
        const url = await resourceUrlService.findVideoUrl(topic);
        console.log(`Topic: "${topic}" -> URL: ${url}`);
    }
}

verify().catch(console.error);
