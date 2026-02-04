import axios from 'axios';

const API_URL = 'http://localhost:5003/api';

async function testGroupRestrictions() {
    try {
        console.log("--- Testing Group-Based Access Control ---\n");

        // 1. Register and login as COLLEGE_STUDENTS (age 22)
        const email = `testCollege_${Date.now()}@test.com`;
        await axios.post(`${API_URL}/auth/register`, {
            name: "College Tester",
            email,
            password: "password123",
            age: 22
        });

        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email,
            password: "password123"
        });

        const token = loginRes.data.body.token;
        const headers = { Authorization: `Bearer ${token}` };

        console.log(`✅ Logged in as: ${loginRes.data.body.user.name}`);
        console.log(`   Group: ${loginRes.data.body.user.group}`);
        console.log(`   Age: ${loginRes.data.body.user.age}\n`);

        // 2. Try to access KIDS endpoint (should fail)
        console.log("🧪 Test 1: COLLEGE_STUDENTS trying to access /onboarding/kids/profile");
        try {
            await axios.post(`${API_URL}/onboarding/kids/profile`, {
                avatar: "test.png",
                bio: "testing"
            }, { headers });
            console.log("   ❌ FAILED: Should have been blocked!\n");
        } catch (error: any) {
            if (error.response?.status === 403) {
                console.log(`   ✅ PASSED: Blocked with 403`);
                console.log(`   Message: ${error.response.data.message}\n`);
            } else {
                console.log(`   ⚠️  Unexpected error: ${error.message}\n`);
            }
        }

        // 3. Try to access TEENS endpoint (should fail)
        console.log("🧪 Test 2: COLLEGE_STUDENTS trying to access /onboarding/teens/interests");
        try {
            await axios.post(`${API_URL}/onboarding/teens/interests`, {
                interestIds: [1],
                skillIds: [1],
                bio: "testing"
            }, { headers });
            console.log("   ❌ FAILED: Should have been blocked!\n");
        } catch (error: any) {
            if (error.response?.status === 403) {
                console.log(`   ✅ PASSED: Blocked with 403`);
                console.log(`   Message: ${error.response.data.message}\n`);
            } else {
                console.log(`   ⚠️  Unexpected error: ${error.message}\n`);
            }
        }

        // 4. Try to access STUDENTS endpoint (should succeed)
        console.log("🧪 Test 3: COLLEGE_STUDENTS trying to access /onboarding/students/details");
        try {
            const res = await axios.post(`${API_URL}/onboarding/students/details`, {
                courseId: 1,
                branchId: 1,
                skills: [1],
                bio: "CS Student"
            }, { headers });
            console.log(`   ✅ PASSED: Successfully accessed own endpoint`);
            console.log(`   Response: ${res.data.message}\n`);
        } catch (error: any) {
            console.log(`   ❌ FAILED: Should have been allowed!`);
            console.log(`   Error: ${error.response?.data?.message || error.message}\n`);
        }

        console.log("--- All Tests Completed ---");

    } catch (error: any) {
        console.error("❌ Test suite failed:", error.response?.data || error.message);
    }
}

testGroupRestrictions();
