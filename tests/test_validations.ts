import axios from 'axios';

const API_URL = 'http://localhost:5003/api';

async function testValidations() {
    try {
        console.log("--- Testing Joi Validations ---\n");

        // 1. Register and login
        const email = `testValidation_${Date.now()}@test.com`;
        await axios.post(`${API_URL}/auth/register`, {
            name: "Validation Tester",
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

        console.log(`✅ Authenticated as COLLEGE_STUDENTS\n`);

        // Test 1: Course Prediction - Missing interestIds
        console.log("🧪 Test 1: Course Prediction with missing interestIds");
        try {
            await axios.post(`${API_URL}/common/predict/course`, {
                skillIds: [1]
            }, { headers });
            console.log("   ❌ FAILED: Should have been rejected!\n");
        } catch (error: any) {
            if (error.response?.status === 400) {
                console.log(`   ✅ PASSED: Validation failed as expected`);
                console.log(`   Error: ${error.response.data.error}\n`);
            } else {
                console.log(`   ⚠️  Unexpected status: ${error.response?.status}\n`);
            }
        }

        // Test 2: Course Prediction - Empty array
        console.log("🧪 Test 2: Course Prediction with empty interestIds array");
        try {
            await axios.post(`${API_URL}/common/predict/course`, {
                interestIds: [],
                skillIds: [1]
            }, { headers });
            console.log("   ❌ FAILED: Should have been rejected!\n");
        } catch (error: any) {
            if (error.response?.status === 400) {
                console.log(`   ✅ PASSED: Validation failed as expected`);
                console.log(`   Error: ${error.response.data.error}\n`);
            } else {
                console.log(`   ⚠️  Unexpected status: ${error.response?.status}\n`);
            }
        }

        // Test 3: Branch Prediction - Missing courseId
        console.log("🧪 Test 3: Branch Prediction with missing courseId");
        try {
            await axios.post(`${API_URL}/common/predict/branch`, {
                interestIds: [1],
                skillIds: [1]
            }, { headers });
            console.log("   ❌ FAILED: Should have been rejected!\n");
        } catch (error: any) {
            if (error.response?.status === 400) {
                console.log(`   ✅ PASSED: Validation failed as expected`);
                console.log(`   Error: ${error.response.data.error}\n`);
            } else {
                console.log(`   ⚠️  Unexpected status: ${error.response?.status}\n`);
            }
        }

        // Test 4: Valid Course Prediction
        console.log("🧪 Test 4: Valid Course Prediction request");
        try {
            const res = await axios.post(`${API_URL}/common/predict/course`, {
                interestIds: [1, 2],
                skillIds: [1]
            }, { headers });
            console.log(`   ✅ PASSED: Accepted valid request`);
            console.log(`   Returned ${res.data.body?.length || 0} predictions\n`);
        } catch (error: any) {
            console.log(`   ❌ FAILED: Valid request was rejected`);
            console.log(`   Error: ${error.response?.data?.message || error.message}\n`);
        }

        // Test 5: Student Onboarding - Missing required fields
        console.log("🧪 Test 5: Student onboarding with missing courseId");
        try {
            await axios.post(`${API_URL}/onboarding/students/details`, {
                branchId: 1,
                bio: "Test"
            }, { headers });
            console.log("   ❌ FAILED: Should have been rejected!\n");
        } catch (error: any) {
            if (error.response?.status === 400) {
                console.log(`   ✅ PASSED: Validation failed as expected`);
                console.log(`   Error: ${error.response.data.error}\n`);
            } else {
                console.log(`   ⚠️  Unexpected status: ${error.response?.status}\n`);
            }
        }

        console.log("--- All Validation Tests Completed ---");

    } catch (error: any) {
        console.error("❌ Test suite failed:", error.response?.data || error.message);
    }
}

testValidations();
