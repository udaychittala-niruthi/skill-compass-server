#!/bin/bash

# Corrected onboarding test with proper endpoints

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:5003/api"

echo "========================================="
echo "Onboarding & Path Generation - CORRECTED"
echo "========================================="
echo ""

# Test all 3 users
declare -A USERS
USERS[COLLEGE]="testUser_26505@example.com"
USERS[PROFESSIONAL]="testUser_21730@example.com"
USERS[SENIOR]="testUser_52549@example.com"

PASSWORD="password123"

for USER_TYPE in COLLEGE PROFESSIONAL SENIOR; do
    EMAIL="${USERS[$USER_TYPE]}"
    
    echo "${BLUE}Testing $USER_TYPE user: $EMAIL${NC}"
    echo "========================================"
    
    # Login
    LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
    
    TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.body.token // empty')
    
    if [ -z "$TOKEN" ]; then
        echo -e "${RED}✗${NC} Failed to login as $USER_TYPE"
        continue
    fi
    
    echo -e "${GREEN}✓${NC} Logged in successfully"
    
    # Re-onboard based on user type
    if [ "$USER_TYPE" == "COLLEGE" ]; then
        ENDPOINT="/onboarding/students/details"
        DATA='{
            "courseId": 1,
            "branchId": 1,
            "skills": [1, 2, 3],
            "bio": "Testing learning path generation for college student"
        }'
    elif [ "$USER_TYPE" == "PROFESSIONAL" ]; then
        ENDPOINT="/onboarding/professionals/details"
        DATA='{
            "currentRole": "Software Engineer",
            "industry": "Technology",
            "yearsOfExperience": 5,
            "skills": [1, 2, 3],
            "bio": "Testing learning path generation for professional"
        }'
    else
        ENDPOINT="/onboarding/seniors/details"
        DATA='{
            "interestIds": [1, 2],
            "bio": "Testing learning path generation for senior",
            "accessibilitySettings": {"fontSize": "large"}
        }'
    fi
    
    echo "   Re-onboarding via $ENDPOINT..."
    ONBOARD_RESPONSE=$(curl -s -X POST "$BASE_URL$ENDPOINT" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$DATA")
    
    ONBOARD_STATUS=$(echo $ONBOARD_RESPONSE | jq -r '.status')
    if [ "$ONBOARD_STATUS" == "true" ]; then
        echo -e "   ${GREEN}✓${NC} Onboarding successful - path generation triggered"
    else
        echo -e "   ${RED}✗${NC} Onboarding failed"
        echo "   Response: $ONBOARD_RESPONSE"
    fi
    
    echo ""
done

# Wait for generation
echo "${YELLOW}⏳ Waiting 15 seconds for path generation...${NC}"
sleep 15
echo ""

# Check results for each user
for USER_TYPE in COLLEGE PROFESSIONAL SENIOR; do
    EMAIL="${USERS[$USER_TYPE]}"
    
    echo "${BLUE}Checking results for $USER_TYPE${NC}"
    echo "===================================="
    
    # Login again
    TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" | jq -r '.body.token')
    
    # Check status
    STATUS_RESPONSE=$(curl -s -X GET "$BASE_URL/learning-path/status" \
      -H "Authorization: Bearer $TOKEN")
    
    GEN_STATUS=$(echo $STATUS_RESPONSE | jq -r '.body.status')
    
    if [ "$GEN_STATUS" == "completed" ]; then
        echo -e "${GREEN}✓${NC} Path generation completed"
        
        # Get path
        PATH_RESPONSE=$(curl -s -X GET "$BASE_URL/learning-path/my-path" \
          -H "Authorization: Bearer $TOKEN")
        
        MODULE_COUNT=$(echo $PATH_RESPONSE | jq -r '.body.modules | length')
        echo "   Modules generated: $MODULE_COUNT"
        
        # Get schedule
        SCHEDULE_RESPONSE=$(curl -s -X GET "$BASE_URL/learning-schedule/my-schedule" \
          -H "Authorization: Bearer $TOKEN")
        
        SCHEDULE_COUNT=$(echo $SCHEDULE_RESPONSE | jq -r '.body | length')
        echo "   Schedule periods: $SCHEDULE_COUNT"
        
    elif [ "$GEN_STATUS" == "generating" ]; then
        echo -e "${YELLOW}⏳${NC} Still generating..."
    elif [ "$GEN_STATUS" == "failed" ]; then
        ERROR=$(echo $STATUS_RESPONSE | jq -r '.body.error')
        echo -e "${RED}✗${NC} Generation failed: $ERROR"
    else
        echo -e "${YELLOW}⚠${NC}  No path found (status: $GEN_STATUS)"
    fi
    
    echo ""
done

echo "========================================="
echo "Test Complete"
echo "========================================="
