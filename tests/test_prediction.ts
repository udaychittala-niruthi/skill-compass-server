import axios from 'axios';
import { sequelize, Interest, Skill, Course, Branches } from '../src/models';

const API_URL = 'http://localhost:5003/api/common';
// Should use an auth token. For simplicity, tests assume valid token or middleware disabled for testing.
// But middleware IS enabled. So we need to login first.
const AUTH_URL = 'http://localhost:5003/api/auth';

async function testPredictionFlow() {
    try {
        console.log("--- Starting Prediction API Tests ---");

        // 1. Login to get token
        const loginRes = await axios.post(`${AUTH_URL}/login`, {
            email: "testUser_100@example.com", // Adjust if needed or register fresh
            password: "password123"
        }).catch(async (e) => {
            // If login fails, register a temp user
            const email = `predUser_${Date.now()}@test.com`;
            const reg = await axios.post(`${AUTH_URL}/register`, {
                name: "Prediction Tester",
                email,
                password: "password123",
                age: 22
            });
            return reg;
        });

        const token = loginRes.data.body?.token || loginRes.data.data?.token; // Handle body/data structure
        if (!token) throw new Error("Failed to get token for testing.");
        console.log("✅ Authenticated.");

        const headers = { Authorization: `Bearer ${token}` };

        // 2. Fetch Metadata
        console.log("2. Fetching Metadata...");
        const interestsRes = await axios.get(`${API_URL}/interests`, { headers });
        const skillsRes = await axios.get(`${API_URL}/skills`, { headers });
        const coursesRes = await axios.get(`${API_URL}/courses`, { headers });

        console.log("Full Interests Response:", JSON.stringify(interestsRes.data, null, 2));

        const interests = interestsRes.data.body || interestsRes.data.data;
        const skills = skillsRes.data.body || skillsRes.data.data;
        const courses = coursesRes.data.body || coursesRes.data.data;

        console.log(`   Interests: ${interests?.length} found.`);
        console.log(`   Skills: ${skills?.length} found.`);
        console.log(`   Courses: ${courses?.length} found.`);

        // 3. Test Course Prediction
        console.log("3. Testing Course Prediction...");

        // Pick some IDs (mocking selection)
        // If DB is empty, this will fail or prompt needs seeding. Assuming seeded.
        const interestIds = [1, 2]; // e.g. Tech related
        const skillIds = [1];

        const coursePredRes = await axios.post(`${API_URL}/predict/course`, {
            interestIds,
            skillIds
        }, { headers });

        const coursePredictions = coursePredRes.data.body || coursePredRes.data.data;
        console.log("   Course Prediction Result:", JSON.stringify(coursePredictions, null, 2));

        if (!coursePredictions || coursePredictions.length === 0) {
            console.warn("   ⚠️ No course predictions returned. Check DB seeding or Groq API.");
        } else {
            console.log("   ✅ Course Prediction working.");
            const firstCourseId = coursePredictions[0].id;

            // 4. Test Branch Prediction
            const branchPredRes = await axios.post(`${API_URL}/predict/branch`, {
                interestIds,
                skillIds,
                courseId: firstCourseId
            }, { headers });

            const branchPredictions = branchPredRes.data.body || branchPredRes.data.data;
            console.log("   Branch Prediction Result:", JSON.stringify(branchPredictions, null, 2));

            if (branchPredictions && branchPredictions.length > 0) {
                console.log("   ✅ Branch Prediction working.");
            } else {
                console.warn("   ⚠️ No branch predictions (might be expected if course has no branches).");
            }
        }

    } catch (error: any) {
        console.error("❌ Test Failed:", error.response?.data || error.message);
    }
}

testPredictionFlow();
