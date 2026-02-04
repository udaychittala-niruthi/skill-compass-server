#!/bin/bash

# Clean old learning paths and test fresh generation

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

BASE_URL="http://localhost:5003/api"

echo "=========================================="
echo "Fresh Generation Test with Resources"
echo "=========================================="
echo ""

# Step 1: Delete old learning paths via SQL  
echo "${YELLOW}Step 1: Clearing old learning paths...${NC}"
echo "Deleting from database..."

# Wait a moment
sleep 1
echo "Database cleared (manual step required)"
echo ""

# Step 2: Login
echo "${YELLOW}Step 2: Authenticating...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"testUser_21730@example.com","password":"password123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.body.token')

if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗${NC} Failed to login"
    exit 1
fi

echo -e "${GREEN}✓${NC} PROFESSIONAL user logged in"
echo ""

# Step 3: Trigger fresh onboarding
echo "${YELLOW}Step 3: Triggering fresh path generation...${NC}"
ONBOARD_RESPONSE=$(curl -s -X POST "$BASE_URL/onboarding/professionals/details" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentRole": "Junior Developer",
    "industry": "Technology",
    "yearsOfExperience": 2,
    "skills": [1, 2, 3],
    "bio": "Testing enhanced resource generation"
  }')

ONBOARD_STATUS=$(echo $ONBOARD_RESPONSE | jq -r '.status' 2>/dev/null)

if [ "$ONBOARD_STATUS" == "true" ]; then
    echo -e "${GREEN}✓${NC} Onboarding successful"
else
    echo -e "${YELLOW}⚠${NC}  Onboarding response: $ONBOARD_RESPONSE"
fi

echo ""
echo "${YELLOW}⏳ Waiting 25 seconds for AI generation + resource fetching...${NC}"
echo "(Fetching YouTube videos, thumbnails, PDFs for ~10 modules)"
sleep 25
echo ""

# Step 4: Check generation status
echo "${YELLOW}Step 4: Checking generation status...${NC}"
STATUS_RESPONSE=$(curl -s -X GET "$BASE_URL/learning-path/status" \
  -H "Authorization: Bearer $TOKEN")

GEN_STATUS=$(echo $STATUS_RESPONSE | jq -r '.body.status')
echo "Status: $GEN_STATUS"
echo ""

# Step 5: Get learning path
echo "${YELLOW}Step 5: Fetching generated learning path...${NC}"
PATH_RESPONSE=$(curl -s -X GET "$BASE_URL/learning-path/my-path" \
  -H "Authorization: Bearer $TOKEN")

# Save to file
echo "$PATH_RESPONSE" | jq . > /tmp/fresh_path_with_resources.json

PATH_STATUS=$(echo "$PATH_RESPONSE" | jq -r '.status')

if [ "$PATH_STATUS" != "true" ]; then
    echo -e "${RED}✗${NC} Failed to retrieve path"
    echo "$PATH_RESPONSE" | jq .
    exit 1
fi

echo -e "${GREEN}✓${NC} Learning path retrieved"
echo ""

# Step 6: Analyze modules
MODULES=$(echo "$PATH_RESPONSE" | jq -r '.body.modules')
MODULE_COUNT=$(echo "$MODULES" | jq 'length')

echo "=========================================="
echo "Module Analysis (Total: $MODULE_COUNT)"
echo "=========================================="
echo ""

# Counters
HAS_CONTENT_URL=0
HAS_THUMBNAIL=0
HAS_FORMAT=0
HAS_PREREQUISITES=0
HAS_PDF=0

for i in $(seq 0 $((MODULE_COUNT - 1))); do
    MODULE=$(echo "$MODULES" | jq ".[$i]")
    
    TITLE=$(echo "$MODULE" | jq -r '.title')
    CONTENT_URL=$(echo "$MODULE" | jq -r '.contentUrl // "null"')
    THUMBNAIL_URL=$(echo "$MODULE" | jq -r '.thumbnailUrl // "null"')
    FORMAT=$(echo "$MODULE" | jq -r '.format // "null"')
    PREREQS=$(echo "$MODULE" | jq -r '.prerequisiteModules | length')
    PDF_COUNT=$(echo "$MODULE" | jq -r '.generationMetadata.pdfResources | length // 0')
    
    echo "Module $((i + 1)): $TITLE"
    
    # Count successes
    [ "$CONTENT_URL" != "null" ] && HAS_CONTENT_URL=$((HAS_CONTENT_URL + 1)) && echo -e "  ${GREEN}✓${NC} Video: $CONTENT_URL" || echo -e "  ${RED}✗${NC} Video: Missing"
    [ "$THUMBNAIL_URL" != "null" ] && HAS_THUMBNAIL=$((HAS_THUMBNAIL + 1)) && echo -e "  ${GREEN}✓${NC} Thumbnail: ${THUMBNAIL_URL:0:40}..." || echo -e "  ${RED}✗${NC} Thumbnail: Missing"
    [ "$FORMAT" != "null" ] && HAS_FORMAT=$((HAS_FORMAT + 1)) && echo -e "  ${GREEN}✓${NC} Format: $FORMAT" || echo -e "  ${RED}✗${NC} Format: Missing"
    [ "$PREREQS" -gt 0 ] && HAS_PREREQUISITES=$((HAS_PREREQUISITES + 1)) && echo -e "  ${GREEN}✓${NC} Prerequisites: $PREREQS" || echo -e "  ${BLUE}ℹ${NC}  Prerequisites: None"
    [ "$PDF_COUNT" -gt 0 ] && HAS_PDF=$((HAS_PDF + 1)) && echo "  PDF Resources: $PDF_COUNT"
    
    echo ""
done

echo "=========================================="
echo "Summary"
echo "=========================================="
echo "Total Modules: $MODULE_COUNT"
echo -e "With Content URL: ${GREEN}$HAS_CONTENT_URL${NC}/$MODULE_COUNT"
echo -e "With Thumbnail: ${GREEN}$HAS_THUMBNAIL${NC}/$MODULE_COUNT"
echo -e "With Format: ${GREEN}$HAS_FORMAT${NC}/$MODULE_COUNT"
echo -e "With Prerequisites: ${GREEN}$HAS_PREREQUISITES${NC} modules"
echo -e "With PDF Resources: ${GREEN}$HAS_PDF${NC} modules"
echo ""
echo "Full response: /tmp/fresh_path_with_resources.json"
echo "=========================================="
