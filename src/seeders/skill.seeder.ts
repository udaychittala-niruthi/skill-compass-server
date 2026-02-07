import { Skill, sequelize } from "../models";
import { Sequelize } from "sequelize";
import { resolveIconsAndGenerateNew } from "./utils";

const skills = [
    "python",
    "sql",
    "java",
    "critical thinking",
    "analytic thinking",
    "programming",
    "work under pressure",
    "logical skills",
    "problem solving skills",
    "people management",
    "communication skills",
    "accounting skills",
    "plc allen bradley",
    "plc ladder logic",
    "labview",
    "business analysis",
    "end-to-end project management",
    "cross-functional team leadership",
    "requirements gathering",
    "lean six sigma",
    "lean six sigma blackbelt",
    "productivity improvement",
    "c",
    "html",
    "active listening",
    "gathering information",
    "artistic/creative skills",
    "leadership",
    "editing",
    "writing skills",
    "medical knowledge",
    "hr",
    "teaching",
    "cost accounting",
    "team work",
    "tableau",
    "data visualization skills( power bi/ tableau )",
    "machine learning skills",
    "artificial intelligence",
    "matlab",
    "r",
    "designing skills",
    "proeficiency in software like staad pro, etabs",
    "hardware skills",
    "product knowledge",
    "risk management skills",
    "cad/cae(autocad/catia/ansys/proe/seimensnx)",
    "finance related skills",
    "negotiation skills",
    "mass communication",
    "sales",
    "interpersonal skills",
    "wealth management",
    "financial analysis",
    "financial modeling",
    "marketing strategy",
    "financial services",
    "design and analysis of automobile components",
    "vehicle maintenance and reconditioning",
    "design for manufacturer and assemble",
    "creativity skills",
    "excel",
    "teamwork",
    "time management",
    "company secretarial work",
    "legal compliance",
    "interpersonal communication",
    "companies act",
    "indirect taxation",
    "cloud computing",
    "reporting",
    "observation skills",
    "subject knowledge",
    "business knowledge",
    "market study",
    "civil & criminal law",
    "social media marketing",
    "bootstrap",
    "node.js",
    "angular",
    "jira",
    "trello",
    "jquery",
    "javascript",
    "ajax",
    "php",
    "codeignitor",
    "loopback",
    "hospitality",
    "polymerase chain reaction (pcr)",
    "life sciences",
    "protein purification",
    "protein chemistry",
    "protein assays",
    "protein electrophoresis",
    "protein chromatography",
    "western blotting",
    "protein structure prediction",
    "protein kinases",
    "protein characterization",
    "protein engineering",
    "phytochemistry",
    "metabolomics",
    "dna",
    "biochemistry",
    "bioinformatics",
    "cell culture",
    "staad pro",
    "etabs",
    "data science",
    "sap",
    ".net framework",
    "transact",
    "technical machine fitter",
    "c#",
    "good communication skills",
    "client management",
    "business analytics",
    "risk analytics",
    "sas",
    "marketing management",
    "market research",
    "business strategy",
    "commercial banking",
    "portfolio management",
    "supply chain management",
    "business process reengineering",
    "consumer behaviour",
    "long-term customer relationships",
    "retail marketing",
    "financial accounting",
    "credit risk modeling",
    "security analysis",
    "working capital management",
    "strategic marketing",
    "investment banking",
    "structured finance",
    "building rapport",
    "2d/3d animation",
    "oracle",
    "no",
];

const SkillSeeder = async (sequelize: Sequelize) => {
    console.log("Creating Skills...");

    try {
        // 1. Fetch current DB state
        const existingDbSkills = await Skill.findAll();
        const dbSkillMap = new Map(existingDbSkills.map(s => [s.name.toLowerCase(), s]));

        const itemsToEnrich: string[] = [];
        const knownNames: string[] = [...skills]; // base known names

        // 2. Determine what needs enrichment
        for (const skillName of skills) {
            const dbSkill = dbSkillMap.get(skillName.toLowerCase());
            if (dbSkill) {
                // If exists but missing icon, add to enrichment list
                if (!dbSkill.getDataValue('icon') || !dbSkill.getDataValue('iconLibrary')) {
                    itemsToEnrich.push(skillName);
                }
                // Else: skip, it's already good
            } else {
                // New skill not in DB
                itemsToEnrich.push(skillName);
            }
        }

        // Also add existing DB names to knownNames for exclusion context
        existingDbSkills.forEach(s => knownNames.push(s.name));

        console.log(`Found ${itemsToEnrich.length} skills to enrich/create.`);

        // 3. Resolve icons and generate new ones
        // Only generate new ones if we are actually processing things, or force it? 
        // Let's always try to generate a few new ones.
        const processedItems = await resolveIconsAndGenerateNew(itemsToEnrich, knownNames, 'skill', 20);

        // 4. Upsert changes
        let created = 0;
        let updated = 0;

        for (const item of processedItems) {
            const [skillRecord, wasCreated] = await Skill.findOrCreate({
                where: { name: item.name },
                defaults: {
                    name: item.name,
                    icon: item.icon,
                    iconLibrary: item.iconLibrary
                }
            });

            if (wasCreated) {
                created++;
            } else {
                // Update if icon changed or was missing
                if (skillRecord.getDataValue('icon') !== item.icon || skillRecord.getDataValue('iconLibrary') !== item.iconLibrary) {
                    await skillRecord.update({
                        icon: item.icon,
                        iconLibrary: item.iconLibrary
                    });
                    updated++;
                }
            }
        }

        console.log(`✅  Skills seeding completed. Created ${created} new, Updated ${updated} existing. Skipped ${skills.length - itemsToEnrich.length} up-to-date hardcoded items.`);
    } catch (error) {
        console.error("❌  Error seeding skills:", error);
        throw error;
    }
}

export default SkillSeeder;
