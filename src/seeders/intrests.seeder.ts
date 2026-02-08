import { Interest } from "../models/index.js";

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
    "architecture and construction"
];

import { resolveIconsAndGenerateNew } from "./utils";

// ... interests array ...

const InterestSeeder = async (_sequelize: any, transaction?: any) => {
    console.log("Creating Interests...");

    try {
        // 1. Fetch current DB state
        const existingDbInterests = await Interest.findAll({ transaction });
        const dbInterestMap = new Map(existingDbInterests.map((i) => [i.name.toLowerCase(), i]));

        const itemsToEnrich: string[] = [];
        const knownNames: string[] = [...interests];

        // 2. Determine what needs enrichment
        for (const interestName of interests) {
            const dbInterest = dbInterestMap.get(interestName.toLowerCase());
            if (dbInterest) {
                if (!dbInterest.getDataValue("icon") || !dbInterest.getDataValue("iconLibrary")) {
                    itemsToEnrich.push(interestName);
                }
            } else {
                itemsToEnrich.push(interestName);
            }
        }

        existingDbInterests.forEach((i) => knownNames.push(i.name));

        console.log(`Found ${itemsToEnrich.length} interests to enrich/create.`);

        // 3. Resolve icons and generate new ones
        const processedItems = await resolveIconsAndGenerateNew(itemsToEnrich, knownNames, "interest", 20);

        // 4. Upsert changes
        let created = 0;
        let updated = 0;

        for (const item of processedItems) {
            const [interestRecord, wasCreated] = await Interest.findOrCreate({
                where: { name: item.name },
                defaults: {
                    name: item.name,
                    icon: item.icon,
                    iconLibrary: item.iconLibrary
                },
                transaction
            });

            if (wasCreated) {
                created++;
            } else {
                if (
                    interestRecord.getDataValue("icon") !== item.icon ||
                    interestRecord.getDataValue("iconLibrary") !== item.iconLibrary
                ) {
                    await interestRecord.update(
                        {
                            icon: item.icon,
                            iconLibrary: item.iconLibrary
                        },
                        { transaction }
                    );
                    updated++;
                }
            }
        }

        console.log(
            `✅  Interests seeding completed. Created ${created} new, Updated ${updated} existing. Skipped ${interests.length - itemsToEnrich.length} up-to-date hardcoded items.`
        );
    } catch (error) {
        console.error("❌  Error seeding interests:", error);
        throw error;
    }
};

export default InterestSeeder;
