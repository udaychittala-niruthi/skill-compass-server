#!/bin/bash

# Comprehensive test including re-onboarding to trigger path generation

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:5003/api"

echo "========================================="
echo "Complete Onboarding & Path Generation Test"
echo "========================================="
echo ""

# Test credentials
COLLEGE_EMAIL="testUser_26505@example.com"
PASSWORD="password123"

echo "${BLUE}Testing Re-Onboarding to Trigger Path Generation${NC}"
echo "===================================================="
echo ""

# Login
echo "1. Authenticating..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$COLLEGE_EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.body.token // empty')

if [ ! -z "$TOKEN" ]; then
    echo -e "${GREEN}✓${NC} Logged in as COLLEGE_STUDENTS"
    USER_ID=$(echo $LOGIN_RESPONSE | jq -r '.body.user.id')
    echo "   User ID: $USER_ID"
else
    echo -e "${RED}✗${NC} Failed to login"
    exit 1
fi
echo ""

# Re-onboard to trigger path generation
echo "2. Re-onboarding user (should trigger learning path generation)..."
ONBOARD_RESPONSE=$(curl -s -X POST "$BASE_URL/onboarding/student" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": 1,
    "branchId": 1,
    "skills": [1, 2, 3],
    "bio": "Testing learning path generation"
  }')

ONBOARD_STATUS=$(echo $ONBOARD_RESPONSE | jq -r '.status')
if [ "$ONBOARD_STATUS" == "true" ]; then
    echo -e "${GREEN}✓${NC} Onboarding completed successfully"
    echo "   ${YELLOW}⏳${NC} Learning path generation should have started in background..."
else
    echo -e "${RED}✗${NC} On boarding failed"
    echo "Response: $ONBOARD_RESPONSE"
fi
echo ""

# Wait a moment for generation to start
echo "3. Waiting 2 seconds for generation to start..."
sleep 2
echo ""

# Check generation status
echo "4. Checking learning path generation status..."
STATUS_RESPONSE=$(curl -s -X GET "$BASE_URL/learning-path/status" \
  -H "Authorization: Bearer $TOKEN")

echo "$STATUS_RESPONSE" | jq .
GEN_STATUS=$(echo $STATUS_RESPONSE | jq -r '.body.status')

if [ "$GEN_STATUS" == "generating" ]; then
    echo -e "${YELLOW}⏳${NC} Generation in progress..."
    echo "   Waiting 10 more seconds for generation to complete..."
    sleep 10
    
    # Check again
    STATUS_RESPONSE=$(curl -s -X GET "$BASE_URL/learning-path/status" \
      -H "Authorization: Bearer $TOKEN")
    echo ""
    echo "Status after 10s:"
    echo "$STATUS_RESPONSE" | jq .
elif [ "$GEN_STATUS" == "completed" ]; then
    echo -e "${GREEN}✓${NC} Generation completed!"
elif [ "$GEN_STATUS" == "failed" ]; then
    echo -e "${RED}✗${NC} Generation failed"
    ERROR=$(echo $STATUS_RESPONSE | jq -r '.body.error')
    echo "   Error: $ERROR"
fi
echo ""

# Try to get the learning path
echo "5. Retrieving generated learning path..."
PATH_RESPONSE=$(curl -s -X GET "$BASE_URL/learning-path/my-path" \
  -H "Authorization: Bearer $TOKEN")

PATH_STATUS=$(echo $PATH_RESPONSE | jq -r '.status')
if [ "$PATH_STATUS" == "true" ]; then
    echo -e "${GREEN}✓${NC} Learning path retrieved successfully"
    echo ""
    echo "Path Details:"
    echo "$PATH_RESPONSE" | jq '.body | {id, name, status, generatedAt, moduleCount: (.modules | length)}'
else
    echo -e "${RED}✗${NC} Failed to retrieve learning path"
    echo "$PATH_RESPONSE" | jq .
fi
echo ""

# Get learning schedule
echo "6. Retrieving learning schedule..."
SCHEDULE_RESPONSE=$(curl -s -X GET "$BASE_URL/learning-schedule/my-schedule" \
  -H "Authorization: Bearer $TOKEN")

SCHEDULE_STATUS=$(echo $SCHEDULE_RESPONSE | jq -r '.status')
if [ "$SCHEDULE_STATUS" == "true" ]; then
    SCHEDULE_COUNT=$(echo $SCHEDULE_RESPONSE | jq '.body | length')
    echo -e "${GREEN}✓${NC} Learning schedule retrieved ($SCHEDULE_COUNT periods)"
else
    echo -e "${RED}✗${NC} Failed to retrieve schedule"
fi
echo ""

echo "========================================="
echo "Test Complete"
echo "========================================="
