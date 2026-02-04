import axios from 'axios';
import { sequelize } from '../src/models';

const API_URL = 'http://localhost:5003/api'; // Adjust port if necessary
const API_KEY = process.env.VITE_API_KEY || "skill-compass-api-key"; // Assuming API key might be needed or just JWT

// Helper to generate random email
const randomEmail = () => `testUser_${Math.floor(Math.random() * 100000)}@example.com`;

async function testGenericOnboarding(
    userType: string,
    age: number,
    onboardingEndpoint: string,
    onboardingData: any
) {
    console.log(`\n--- Testing ${userType} Flow (Age: ${age}) ---`);
    const email = randomEmail();
    const password = 'password123';
    const name = `${userType} Test User`;

    try {
        // 1. Register
        console.log(`1. Registering user...`);
        const regRes = await axios.post(`${API_URL}/auth/register`, {
            name,
            email,
            password,
            age
        });
        console.log('Registration Response:', JSON.stringify(regRes.data, null, 2));
        const { token, user } = regRes.data.body || {};
        if (!token) throw new Error("Token missing from registration response");
        console.log(`   Registered User ID: ${user.id}, Group: ${user.group}`);

        // 2. Check Onboarding Status (Should be false)
        console.log(`2. Checking pre-onboarding status...`);
        try {
            const statusRes = await axios.get(`${API_URL}/onboarding/status`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`   Status: ${statusRes.data.body.isOnboarded}`);
        } catch (e: any) {
            console.error(`   Failed to check status: ${e.response?.data?.message || e.message}`);
        }

        // 3. Try to access protected route (Should fail or be restricted)
        // Adjust endpoint to one that strictly requires onboarding if available, 
        // or rely on the fact that we are testing the onboarding endpoint itself specifically.
        // For now, let's proceed to onboarding.

        // 4. Perform Onboarding
        console.log(`3. Performing onboarding...`);
        const onboardRes = await axios.post(`${API_URL}/onboarding/${onboardingEndpoint}`, onboardingData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`   Onboarding response: ${onboardRes.status} - ${onboardRes.data.message}`);

        // 5. Check Onboarding Status (Should be true)
        console.log(`4. Checking post-onboarding status...`);
        const statusResAfter = await axios.get(`${API_URL}/onboarding/status`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const isNowOnboarded = statusResAfter.data.body.isOnboarded;
        console.log(`   Status: ${isNowOnboarded}`);

        if (isNowOnboarded) {
            console.log(`✅ ${userType} Onboarding Successful!`);
        } else {
            console.error(`❌ ${userType} Onboarding Failed - Status didn't update.`);
        }

    } catch (error: any) {
        console.error(`❌ Error in ${userType} flow:`, error.response?.data || error.message);
    }
}

async function runTests() {
    try {
        await sequelize.authenticate();
        console.log('Database connected for verification.');
    } catch (e) {
        console.error('DB Connection failed, proceeding with API verification only.');
    }

    // 1. Check Kid (Age 10)
    await testGenericOnboarding('KIDS', 10, 'kids/profile', {
        avatar: 'superhero_1.png',
        bio: 'I love coding games!'
    });

    // 2. Check Teen (Age 15)
    await testGenericOnboarding('TEENS', 15, 'teens/interests', {
        interestIds: [1, 2], // Assuming these IDs exist or aren't foreign key checked strictly yet if seeded data is empty
        skillIds: [1],
        bio: 'Interested in web dev.'
    });

    // 3. Check Student (Age 20)
    await testGenericOnboarding('COLLEGE_STUDENTS', 20, 'students/details', {
        courseId: 1, // Need valid ID if FK constraint exists
        branchId: 1, // Need valid ID if FK constraint exists
        skills: [1, 3],
        bio: 'CS Student'
    });

    // 4. Check Professional (Age 30)
    await testGenericOnboarding('PROFESSIONALS', 30, 'professionals/details', {
        currentRole: 'Software Engineer',
        industry: 'Tech',
        yearsOfExperience: 5,
        skills: [1, 4],
        bio: 'Full stack dev'
    });

    // 5. Check Senior (Age 65)
    await testGenericOnboarding('SENIORS', 65, 'seniors/details', {
        interestIds: [3],
        bio: 'Learning basic computer skills',
        accessibilitySettings: { fontSize: 'large' }
    });

    console.log('\n--- All Tests Completed ---');
}

runTests();
