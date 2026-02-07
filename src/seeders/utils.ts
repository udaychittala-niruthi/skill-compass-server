import { getJsonCompletion } from "../services/groq";

export interface SeederItem {
    name: string;
    icon: string;
    iconLibrary: string;
}

export async function resolveIconsAndGenerateNew(
    itemsToEnrich: string[],
    knownItemNames: string[],
    type: 'skill' | 'interest',
    countToGenerate: number = 20
): Promise<SeederItem[]> {
    const chunkSize = 30;
    let results: SeederItem[] = [];

    // 1. Process items that need icons
    if (itemsToEnrich.length > 0) {
        console.log(`Enriching ${itemsToEnrich.length} ${type}s with icons...`);
        for (let i = 0; i < itemsToEnrich.length; i += chunkSize) {
            const chunk = itemsToEnrich.slice(i, i + chunkSize);
            console.log(`Processing ${type} enrichment chunk ${Math.ceil((i + 1) / chunkSize)} of ${Math.ceil(itemsToEnrich.length / chunkSize)}...`);

            try {
                const prompt = `
                    I have a list of ${type}s: ${JSON.stringify(chunk)}.
                    For each item in this list, return an object with:
                    - "name": The exact name from the input list.
                    - "icon": A suitable icon name from Expo Vector Icons (e.g., "account", "cog", "code-tags").
                    - "iconLibrary": One of "MaterialCommunityIcons", "MaterialIcons", "FontAwesome", "Ionicons".
                    
                    Return a JSON object with a key "items" which is an array of these objects.
                `;

                const response = await getJsonCompletion<{ items: SeederItem[] }>(prompt);
                if (response && response.items) {
                    results.push(...response.items);
                }
            } catch (e) {
                console.error(`Error processing chunk ${i} for ${type}:`, e);
                chunk.forEach(item => {
                    results.push({
                        name: item,
                        icon: "help-circle-outline",
                        iconLibrary: "MaterialCommunityIcons"
                    });
                });
            }
        }
    } else {
        console.log(`No existing ${type}s need enrichment (all have icons).`);
    }

    // 2. Generate NEW items
    if (countToGenerate > 0) {
        console.log(`Generating ${countToGenerate} new ${type}s...`);
        try {
            // Use a subset of known items for exclusions to avoid token limits
            const exclusionList = knownItemNames.slice(0, 100);

            const prompt = `
                Generate ${countToGenerate} NEW, distinct, and popular ${type}s that are meaningful and modern.
                Do NOT include these existing ones: ${JSON.stringify(exclusionList)}...
                For each new item, provide:
                - "name": The name of the ${type} (Capitalized).
                - "icon": A suitable icon name.
                - "iconLibrary": One of "MaterialCommunityIcons", "MaterialIcons", "FontAwesome", "Ionicons".
                
                Return a JSON object with a key "items" which is an array of these objects.
            `;

            const response = await getJsonCompletion<{ items: SeederItem[] }>(prompt);
            if (response && response.items) {
                results.push(...response.items);
            }
        } catch (e) {
            console.error(`Error generating new ${type}s:`, e);
        }
    }

    return results;
}

// ... existing code ...

export async function generateCoursesContextual(
    skills: string[],
    interests: string[],
    existingCourseNames: string[],
    countToGenerate: number = 20
): Promise<(SeederItem & { category: string })[]> {
    console.log(`Generating ${countToGenerate} courses based on ${skills.length} skills and ${interests.length} interests...`);

    // Limits inputs to avoid token overflow
    const skillContext = skills.slice(0, 50).join(", ");
    const interestContext = interests.slice(0, 30).join(", ");
    const exclusionList = existingCourseNames.slice(0, 100);

    try {
        const prompt = `
            I need to generate a list of relevant educational courses (degrees, diplomas, certifications) based on the following context:
            
            Top Skills: ${skillContext}...
            Top Interests: ${interestContext}...
            
            Generate ${countToGenerate} distinct, real-world course names that would help a user with these skills or interests.
            DO NOT include these existing courses: ${JSON.stringify(exclusionList)}...
            
            For each course, provide:
            - "name": The official name of the course (e.g., "B.Tech in Computer Science", "Certified Digital Marketer").
            - "category": A broad category for the course (e.g., "TECH", "COMMERCE", "ARTS", "MEDICAL", "DIPLOMA", "CERTIFICATION").
            - "icon": A suitable icon name from Expo Vector Icons.
            - "iconLibrary": One of "MaterialCommunityIcons", "MaterialIcons", "FontAwesome", "Ionicons".
            
            Output strictly in valid JSON format with structure:
            {
                "items": [
                    { "name": "Course Name", "category": "CATEGORY", "icon": "icon-name", "iconLibrary": "LibraryName" }
                ]
            }
        `;

        const response = await getJsonCompletion<{ items: (SeederItem & { category: string })[] }>(prompt);
        return response?.items || [];
    } catch (e) {
        console.error("Error generating contextual courses:", e);
        return [];
    }
}

export async function resolveCoursesAndGenerateNew(
    itemsToEnrich: { name: string, category: string }[],
    knownCourseNames: string[],
    skills: string[],
    interests: string[],
    countToGenerate: number = 20
): Promise<(SeederItem & { category: string })[]> {
    const results: (SeederItem & { category: string })[] = [];

    // 1. Enrich existing items
    if (itemsToEnrich.length > 0) {
        const chunkSize = 20;
        console.log(`Enriching ${itemsToEnrich.length} courses with icons...`);

        for (let i = 0; i < itemsToEnrich.length; i += chunkSize) {
            const chunk = itemsToEnrich.slice(i, i + chunkSize);
            try {
                const prompt = `
                    I have a list of courses: ${JSON.stringify(chunk)}.
                    For each course, provide:
                    - "name": The exact name from input.
                    - "category": The exact category from input.
                    - "icon": A suitable icon name from Expo Vector Icons.
                    - "iconLibrary": One of "MaterialCommunityIcons", "MaterialIcons", "FontAwesome", "Ionicons".
                    
                    Return JSON with key "items".
                `;
                const response = await getJsonCompletion<{ items: (SeederItem & { category: string })[] }>(prompt);
                if (response?.items) results.push(...response.items);
            } catch (e) {
                console.error(`Error enriching course chunk ${i}:`, e);
                // Fallback
                chunk.forEach(item => results.push({ ...item, icon: "school", iconLibrary: "MaterialIcons" }));
            }
        }
    }

    // 2. Generate new
    if (countToGenerate > 0) {
        const newCourses = await generateCoursesContextual(skills, interests, knownCourseNames, countToGenerate);
        results.push(...newCourses);
    }

    return results;
}

