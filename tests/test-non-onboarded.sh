#!/bin/bash

# Test creating a non-onboarded user and verifying access restrictions

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:5003/api"

echo "========================================="
echo "Testing Non-Onboarded User Restrictions"
echo "========================================="
echo ""

# Create a new test user
echo "1. Creating new test user..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Non-Onboarded Test User",
    "email": "test_notonboarded@example.com",
    "password": "password123",
    "age": 25,
    "group": "COLLEGE_STUDENTS"
  }')

REGISTER_STATUS=$(echo $REGISTER_RESPONSE | jq -r '.status')
if [ "$REGISTER_STATUS" == "true" ]; then
    echo -e "${GREEN}✓${NC} User created successfully"
else
    echo -e "${YELLOW}⚠${NC}  User might already exist or registration failed"
    echo "Response: $REGISTER_RESPONSE"
fi
echo ""

# Login as the new user
echo "2. Logging in as non-onboarded user..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test_notonboarded@example.com","password":"password123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.body.token // empty')
USER_ONBOARDED=$(echo $LOGIN_RESPONSE | jq -r '.body.user.isOnboarded')

if [ ! -z "$TOKEN" ]; then
    echo -e "${GREEN}✓${NC} Logged in successfully"
    echo "   isOnboarded: $USER_ONBOARDED"
else
    echo -e "${RED}✗${NC} Failed to login"
    exit 1
fi
echo ""

# Test access to learning path endpoints
echo "3. Testing access to learning path endpoints (should be restricted)..."
echo "-----------------------------------------------------------------------"

# Try to get learning path
STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/learning-path/my-path")

if [ "$STATUS" == "403" ] || [ "$STATUS" == "401" ]; then
    echo -e "${GREEN}✓${NC} GET /learning-path/my-path correctly blocked (Status: $STATUS)"
else
    echo -e "${RED}✗${NC} GET /learning-path/my-path (Expected: 403/401, Got: $STATUS)"
fi

# Try to get status
STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/learning-path/status")

if [ "$STATUS" == "403" ] || [ "$STATUS" == "401" ]; then
    echo -e "${GREEN}✓${NC} GET /learning-path/status correctly blocked (Status: $STATUS)"
else
    echo -e "${RED}✗${NC} GET /learning-path/status (Expected: 403/401, Got: $STATUS)"
fi

# Try to regenerate
STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST \
  -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/learning-path/regenerate")

if [ "$STATUS" == "403" ] || [ "$STATUS" == "401" ]; then
    echo -e "${GREEN}✓${NC} POST /learning-path/regenerate correctly blocked (Status: $STATUS)"
else
    echo -e "${RED}✗${NC} POST /learning-path/regenerate (Expected: 403/401, Got: $STATUS)"
fi

echo ""

# Test access to progress endpoints (these might be allowed)
echo "4. Testing access to progress endpoints..."
echo "-------------------------------------------"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/learning-progress/my-progress")

echo "   GET /learning-progress/my-progress (Status: $STATUS)"

echo ""

# Test access to schedule endpoints
echo "5. Testing access to schedule endpoints..."
echo "-------------------------------------------"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/learning-schedule/my-schedule")

echo "   GET /learning-schedule/my-schedule (Status: $STATUS)"

echo ""

echo "========================================="
echo "Non-Onboarded User Test Complete"
echo "========================================="
