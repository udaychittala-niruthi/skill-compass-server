#!/bin/bash

# Base URL
BASE_URL="http://localhost:5003"

# Random email to avoid conflict
EMAIL="testuser_$(date +%s)@example.com"
PASSWORD="password123"

echo "1. Registering user ($EMAIL) without age..."
REGISTER_RES=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
echo $REGISTER_RES

echo -e "\n2. Logging in..."
LOGIN_RES=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
# Extract token (simple grep/sed as jq might not be there, assuming standard json structure)
TOKEN=$(echo $LOGIN_RES | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token: ${TOKEN:0:10}..."

echo -e "\n3. Accessing protected route (should fail 403)..."
FAIL_RES=$(curl -s -X GET "$BASE_URL/api/onboarding/status" \
  -H "Authorization: Bearer $TOKEN")
echo $FAIL_RES

echo -e "\n4. Updating Age..."
UPDATE_RES=$(curl -s -X PUT "$BASE_URL/api/onboarding/age" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"age": 25}')
echo $UPDATE_RES

echo -e "\n5. Accessing protected route (should succeed 200)..."
SUCCESS_RES=$(curl -s -X GET "$BASE_URL/api/onboarding/status" \
  -H "Authorization: Bearer $TOKEN")
echo $SUCCESS_RES
