/**
 * Resource URL Service
 * Finds and validates real educational resources (videos, PDFs, thumbnails)
 */
import axios from "axios";
import { UrlValidator } from "../utils/urlValidator.js";
export class ResourceUrlService {
    youtubeApiKey;
    pixabayApiKey;
    constructor() {
        this.youtubeApiKey = process.env.YOUTUBE_API_KEY || "";
        this.pixabayApiKey = process.env.PIXABAY_API_KEY || "";
    }
    /**
     * Find educational video URL using YouTube API
     */
    async findVideoUrl(topic, durationMinutes) {
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
            }
        }
        catch (error) {
            console.error("YouTube API error:", error);
        }
        // Fallback to curated list
        return this.getCuratedVideoUrl(topic);
    }
    /**
     * Get duration filter for YouTube API
     */
    getVideoDurationFilter(minutes) {
        if (!minutes)
            return "any";
        if (minutes < 4)
            return "short"; // < 4 minutes
        if (minutes < 20)
            return "medium"; // 4-20 minutes
        return "long"; // > 20 minutes
    }
    /**
     * Get thumbnail from Pixabay
     */
    async findThumbnail(topic) {
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
        }
        catch (error) {
            console.error("Pixabay API error:", error);
        }
        // Fallback to placeholder
        return this.getPlaceholderThumbnail(topic);
    }
    /**
     * Get placeholder thumbnail
     */
    getPlaceholderThumbnail(topic) {
        const seed = encodeURIComponent(topic);
        return `https://picsum.photos/seed/${seed}/640/360`;
    }
    /**
     * Find PDF and learning resources
     */
    async findPdfResources(topic) {
        const resources = [];
        // Curated educational platforms
        const curatedResources = this.getCuratedPdfResources(topic);
        resources.push(...curatedResources);
        return resources;
    }
    /**
     * Generate format metadata
     */
    getFormatMetadata(moduleType, durationMinutes) {
        const formats = {
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
    getCuratedVideoUrl(topic) {
        const topicLower = topic.toLowerCase();
        const curatedVideos = {
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
            "mobile development": "https://www.youtube.com/watch?v=fis26HvvDII"
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
    getCuratedPdfResources(topic) {
        const topicLower = topic.toLowerCase();
        const curatedPdfs = {
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
    async validateAndReturn(url) {
        if (!url)
            return null;
        const isAccessible = await UrlValidator.isAccessible(url);
        if (isAccessible) {
            return url;
        }
        console.warn(`URL not accessible: ${url}`);
        return url; // Return anyway, might be temporary issue
    }
}
export const resourceUrlService = new ResourceUrlService();
