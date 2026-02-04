import EducationalResource from "../models/EducationalResource";

/**
 * Seeder for Educational Resources
 * Seeds curated learning resources with keywords for matching modules
 */
export class EducationalResourcesSeeder {
    async seed() {
        console.log("🌱 Seeding educational resources...");

        const resources = [
            // JavaScript
            {
                title: "Eloquent JavaScript (Free PDF)",
                url: "https://eloquentjavascript.net/Eloquent_JavaScript.pdf",
                resourceType: "pdf" as const,
                keywords: ["javascript", "js", "programming", "web"],
                description: "A comprehensive book about JavaScript and programming",
                provider: "Eloquent JavaScript",
                difficulty: "all" as const,
                isPremium: false,
                rating: 4.8,
            },
            {
                title: "You Don't Know JS (Book Series)",
                url: "https://github.com/getify/You-Dont-Know-JS",
                resourceType: "book" as const,
                keywords: ["javascript", "js", "advanced", "programming"],
                provider: "GitHub",
                difficulty: "advanced" as const,
                isPremium: false,
                rating: 4.9,
            },
            {
                title: "JavaScript.info Tutorial",
                url: "https://javascript.info/",
                resourceType: "tutorial" as const,
                keywords: ["javascript", "js", "tutorial", "web"],
                provider: "JavaScript.info",
                difficulty: "all" as const,
                isPremium: false,
                rating: 4.7,
            },

            // Python
            {
                title: "Python for Everybody",
                url: "https://www.py4e.com/book.php",
                resourceType: "book" as const,
                keywords: ["python", "programming", "beginner"],
                provider: "Dr. Chuck",
                difficulty: "beginner" as const,
                isPremium: false,
                rating: 4.8,
            },
            {
                title: "Automate the Boring Stuff with Python",
                url: "https://automatetheboringstuff.com/",
                resourceType: "book" as const,
                keywords: ["python", "automation", "scripting", "programming"],
                provider: "Al Sweigart",
                difficulty: "beginner" as const,
                isPremium: false,
                rating: 4.9,
            },
            {
                title: "Official Python Tutorial",
                url: "https://docs.python.org/3/tutorial/",
                resourceType: "documentation" as const,
                keywords: ["python", "tutorial", "official", "programming"],
                provider: "Python.org",
                difficulty: "all" as const,
                isPremium: false,
                rating: 4.6,
            },

            // Web Development
            {
                title: "MDN Web Docs - HTML",
                url: "https://developer.mozilla.org/en-US/docs/Learn/HTML",
                resourceType: "documentation" as const,
                keywords: ["html", "web", "frontend", "markup"],
                provider: "MDN",
                difficulty: "all" as const,
                isPremium: false,
                rating: 4.9,
            },
            {
                title: "MDN Web Docs - CSS",
                url: "https://developer.mozilla.org/en-US/docs/Learn/CSS",
                resourceType: "documentation" as const,
                keywords: ["css", "styling", "web", "frontend"],
                provider: "MDN",
                difficulty: "all" as const,
                isPremium: false,
                rating: 4.9,
            },
            {
                title: "React Official Documentation",
                url: "https://react.dev/learn",
                resourceType: "documentation" as const,
                keywords: ["react", "javascript", "frontend", "web", "ui"],
                provider: "React",
                difficulty: "intermediate" as const,
                isPremium: false,
                rating: 4.8,
            },

            // Cloud Computing
            {
                title: "AWS Getting Started",
                url: "https://aws.amazon.com/getting-started/",
                resourceType: "tutorial" as const,
                keywords: ["cloud", "aws", "amazon", "devops", "infrastructure"],
                provider: "AWS",
                difficulty: "beginner" as const,
                isPremium: false,
                rating: 4.7,
            },
            {
                title: "Microsoft Azure Documentation",
                url: "https://learn.microsoft.com/en-us/azure/",
                resourceType: "documentation" as const,
                keywords: ["cloud", "azure", "microsoft", "devops"],
                provider: "Microsoft",
                difficulty: "all" as const,
                isPremium: false,
                rating: 4.6,
            },
            {
                title: "Google Cloud Documentation",
                url: "https://cloud.google.com/docs",
                resourceType: "documentation" as const,
                keywords: ["cloud", "gcp", "google", "devops"],
                provider: "Google Cloud",
                difficulty: "all" as const,
                isPremium: false,
                rating: 4.6,
            },

            // Databases
            {
                title: "SQL Tutorial",
                url: "https://www.sqltutorial.org/",
                resourceType: "tutorial" as const,
                keywords: ["sql", "database", "query", "data"],
                provider: "SQLTutorial.org",
                difficulty: "beginner" as const,
                isPremium: false,
                rating: 4.5,
            },
            {
                title: "PostgreSQL Tutorial",
                url: "https://www.postgresql.org/docs/current/tutorial.html",
                resourceType: "documentation" as const,
                keywords: ["sql", "postgresql", "database", "relational"],
                provider: "PostgreSQL",
                difficulty: "intermediate" as const,
                isPremium: false,
                rating: 4.7,
            },
            {
                title: "MongoDB University",
                url: "https://university.mongodb.com/",
                resourceType: "course" as const,
                keywords: ["mongodb", "database", "nosql", "data"],
                provider: "MongoDB",
                difficulty: "all" as const,
                isPremium: false,
                rating: 4.6,
            },

            // Machine Learning & AI
            {
                title: "Scikit-learn Tutorials",
                url: "https://scikit-learn.org/stable/tutorial/index.html",
                resourceType: "tutorial" as const,
                keywords: ["machine learning", "ml", "python", "ai", "data science"],
                provider: "Scikit-learn",
                difficulty: "intermediate" as const,
                isPremium: false,
                rating: 4.7,
            },
            {
                title: "TensorFlow Tutorials",
                url: "https://www.tensorflow.org/tutorials",
                resourceType: "tutorial" as const,
                keywords: ["machine learning", "deep learning", "tensorflow", "ai", "neural networks"],
                provider: "TensorFlow",
                difficulty: "advanced" as const,
                isPremium: false,
                rating: 4.8,
            },
            {
                title: "Deep Learning Book",
                url: "https://www.deeplearningbook.org/",
                resourceType: "book" as const,
                keywords: ["deep learning", "neural networks", "ai", "machine learning"],
                provider: "MIT Press",
                difficulty: "advanced" as const,
                isPremium: false,
                rating: 4.9,
            },

            // DevOps & Tools
            {
                title: "Docker Get Started",
                url: "https://docs.docker.com/get-started/",
                resourceType: "tutorial" as const,
                keywords: ["docker", "containers", "devops", "deployment"],
                provider: "Docker",
                difficulty: "beginner" as const,
                isPremium: false,
                rating: 4.7,
            },
            {
                title: "Kubernetes Tutorials",
                url: "https://kubernetes.io/docs/tutorials/",
                resourceType: "tutorial" as const,
                keywords: ["kubernetes", "k8s", "containers", "orchestration", "devops"],
                provider: "Kubernetes",
                difficulty: "intermediate" as const,
                isPremium: false,
                rating: 4.6,
            },
            {
                title: "Git Pro Book",
                url: "https://git-scm.com/book/en/v2",
                resourceType: "book" as const,
                keywords: ["git", "version control", "github", "devops"],
                provider: "Git",
                difficulty: "all" as const,
                isPremium: false,
                rating: 4.8,
            },

            // Data Structures & Algorithms
            {
                title: "Introduction to Algorithms (MIT)",
                url: "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/",
                resourceType: "book" as const,
                keywords: ["algorithms", "data structures", "computer science", "programming"],
                provider: "MIT Press",
                difficulty: "advanced" as const,
                isPremium: true,
                rating: 4.9,
            },
            {
                title: "Open Data Structures",
                url: "https://opendatastructures.org/",
                resourceType: "book" as const,
                keywords: ["data structures", "algorithms", "computer science"],
                provider: "opendatastructures.org",
                difficulty: "intermediate" as const,
                isPremium: false,
                rating: 4.5,
            },

            // Security
            {
                title: "OWASP Top 10",
                url: "https://owasp.org/www-project-top-ten/",
                resourceType: "documentation" as const,
                keywords: ["security", "cybersecurity", "web security", "owasp"],
                provider: "OWASP",
                difficulty: "intermediate" as const,
                isPremium: false,
                rating: 4.8,
            },
            {
                title: "Web Security Academy",
                url: "https://portswigger.net/web-security",
                resourceType: "course" as const,
                keywords: ["security", "web security", "cybersecurity", "pentesting"],
                provider: "PortSwigger",
                difficulty: "intermediate" as const,
                isPremium: false,
                rating: 4.7,
            },

            // Software Engineering
            {
                title: "Design Patterns (Refactoring Guru)",
                url: "https://refactoring.guru/design-patterns",
                resourceType: "tutorial" as const,
                keywords: ["design patterns", "software engineering", "architecture", "oop"],
                provider: "Refactoring Guru",
                difficulty: "intermediate" as const,
                isPremium: false,
                rating: 4.8,
            },
            {
                title: "Agile Resources",
                url: "https://www.atlassian.com/agile",
                resourceType: "documentation" as const,
                keywords: ["agile", "scrum", "project management", "software engineering"],
                provider: "Atlassian",
                difficulty: "beginner" as const,
                isPremium: false,
                rating: 4.6,
            },

            // Node.js
            {
                title: "Node.js Official Guides",
                url: "https://nodejs.org/en/docs/guides/",
                resourceType: "documentation" as const,
                keywords: ["nodejs", "node", "javascript", "backend", "server"],
                provider: "Node.js",
                difficulty: "intermediate" as const,
                isPremium: false,
                rating: 4.7,
            },

            // Java
            {
                title: "Oracle Java Tutorials",
                url: "https://docs.oracle.com/javase/tutorial/",
                resourceType: "tutorial" as const,
                keywords: ["java", "programming", "oop", "backend"],
                provider: "Oracle",
                difficulty: "all" as const,
                isPremium: false,
                rating: 4.6,
            },

            // Data Science
            {
                title: "Python Data Science Handbook",
                url: "https://jakevdp.github.io/PythonDataScienceHandbook/",
                resourceType: "book" as const,
                keywords: ["data science", "python", "pandas", "numpy", "analysis"],
                provider: "Jake VanderPlas",
                difficulty: "intermediate" as const,
                isPremium: false,
                rating: 4.8,
            },
            {
                title: "Kaggle Learn",
                url: "https://www.kaggle.com/learn",
                resourceType: "course" as const,
                keywords: ["data science", "machine learning", "python", "analysis"],
                provider: "Kaggle",
                difficulty: "all" as const,
                isPremium: false,
                rating: 4.7,
            },
        ];

        //Check if already seeded
        const count = await EducationalResource.count();
        if (count > 0) {
            console.log(`✓ Educational resources already seeded (${count} resources)`);
            return;
        }

        await EducationalResource.bulkCreate(resources);
        console.log(`✓ Seeded ${resources.length} educational resources`);
    }
}
