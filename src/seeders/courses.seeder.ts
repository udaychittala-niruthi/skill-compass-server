import { Course, sequelize } from "../models";
import { Sequelize } from "sequelize";

const courses ={
        "BE": "TECH",
        "BTech": "TECH",
        "MTech": "TECH",
        "BCA": "TECH",
        "MCA": "TECH",
        "Biotechnology": "TECH",

        "BCom": "COMMERCE",
        "BAF": "COMMERCE",
        "BBA": "COMMERCE",
        "BMS": "COMMERCE",
        "Bachelor of Management Studies": "COMMERCE",
        "MBA": "COMMERCE",
        "PGDM": "COMMERCE",
        "TYBCom": "COMMERCE",
        "MCom": "COMMERCE",
        "Chartered Accountancy": "COMMERCE",

        "Arts": "ARTS",
        "BA": "ARTS",
        "MA": "ARTS",
        "Bachelor of Journalism": "ARTS",
        "Master of Journalism": "ARTS",
        "Journalism": "ARTS",
        "BAC": "ARTS",
        "BALLB": "ARTS",
        "Law Hons": "ARTS",
        "Economics": "ARTS",
        "Commercial Art Visual Art": "ARTS",

        "BPharm": "MEDICAL",
        "BPharmacy": "MEDICAL",
        "Diploma in Pharmacy": "MEDICAL",
        "MDCS": "MEDICAL",
        "Doctor": "MEDICAL",
        "GNM Nursing": "MEDICAL",
        "Pharmacy": "MEDICAL",

        "Agri Diploma": "DIPLOMA",
        "Diploma": "DIPLOMA",
        "DEd": "DIPLOMA",
        "DME": "DIPLOMA",
        "BHMCT": "DIPLOMA",
        "HH": "DIPLOMA",
        "PooSc": "DIPLOMA",
        "Degree": "DIPLOMA"
    };

const CourseSeeder = async (sequelize: Sequelize) => {
    console.log("Creating Courses...");

    try {
        const courseEntries = Object.entries(courses);
        const count = courseEntries.length;
        let created = 0;

        for (const [name, category] of courseEntries) {
            const [item, wasCreated] = await Course.findOrCreate({
                where: { name: name },
                defaults: {
                    name: name,
                    category: category
                }
            });
            if (wasCreated) created++;
        }

        console.log(`✅  Courses seeding completed. Created ${created} new courses out of ${count}.`);

    } catch (error) {
        console.error("❌  Error seeding courses:", error);
        throw error;
    }
}

export default CourseSeeder;