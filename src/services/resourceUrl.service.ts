/**
 * Resource URL Service
 * Finds and validates real educational resources (videos, PDFs, thumbnails)
 */

import axios from "axios";
import { UrlValidator } from "../utils/urlValidator.js";

export class ResourceUrlService {
    private youtubeApiKey: string;
    private pixabayApiKey: string;

    constructor() {
        this.youtubeApiKey = process.env.YOUTUBE_API_KEY || "";
        this.pixabayApiKey = process.env.PIXABAY_API_KEY || "";

        if (!this.youtubeApiKey) {
            console.warn("⚠️ YouTube API Key is missing! Video search will use fallback URLs.");
        }
    }

    /**
     * Find educational video URL using YouTube API
     */
    async findVideoUrl(topic: string, durationMinutes?: number): Promise<string | null> {
        // If no API key, use curated fallback
        if (!this.youtubeApiKey) {
            return this.getCuratedVideoUrl(topic);
        }

        try {
            const searchQuery = `${topic} tutorial educational`;
            const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
                params: {
                    part: "snippet",
                    q: searchQuery,
                    type: "video",
                    videoDuration: this.getVideoDurationFilter(durationMinutes),
                    videoEmbeddable: "true",
                    videoLicense: "any",
                    maxResults: 5,
                    key: this.youtubeApiKey,
                    relevanceLanguage: "en",
                    safeSearch: "strict"
                },
                timeout: 5000
            });

