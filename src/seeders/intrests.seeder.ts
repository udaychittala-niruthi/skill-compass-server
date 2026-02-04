import { Interest, sequelize } from "../models";
import { Sequelize } from "sequelize";

const interests = [
    "cloud computing",
    "technology",
    "understand human behaviour",
    "sales/marketing",
    "trading",
    "home interior design",
    "research",
    "teaching",
    "understand human body",
    "content writing",
    "govt. job",
    "service",
    "infrastructure",
    "financial analysis",
    "take risk for profits",
    "entrepreneurship",
    "digital marketing",
    "market research",
    "agriculture",
    "construction management",
    "data analytics",
    "data scientist",
    "industries",
    "information technology",
    "news coverage",
    "social justice",
    "supply chain analysis",
    "game industry",
    "design",
    "web designing",
    "web development",
    "social causes",
    "blockchain",
    "machine learning",
    "excel",
    "sports industry",
    "product life cycle management",
    "sap consultant in mm",
    "project management",
    "navy defence related",
    "oil and gas",
    "biotechnology",
    "software developer",
    "hospitality",
    "salesforce admin",
    "social media marketing",
    "software job",
    "it",
    "urban planning",
    "data entry or telecalling work",
    "mobile app development",
    "geography",
    "geology",
    "statistical programmer",
    "software engineering",
    "gardening",
    "operations",
    "cyber security",
    "application development",
    "higher studies",
    "retailer",
    "litigation & legal service",
    "animation",
    "all fields related to data science",
    "analysis",
    "architecture and construction",
];

const InterestSeeder = async (sequelize: Sequelize) => {
    console.log("Creating Interests...");

    try {
        const count = interests.length;
        let created = 0;
        for (const interest of interests) {
            const [item, wasCreated] = await Interest.findOrCreate({
                where: { name: interest },
                defaults: { name: interest }
            });
            if (wasCreated) created++;
        }
        console.log(`✅  Interests seeding completed. Created ${created} new interests out of ${count}.`);
    } catch (error) {
        console.error("❌  Error seeding interests:", error);
        throw error;
    }
}

export default InterestSeeder;
