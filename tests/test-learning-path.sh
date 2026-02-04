#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "Learning Path API - Comprehensive Tests"
echo "========================================="
echo ""

BASE_URL="http://localhost:5003/api"

# Test user credentials
COLLEGE_EMAIL="testUser_26505@example.com"
PROFESSIONAL_EMAIL="testUser_21730@example.com"
SENIOR_EMAIL="testUser_52549@example.com"
PASSWORD="password123"

# Function to print test result
print_result() {
    local test_name=$1
    local status_code=$2
    local expected=$3
    
    if [ "$status_code" == "$expected" ]; then
        echo -e "${GREEN}✓${NC} $test_name (Status: $status_code)"
    else
        echo -e "${RED}✗${NC} $test_name (Expected: $expected, Got: $status_code)"
    fi
}

echo "1. Testing server connectivity..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/)
print_result "Server is running" "$STATUS" "200"
echo ""

# Login and get tokens
echo "2. Authenticating users..."
echo "----------------------------"

# College Student
COLLEGE_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$COLLEGE_EMAIL\",\"password\":\"$PASSWORD\"}")
COLLEGE_TOKEN=$(echo $COLLEGE_RESPONSE | jq -r '.body.token // empty')

if [ ! -z "$COLLEGE_TOKEN" ]; then
    echo -e "${GREEN}✓${NC} Logged in as COLLEGE_STUDENTS (ID: 23)"
else
    echo -e "${RED}✗${NC} Failed to login as COLLEGE_STUDENTS"
    echo "Response: $COLLEGE_RESPONSE"
fi

# Professional
PROFESSIONAL_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$PROFESSIONAL_EMAIL\",\"password\":\"$PASSWORD\"}")
PROFESSIONAL_TOKEN=$(echo $PROFESSIONAL_RESPONSE | jq -r '.body.token // empty')

if [ ! -z "$PROFESSIONAL_TOKEN" ]; then
    echo -e "${GREEN}✓${NC} Logged in as PROFESSIONALS (ID: 24)"
else
    echo -e "${RED}✗${NC} Failed to login as PROFESSIONALS"
fi

# Senior
SENIOR_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$SENIOR_EMAIL\",\"password\":\"$PASSWORD\"}")
SENIOR_TOKEN=$(echo $SENIOR_RESPONSE | jq -r '.body.token // empty')

if [ ! -z "$SENIOR_TOKEN" ]; then
    echo -e "${GREEN}✓${NC} Logged in as SENIORS (ID: 25)"
else
    echo -e "${RED}✗${NC} Failed to login as SENIORS"
fi

echo ""

# Test Learning Path Endpoints
echo "3. Testing Learning Path Endpoints..."
echo "--------------------------------------"

if [ ! -z "$COLLEGE_TOKEN" ]; then
    # Get generation status
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
      -H "Authorization: Bearer $COLLEGE_TOKEN" \
      "$BASE_URL/learning-path/status")
    print_result "GET /learning-path/status (COLLEGE)" "$STATUS" "200"
    
    # Get learning path
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
      -H "Authorization: Bearer $COLLEGE_TOKEN" \
      "$BASE_URL/learning-path/my-path")
    print_result "GET /learning-path/my-path (COLLEGE)" "$STATUS" "200"
fi

if [ ! -z "$PROFESSIONAL_TOKEN" ]; then
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
      -H "Authorization: Bearer $PROFESSIONAL_TOKEN" \
      "$BASE_URL/learning-path/status")
    print_result "GET /learning-path/status (PROFESSIONAL)" "$STATUS" "200"
fi

if [ ! -z "$SENIOR_TOKEN" ]; then
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
      -H "Authorization: Bearer $SENIOR_TOKEN" \
      "$BASE_URL/learning-path/status")
    print_result "GET /learning-path/status (SENIOR)" "$STATUS" "200"
fi

echo ""

# Test Learning Progress Endpoints
echo "4. Testing Learning Progress Endpoints..."
echo "------------------------------------------"

if [ ! -z "$COLLEGE_TOKEN" ]; then
    # Get all progress
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
      -H "Authorization: Bearer $COLLEGE_TOKEN" \
      "$BASE_URL/learning-progress/my-progress")
    print_result "GET /learning-progress/my-progress (COLLEGE)" "$STATUS" "200"
    
    # Update module progress
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
      -X POST \
      -H "Authorization: Bearer $COLLEGE_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"status":"in-progress","progressPercentage":50,"timeSpent":30}' \
      "$BASE_URL/learning-progress/module/1")
    print_result "POST /learning-progress/module/1 (COLLEGE)" "$STATUS" "200"
fi

echo ""

# Test Learning Schedule Endpoints
echo "5. Testing Learning Schedule Endpoints..."
echo "------------------------------------------"

if [ ! -z "$COLLEGE_TOKEN" ]; then
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
      -H "Authorization: Bearer $COLLEGE_TOKEN" \
      "$BASE_URL/learning-schedule/my-schedule")
    print_result "GET /learning-schedule/my-schedule (COLLEGE)" "$STATUS" "200"
fi

echo ""

# Test Access Restrictions
echo "6. Testing Access Restrictions..."
echo "----------------------------------"

# Without authentication
STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  "$BASE_URL/learning-path/my-path")
print_result "Access without auth (should be 401)" "$STATUS" "401"

# Invalid module ID
if [ ! -z "$COLLEGE_TOKEN" ]; then
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
      -H "Authorization: Bearer $COLLEGE_TOKEN" \
      "$BASE_URL/learning-progress/module/invalid")
    print_result "Invalid module ID (should be 400)" "$STATUS" "400"
fi

echo ""

# Test Validation
echo "7. Testing Input Validation..."
echo "-------------------------------"

if [ ! -z "$COLLEGE_TOKEN" ]; then
    # Invalid progress percentage
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
      -X POST \
      -H "Authorization: Bearer $COLLEGE_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"progressPercentage":150}' \
      "$BASE_URL/learning-progress/module/1")
    print_result "Invalid progress percentage (should be 400)" "$STATUS" "400"
    
    # Invalid status
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
      -X POST \
      -H "Authorization: Bearer $COLLEGE_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"status":"invalid-status"}' \
      "$BASE_URL/learning-progress/module/1")
    print_result "Invalid status (should be 400)" "$STATUS" "400"
    
    # Invalid rating
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
      -X POST \
      -H "Authorization: Bearer $COLLEGE_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"rating":10}' \
      "$BASE_URL/learning-progress/module/1")
    print_result "Invalid rating (should be 400)" "$STATUS" "400"
fi

echo ""
echo "========================================="
echo "Test Summary Complete"
echo "========================================="