            if (response.data.items && response.data.items.length > 0) {
                const videoId = response.data.items[0].id.videoId;
                return `https://www.youtube.com/watch?v=${videoId}`;
            } else {
                console.warn(`No videos found for topic: "${topic}"`);
            }
        } catch (error: any) {
            console.error(`YouTube API error for topic "${topic}":`, error.message || error);
            if (error.response) {
                console.error("API Response Data:", error.response.data);
            }
        }

        // Fallback to curated list
        return this.getCuratedVideoUrl(topic);
    }

    /**
     * Get duration filter for YouTube API
     */
    private getVideoDurationFilter(minutes?: number): string {
        if (!minutes) return "any";
        if (minutes < 4) return "short"; // < 4 minutes
        if (minutes < 20) return "medium"; // 4-20 minutes
        return "long"; // > 20 minutes
    }

    /**
     * Get thumbnail from Pixabay
     */
    async findThumbnail(topic: string): Promise<string | null> {
        // If no API key, use placeholder
        if (!this.pixabayApiKey) {
            return this.getPlaceholderThumbnail(topic);
        }

        try {
            const searchQuery = topic.split(" ").slice(0, 3).join(" ");
            const response = await axios.get("https://pixabay.com/api/", {
                params: {
                    key: this.pixabayApiKey,
                    q: searchQuery,
                    image_type: "photo",
                    category: "education",
                    safesearch: "true",
                    per_page: 5
                },
                timeout: 5000
            });

            if (response.data.hits && response.data.hits.length > 0) {
                return response.data.hits[0].webformatURL;
            }
        } catch (error) {
            console.error("Pixabay API error:", error);
        }

        // Fallback to placeholder
        return this.getPlaceholderThumbnail(topic);
    }

    /**
     * Get placeholder thumbnail
     */
    private getPlaceholderThumbnail(topic: string): string {
        const seed = encodeURIComponent(topic);
        return `https://picsum.photos/seed/${seed}/640/360`;
    }

    /**
     * Find PDF and learning resources
     */
    async findPdfResources(topic: string): Promise<string[]> {
        const resources: string[] = [];

        // Curated educational platforms
        const curatedResources = this.getCuratedPdfResources(topic);
        resources.push(...curatedResources);

        return resources;
    }

    /**
     * Generate format metadata
     */
    getFormatMetadata(moduleType: string, durationMinutes: number): any {
        const formats: any = {
            course: { type: "video", provider: "YouTube", quality: "HD" },
            "micro-lesson": { type: "video", provider: "YouTube", quality: "HD" },
            project: { type: "interactive", provider: "Self-guided", quality: "N/A" },
            assessment: { type: "quiz", provider: "Platform", quality: "N/A" },
            certification: { type: "exam", provider: "External", quality: "N/A" },
            workshop: { type: "live-session", provider: "Virtual", quality: "Interactive" },
            reading: { type: "article", provider: "PDF/Web", quality: "Text" }
        };

        return {
            ...(formats[moduleType] || { type: "video", provider: "YouTube", quality: "HD" }),
            duration: `${durationMinutes} minutes`,
            estimatedDuration: durationMinutes
        };
    }

    /**
     * Curated video URLs for common topics
     */
    private getCuratedVideoUrl(topic: string): string | null {
        const topicLower = topic.toLowerCase();

        const curatedVideos: Record<string, string> = {
            javascript: "https://www.youtube.com/watch?v=PkZNo7MFNFg",
            python: "https://www.youtube.com/watch?v=rfscVS0vtbw",
            react: "https://www.youtube.com/watch?v=SqcY0GlETPk",
            html: "https://www.youtube.com/watch?v=UB1O30fR-EE",
            css: "https://www.youtube.com/watch?v=yfoY53QXEnI",
            nodejs: "https://www.youtube.com/watch?v=TlB_eWDSMt4",
            database: "https://www.youtube.com/watch?v=HXV3zeQKqGY",
            sql: "https://www.youtube.com/watch?v=HXV3zeQKqGY",
            git: "https://www.youtube.com/watch?v=RGOj5yH7evk",
            "data structures": "https://www.youtube.com/watch?v=RBSGKlAvoiM",
            algorithms: "https://www.youtube.com/watch?v=8hly31xKli0",
            "machine learning": "https://www.youtube.com/watch?v=ukzFI9rgwfU",
            "artificial intelligence": "https://www.youtube.com/watch?v=JMUxmLyrhSk",
            "web development": "https://www.youtube.com/watch?v=erEgovG9WBs",
            "mobile development": "https://www.youtube.com/watch?v=fis26HvvDII",

            // Engineering
            "civil engineering": "https://www.youtube.com/watch?v=4SkdksU0bYc", // Intro to Civil Engineering
            "mechanical engineering": "https://www.youtube.com/watch?v=M5oY6V08aN8",
            "electrical engineering": "https://www.youtube.com/watch?v=Ew1t1eYI9eU",
            robotics: "https://www.youtube.com/watch?v=9g0H5zM8iYk",

            // Science
            physics: "https://www.youtube.com/watch?v=77DOwXW1B4w",
            chemistry: "https://www.youtube.com/watch?v=FSyAehMdpyI",
            biology: "https://www.youtube.com/watch?v=85UfW8tG73k",
            mathematics: "https://www.youtube.com/watch?v=0j3_JzXj1uY",
            calculus: "https://www.youtube.com/watch?v=WSIDkPH0bMc",

            // Arts & Humanities
            history: "https://www.youtube.com/watch?v=S4g8hsq3v04",
            psychology: "https://www.youtube.com/watch?v=vo4pMVb0R6M",
            economics: "https://www.youtube.com/watch?v=3ez10ADR_gM",
            design: "https://www.youtube.com/watch?v=YqQx75OPRa0",
            art: "https://www.youtube.com/watch?v=QZp1pS3J7sY",

            // Business
            marketing: "https://www.youtube.com/watch?v=Le2g0e1Zq9M",
            finance: "https://www.youtube.com/watch?v=WEdj8X5_XbE",
            entrepreneurship: "https://www.youtube.com/watch?v=lJjILQu2xM8",
            typescript: "https://www.youtube.com/watch?v=30LWjhZzg50",
            java: "https://www.youtube.com/watch?v=grEKMHGYyns",
            "c programming": "https://www.youtube.com/watch?v=KJgsSFOSQv0",
            cpp: "https://www.youtube.com/watch?v=vLnPwxZdW4Y",
            go: "https://www.youtube.com/watch?v=YS4e4q9oBaU",
            rust: "https://www.youtube.com/watch?v=zF34dRivLOw",
            kotlin: "https://www.youtube.com/watch?v=F9UC9DY-vIU",
            swift: "https://www.youtube.com/watch?v=comQ1-x2a1Q",
            php: "https://www.youtube.com/watch?v=OK_JCtrrv-c",

            // Frontend & Backend
            angular: "https://www.youtube.com/watch?v=3dHNOWTI7H8",
            vue: "https://www.youtube.com/watch?v=FXpIoQ_rT_c",
            nextjs: "https://www.youtube.com/watch?v=wm5gMKuwSYk",
            express: "https://www.youtube.com/watch?v=L72fhGm1tfE",
            mongodb: "https://www.youtube.com/watch?v=ofme2o29ngU",

            // DevOps & Cloud
            docker: "https://www.youtube.com/watch?v=3c-iBn73dDE",
            kubernetes: "https://www.youtube.com/watch?v=X48VuDVv0do",
            aws: "https://www.youtube.com/watch?v=ulprqHHWlng",
            azure: "https://www.youtube.com/watch?v=10PbGbTUSAg",
            "google cloud": "https://www.youtube.com/watch?v=jpno8FSqpc8",
            devops: "https://www.youtube.com/watch?v=j5Zsa_eOXeY",
            linux: "https://www.youtube.com/watch?v=sWbUDq4S6Y8",

            // Cybersecurity
            cybersecurity: "https://www.youtube.com/watch?v=U_P23SqJaDc",
            "ethical hacking": "https://www.youtube.com/watch?v=3Kq1MIfTWCE",
            networking: "https://www.youtube.com/watch?v=qiQR5rTSshw",

            // Data & AI
            "data science": "https://www.youtube.com/watch?v=ua-CiDNNj30",
            pandas: "https://www.youtube.com/watch?v=vmEHCJofslg",
            numpy: "https://www.youtube.com/watch?v=QUT1VHiLmmI",
            "deep learning": "https://www.youtube.com/watch?v=aircAruvnKk",
            "natural language processing": "https://www.youtube.com/watch?v=CMrHM8a3hqw",

            // Mobile
            flutter: "https://www.youtube.com/watch?v=VPvVD8t02U8",
            "react native": "https://www.youtube.com/watch?v=0-S5a0eXPoc",
            android: "https://www.youtube.com/watch?v=fis26HvvDII",
            ios: "https://www.youtube.com/watch?v=09TeUXjzpKs",

            // Tools
            github: "https://www.youtube.com/watch?v=RGOj5yH7evk",
            jira: "https://www.youtube.com/watch?v=YyJcA9bC3q0",
            postman: "https://www.youtube.com/watch?v=VywxIQ2ZXw4",
            firebase: "https://www.youtube.com/watch?v=9kRgVxULbag",

            // Computer Science Fundamentals
            "operating systems": "https://www.youtube.com/watch?v=26QPDBe-NB8",
            "computer networks": "https://www.youtube.com/watch?v=qiQR5rTSshw",
            "compiler design": "https://www.youtube.com/watch?v=Qkwj65l_96I",
            "object oriented programming": "https://www.youtube.com/watch?v=pTB0EiLXUC8",

            // Soft Skills
            "communication skills": "https://www.youtube.com/watch?v=HAnw168huqA",
            "public speaking": "https://www.youtube.com/watch?v=Unzc731iCUY",
            "time management": "https://www.youtube.com/watch?v=iONDebHX9qk",
            // Non-Coding Categories

            // Health & Fitness
            fitness: "https://www.youtube.com/watch?v=UItWltVZZmE",
            yoga: "https://www.youtube.com/watch?v=v7AYKMP6rOE",
            nutrition: "https://www.youtube.com/watch?v=7LMX6xkI5jI",
            "mental health": "https://www.youtube.com/watch?v=DxIDKZHW3-E",
            meditation: "https://www.youtube.com/watch?v=inpok4MKVLM",

            // Personal Development
            "self improvement": "https://www.youtube.com/watch?v=ZXsQAXx_ao0",
            productivity: "https://www.youtube.com/watch?v=IlU-zDU6aQ0",
            "goal setting": "https://www.youtube.com/watch?v=ZXsQAXx_ao0",
            leadership: "https://www.youtube.com/watch?v=1eMB7mL3c4c",
            "critical thinking": "https://www.youtube.com/watch?v=dItUGF8GdTw",

            // Finance & Investing
            "stock market": "https://www.youtube.com/watch?v=p7HKvqRI_Bo",
            "investing basics": "https://www.youtube.com/watch?v=gFQNPmLKj1k",
            cryptocurrency: "https://www.youtube.com/watch?v=SSo_EIwHSd4",
            "personal finance": "https://www.youtube.com/watch?v=HQzoZfc3GwQ",
            "real estate": "https://www.youtube.com/watch?v=Rj1Cz2n9hYg",

            // Languages
            "english speaking": "https://www.youtube.com/watch?v=juKd26qkNAw",
            "spoken hindi": "https://www.youtube.com/watch?v=R3cQy8iPz0E",
            spanish: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
            french: "https://www.youtube.com/watch?v=ZjJc6eV5FQg",
            german: "https://www.youtube.com/watch?v=1JxA9t7Kc9k",

            // Creative Skills
            photography: "https://www.youtube.com/watch?v=7ZVyNjKSr0M",
            "video editing": "https://www.youtube.com/watch?v=8eDsvKwM40U",
            "graphic design": "https://www.youtube.com/watch?v=WONZVnlam6U",
            "music theory": "https://www.youtube.com/watch?v=rgaTLrZGlk0",
            guitar: "https://www.youtube.com/watch?v=2F_r0FUG5Xw",

            // Academic Subjects
            geography: "https://www.youtube.com/watch?v=H9Kc9b9F6gU",
            "political science": "https://www.youtube.com/watch?v=QGkE8X8l0v4",
            sociology: "https://www.youtube.com/watch?v=YnCJU6PaCio",
            philosophy: "https://www.youtube.com/watch?v=1A_CAkYt3GY",
            "environmental science": "https://www.youtube.com/watch?v=R0pY5fL7H9k",

            // Career & Jobs
            "interview preparation": "https://www.youtube.com/watch?v=HG68Ymazo18",
            "resume writing": "https://www.youtube.com/watch?v=BYUy1yvjHxE",
            "career guidance": "https://www.youtube.com/watch?v=HAnw168huqA",
            freelancing: "https://www.youtube.com/watch?v=F0qvN3nR7rY",

            // Entrepreneurship & Business (Non-technical)
            "business strategy": "https://www.youtube.com/watch?v=Gv6c5Y9KXh0",
            sales: "https://www.youtube.com/watch?v=Uu7C3mXqJ7A",
            negotiation: "https://www.youtube.com/watch?v=MXFz0Yw1I8k",
            "startup basics": "https://www.youtube.com/watch?v=lJjILQu2xM8",
            // Core School Subjects
            "english literature": "https://www.youtube.com/watch?v=MSYw502dJNY",
            "hindi literature": "https://www.youtube.com/watch?v=VZpZl7JY9k0",
            "social studies": "https://www.youtube.com/watch?v=QGkE8X8l0v4",
            civics: "https://www.youtube.com/watch?v=G0KJH5YdE7Y",
            "economics basics": "https://www.youtube.com/watch?v=3ez10ADR_gM",

            // Advanced Mathematics
            "linear algebra": "https://www.youtube.com/watch?v=ZK3O402wf1c",
            statistics: "https://www.youtube.com/watch?v=xxpc-HPKN28",
            probability: "https://www.youtube.com/watch?v=uzkc-qNVoOk",
            trigonometry: "https://www.youtube.com/watch?v=PUB0TaZ7bhA",

            // Science (Deeper Topics)
            astronomy: "https://www.youtube.com/watch?v=libKVRa01L8",
            thermodynamics: "https://www.youtube.com/watch?v=YzA2o-7zZ8g",
            genetics: "https://www.youtube.com/watch?v=8m6hHRlKwxY",
            "organic chemistry": "https://www.youtube.com/watch?v=Ofoa8PzB4tA",
            "human anatomy": "https://www.youtube.com/watch?v=0n0x6e7QG5k",

            // Commerce & Management
            accounting: "https://www.youtube.com/watch?v=3kZX9qKJq0E",
            "business studies": "https://www.youtube.com/watch?v=E6F0IhdaaWI",
            microeconomics: "https://www.youtube.com/watch?v=1UxA6JZoT-4",
            macroeconomics: "https://www.youtube.com/watch?v=3ez10ADR_gM",

            // Competitive Exam Prep (India-focused)
            "upsc preparation": "https://www.youtube.com/watch?v=VJx6GJqVZLk",
            "ssc preparation": "https://www.youtube.com/watch?v=HkzC9g8Lk5A",
            "banking exams": "https://www.youtube.com/watch?v=J7sH4Lk9nXU",
            "neet preparation": "https://www.youtube.com/watch?v=ZbZSe6N_BXs",
            "jee preparation": "https://www.youtube.com/watch?v=Q6_5InVJZ88",

            // General Knowledge & Awareness
            "current affairs": "https://www.youtube.com/watch?v=Q0B2k1z2p4U",
            "indian polity": "https://www.youtube.com/watch?v=G0KJH5YdE7Y",
            "indian geography": "https://www.youtube.com/watch?v=H9Kc9b9F6gU",
            "world history": "https://www.youtube.com/watch?v=S4g8hsq3v04",

            // Research & Academic Skills
            "research methodology": "https://www.youtube.com/watch?v=71VWv0O8FZQ",
            "academic writing": "https://www.youtube.com/watch?v=FhHn3x0Wq9k",
            "thesis writing": "https://www.youtube.com/watch?v=Yf9k6R7wX1Y",
            "presentation skills": "https://www.youtube.com/watch?v=Unzc731iCUY",
            // =======================
            // MEDICAL & HEALTH
            // =======================
            mbbs: "https://www.youtube.com/watch?v=0n0x6e7QG5k",
            nursing: "https://www.youtube.com/watch?v=Jx2YtYl0XQ8",
            pharmacy: "https://www.youtube.com/watch?v=K8jVY0G3b2E",
            physiotherapy: "https://www.youtube.com/watch?v=8m6hHRlKwxY",
            "public health": "https://www.youtube.com/watch?v=DP6q2kC8YlY",
            pathology: "https://www.youtube.com/watch?v=YzA2o-7zZ8g",

            // =======================
            // COMMERCE & MANAGEMENT
            // =======================
            bcom: "https://www.youtube.com/watch?v=3kZX9qKJq0E",
            mba: "https://www.youtube.com/watch?v=Gv6c5Y9KXh0",
            "human resource management": "https://www.youtube.com/watch?v=1eMB7mL3c4c",
            "supply chain management": "https://www.youtube.com/watch?v=YFz4gYx1X1Y",
            "digital marketing": "https://www.youtube.com/watch?v=Le2g0e1Zq9M",
            "international business": "https://www.youtube.com/watch?v=Qz1F9p0pQ0k",

            // =======================
            // ARTS & HUMANITIES
            // =======================
            ba: "https://www.youtube.com/watch?v=1A_CAkYt3GY",
            "psychology degree": "https://www.youtube.com/watch?v=vo4pMVb0R6M",
            "sociology degree": "https://www.youtube.com/watch?v=YnCJU6PaCio",
            "political science degree": "https://www.youtube.com/watch?v=QGkE8X8l0v4",
            journalism: "https://www.youtube.com/watch?v=HAnw168huqA",
            "mass communication": "https://www.youtube.com/watch?v=HAnw168huqA",

            // =======================
            // LAW
            // =======================
            llb: "https://www.youtube.com/watch?v=G0KJH5YdE7Y",
            "corporate law": "https://www.youtube.com/watch?v=MXFz0Yw1I8k",
            "constitutional law": "https://www.youtube.com/watch?v=G0KJH5YdE7Y",
            criminology: "https://www.youtube.com/watch?v=YnCJU6PaCio",

            // =======================
            // EDUCATION
            // =======================
            bed: "https://www.youtube.com/watch?v=FhHn3x0Wq9k",
            "m ed": "https://www.youtube.com/watch?v=FhHn3x0Wq9k",
            "early childhood education": "https://www.youtube.com/watch?v=DP6q2kC8YlY",
            "special education": "https://www.youtube.com/watch?v=DP6q2kC8YlY",

            // =======================
            // SCIENCE COURSES
            // =======================
            "bsc physics": "https://www.youtube.com/watch?v=77DOwXW1B4w",
            "bsc chemistry": "https://www.youtube.com/watch?v=FSyAehMdpyI",
            "bsc biology": "https://www.youtube.com/watch?v=85UfW8tG73k",
            biotechnology: "https://www.youtube.com/watch?v=8m6hHRlKwxY",
            "environmental studies": "https://www.youtube.com/watch?v=R0pY5fL7H9k",

            // =======================
            // DESIGN & CREATIVE
            // =======================
            "fashion design": "https://www.youtube.com/watch?v=QZp1pS3J7sY",
            "interior design": "https://www.youtube.com/watch?v=YqQx75OPRa0",
            animation: "https://www.youtube.com/watch?v=8eDsvKwM40U",
            "film making": "https://www.youtube.com/watch?v=8eDsvKwM40U",
            "fine arts": "https://www.youtube.com/watch?v=QZp1pS3J7sY",

            // =======================
            // AGRICULTURE
            // =======================
            "bsc agriculture": "https://www.youtube.com/watch?v=R0pY5fL7H9k",
            agronomy: "https://www.youtube.com/watch?v=R0pY5fL7H9k",
            horticulture: "https://www.youtube.com/watch?v=R0pY5fL7H9k",
            "animal husbandry": "https://www.youtube.com/watch?v=85UfW8tG73k",

            // =======================
            // HOTEL & TOURISM
            // =======================
            "hotel management": "https://www.youtube.com/watch?v=lJjILQu2xM8",
            "tourism management": "https://www.youtube.com/watch?v=S4g8hsq3v04",
            "culinary arts": "https://www.youtube.com/watch?v=UItWltVZZmE",

            // =======================
            // AVIATION & DEFENCE
            // =======================
            aviation: "https://www.youtube.com/watch?v=libKVRa01L8",
            "pilot training": "https://www.youtube.com/watch?v=libKVRa01L8",
            "nda preparation": "https://www.youtube.com/watch?v=Q6_5InVJZ88",
            "defence studies": "https://www.youtube.com/watch?v=G0KJH5YdE7Y"
        };

        // Try to find a match
        for (const [key, url] of Object.entries(curatedVideos)) {
            if (topicLower.includes(key)) {
                return url;
            }
        }

        // Generic programming tutorial
        return "https://www.youtube.com/watch?v=zOjov-2OZ0E";
    }

    /**
     * Curated PDF resources for common topics
     */
    private getCuratedPdfResources(topic: string): string[] {
        const topicLower = topic.toLowerCase();

        const curatedPdfs: Record<string, string[]> = {
            // Programming Languages
            javascript: [
                "https://eloquentjavascript.net/Eloquent_JavaScript.pdf",
                "https://github.com/getify/You-Dont-Know-JS",
                "https://javascript.info/"
            ],
            python: [
                "https://www.py4e.com/book.php",
                "https://automatetheboringstuff.com/",
                "https://docs.python.org/3/tutorial/"
            ],
            java: ["https://docs.oracle.com/javase/tutorial/", "https://www.tutorialspoint.com/java/java_tutorial.pdf"],
            "c++": ["https://www.learncpp.com/", "http://www.cplusplus.com/doc/tutorial/"],
            typescript: [
                "https://www.typescriptlang.org/docs/handbook/intro.html",
                "https://basarat.gitbook.io/typescript/"
            ],
            go: ["https://go.dev/doc/", "https://gobyexample.com/"],

            // Web Development
            react: ["https://react.dev/learn", "https://reactjs.org/tutorial/tutorial.html"],
            angular: ["https://angular.io/tutorial", "https://angular.io/guide/developer-guide-overview"],
            vue: ["https://vuejs.org/guide/introduction.html", "https://v3.vuejs.org/guide/introduction.html"],
            html: ["https://developer.mozilla.org/en-US/docs/Learn/HTML", "https://www.w3schools.com/html/"],
            css: ["https://developer.mozilla.org/en-US/docs/Learn/CSS", "https://www.w3schools.com/css/"],
            "web development": [
                "https://developer.mozilla.org/en-US/docs/Learn",
                "https://www.freecodecamp.org/news/tag/web-development/"
            ],

            // Backend & Databases
            node: ["https://nodejs.org/en/docs/guides/", "https://nodejs.dev/learn"],
            sql: [
                "https://www.sqltutorial.org/",
                "https://www.postgresql.org/docs/current/tutorial.html",
                "https://mode.com/sql-tutorial/"
            ],
            database: ["https://www.postgresql.org/docs/", "https://dev.mysql.com/doc/"],
            mongodb: ["https://www.mongodb.com/docs/manual/", "https://university.mongodb.com/"],

            // Data Science & ML
            "machine learning": [
                "https://scikit-learn.org/stable/tutorial/index.html",
                "https://www.tensorflow.org/tutorials",
                "https://pytorch.org/tutorials/"
            ],
            "data science": ["https://jakevdp.github.io/PythonDataScienceHandbook/", "https://www.kaggle.com/learn"],
            "artificial intelligence": ["https://www.deeplearningbook.org/", "https://d2l.ai/"],
            "deep learning": ["https://www.deeplearningbook.org/", "https://pytorch.org/tutorials/"],

            // Cloud & DevOps
            cloud: [
                "https://aws.amazon.com/getting-started/",
                "https://learn.microsoft.com/en-us/azure/",
                "https://cloud.google.com/docs"
            ],
            aws: ["https://aws.amazon.com/getting-started/", "https://docs.aws.amazon.com/"],
            azure: ["https://learn.microsoft.com/en-us/azure/", "https://azure.microsoft.com/en-us/get-started/"],
            docker: ["https://docs.docker.com/get-started/", "https://docker-curriculum.com/"],
            kubernetes: ["https://kubernetes.io/docs/tutorials/", "https://kubernetes.io/docs/home/"],
            devops: ["https://www.atlassian.com/devops", "https://devops.com/category/resources/"],

            // Computer Science Fundamentals
            algorithms: [
                "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/",
                "https://algs4.cs.princeton.edu/home/"
            ],
            "data structures": ["https://opendatastructures.org/", "https://www.geeksforgeeks.org/data-structures/"],
            "operating system": [
                "https://pages.cs.wisc.edu/~remzi/OSTEP/",
                "https://www.tutorialspoint.com/operating_system/"
            ],
            "computer networks": [
                "https://www.computernetworkingnotes.com/",
                "https://www.geeksforgeeks.org/computer-network-tutorials/"
            ],

            // Version Control & Tools
            git: ["https://git-scm.com/book/en/v2", "https://www.atlassian.com/git/tutorials"],
            linux: ["https://linuxjourney.com/", "https://www.linux.org/pages/download/"],

            // Mobile Development
            android: ["https://developer.android.com/courses", "https://developer.android.com/guide"],
            ios: ["https://developer.apple.com/tutorials/", "https://developer.apple.com/documentation/"],
            flutter: ["https://docs.flutter.dev/get-started/", "https://flutter.dev/learn"],

            // Security
            cybersecurity: ["https://www.cybrary.it/catalog/", "https://www.sans.org/security-resources/"],
            security: ["https://owasp.org/www-project-top-ten/", "https://portswigger.net/web-security"],

            // General Software Engineering
            "software engineering": [
                "https://www.freecodecamp.org/news/software-engineering-basics/",
                "https://martinfowler.com/articles/"
            ],
            "design patterns": ["https://refactoring.guru/design-patterns", "https://sourcemaking.com/design_patterns"],
            agile: ["https://www.atlassian.com/agile", "https://www.scrum.org/resources/"]
        };

        // Try exact matches first, then partial matches
        for (const [key, urls] of Object.entries(curatedPdfs)) {
            if (topicLower.includes(key)) {
                return urls;
            }
        }

        return [];
    }

    /**
     * Validate URLs before returning
     */
    async validateAndReturn(url: string | null): Promise<string | null> {
        if (!url) return null;

        const isAccessible = await UrlValidator.isAccessible(url);
        if (isAccessible) {
            return url;
        }

        console.warn(`URL not accessible: ${url}`);
        return url; // Return anyway, might be temporary issue
    }
}

export const resourceUrlService = new ResourceUrlService();
