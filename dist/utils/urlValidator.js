/**
 * URL Validation Utilities
 * Validates various types of URLs and checks accessibility
 */
import https from "https";
import http from "http";
import { URL } from "url";
export class UrlValidator {
    /**
     * Validate if string is a valid URL
     */
    static isValidUrl(urlString) {
        try {
            new URL(urlString);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Check if URL is accessible (returns 200-399 status)
     */
    static async isAccessible(urlString) {
        if (!this.isValidUrl(urlString)) {
            return false;
        }
        return new Promise((resolve) => {
            try {
                const url = new URL(urlString);
                const protocol = url.protocol === "https:" ? https : http;
                const request = protocol.request({
                    method: "HEAD",
                    hostname: url.hostname,
                    path: url.pathname + url.search,
                    timeout: 5000
                }, (response) => {
                    resolve(response.statusCode ? response.statusCode < 400 : false);
                });
                request.on("error", () => resolve(false));
                request.on("timeout", () => {
                    request.destroy();
                    resolve(false);
                });
                request.end();
            }
            catch {
                resolve(false);
            }
        });
    }
    /**
     * Validate YouTube URL format
     */
    static isYouTubeUrl(urlString) {
        if (!this.isValidUrl(urlString)) {
            return false;
        }
        try {
            const url = new URL(urlString);
            return (url.hostname === "www.youtube.com" ||
                url.hostname === "youtube.com" ||
                url.hostname === "youtu.be" ||
                url.hostname === "m.youtube.com");
        }
        catch {
            return false;
        }
    }
    /**
     * Check if URL likely points to a PDF
     */
    static isPdfUrl(urlString) {
        if (!this.isValidUrl(urlString)) {
            return false;
        }
        const lowerUrl = urlString.toLowerCase();
        return lowerUrl.endsWith(".pdf") || lowerUrl.includes(".pdf?");
    }
    /**
     * Validate all resource URLs in a module object
     */
    static async validateResourceUrls(urls) {
        const results = {
            contentUrl: false,
            thumbnailUrl: false,
            resources: []
        };
        if (urls.contentUrl) {
            results.contentUrl = await this.isAccessible(urls.contentUrl);
        }
        if (urls.thumbnailUrl) {
            results.thumbnailUrl = await this.isAccessible(urls.thumbnailUrl);
        }
        if (urls.resources && Array.isArray(urls.resources)) {
            results.resources = await Promise.all(urls.resources.map((url) => this.isAccessible(url)));
        }
        return results;
    }
}
