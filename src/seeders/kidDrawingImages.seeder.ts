import axios from "axios";
import { KidDrawingImage } from "../models/index.js";
import { getJsonCompletion } from "../services/groq.js";

export class KidDrawingImagesSeeder {
    async run(sequelize: any, transaction: any) {
        console.log("🎨 Seeding Kid Drawing Images via Groq...");

        try {
            // 1. Get potential SVG URLs from Groq
            console.log("🤖 Asking Groq for coloring page SVGs...");
            const prompt = `
                Generate a JSON object containing a list of 20 high-quality, publicly accessible SVG coloring page URLs.
                Focus on simple, kid-friendly themes like animals, nature, space, and basic shapes.
                The images MUST be SVGs (.svg extension or content-type image/svg+xml).
                Prefer stable sources like Wikimedia Commons, Public Domain Vectors, or other reliable open clipart repositories.
                
                Schema:
                {
                    "images": [
                        { "url": "https://example.com/image.svg", "category": "animals", "title": "Cute Cat" }
                    ]
                }
            `;

            // Using a relaxed type for the response to avoid strict TS issues if the model adds extra fields
            const response = await getJsonCompletion<{ images: { url: string; category: string; title: string }[] }>(
                prompt,
                {
                    temperature: 0.7,
                    model: "llama-3.3-70b-versatile"
                }
            );

            const candidates = response.images || [];
            console.log(`Received ${candidates.length} candidates from Groq.`);

            const seededImages: any[] = [];
            const CONCURRENCY = 5;

            // 2. Validate URLs
            // Process in chunks to avoid overwhelming the network or the server
            for (let i = 0; i < candidates.length; i += CONCURRENCY) {
                const chunk = candidates.slice(i, i + CONCURRENCY);
                const promises = chunk.map(async (candidate) => {
                    const { url, category, title } = candidate;

                    try {
                        console.log(`Checking: ${url}`);
                        const headerRes = await axios.head(url, { timeout: 5000 });

                        if (headerRes.status === 200) {
                            const contentType = headerRes.headers["content-type"];
                            // Loosely check for svg or image type, sometimes servers return octet-stream for svgs
                            // We accept it if the extension is .svg OR if the content-type says svg
                            const isSvg =
                                url.toLowerCase().endsWith(".svg") || (contentType && contentType.includes("svg"));

                            if (isSvg) {
                                return {
                                    url,
                                    type: "svg", // We primarily want SVGs
                                    category: category || "general",
                                    isValid: true,
                                    lastChecked: new Date()
                                };
                            } else {
                                console.warn(`⚠️  Skipping ${url}: Not an SVG (Type: ${contentType})`);
                            }
                        }
                    } catch (err: any) {
                        console.warn(`❌ Failed to load ${url}: ${err.message}`);
                    }
                    return null;
                });

                const results = await Promise.all(promises);
                const validImages = results.filter((img) => img !== null);
                seededImages.push(...validImages);
            }

            console.log(`Found ${seededImages.length} valid SVG images.`);

            // 3. Bulk Insert
            if (seededImages.length > 0) {
                const urls = seededImages.map((img) => img.url);

                // Check if they already exist to avoid duplicates
                try {
                    const existing = await KidDrawingImage.findAll({
                        where: { url: urls },
                        attributes: ["url"],
                        transaction
                    });

                    const existingUrls = new Set(existing.map((e: any) => e.url));
                    const newImages = seededImages.filter((img) => !existingUrls.has(img.url));

                    if (newImages.length > 0) {
                        await KidDrawingImage.bulkCreate(newImages, { transaction });
                        console.log(`✅ Successfully seeded ${newImages.length} new images.`);
                    } else {
                        console.log("ℹ️  All found images already exist in the database.");
                    }
                } catch (dbError: any) {
                    console.error(
                        "⚠️ Database error during check/insert (might be a table sync issue):",
                        dbError.message
                    );
                }
            } else {
                console.warn("⚠️  No valid images found to seed.");
            }
        } catch (error: any) {
            console.error("❌ Error seeding drawing images:", error.message);
        }
    }
}

export default new KidDrawingImagesSeeder();
