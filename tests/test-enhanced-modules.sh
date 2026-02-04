#!/bin/bash

# Test enhanced module generation with real resources

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:5003/api"

echo "==========================================="
echo "Testing Enhanced Module Generation"
echo "==========================================="
echo ""

# Login as college student
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"testUser_26505@example.com","password":"password123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.body.token')

if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗${NC} Failed to login"
    exit 1
fi

echo -e "${GREEN}✓${NC} Logged in successfully"
echo ""

# Re-onboard to trigger new generation
echo "Re-onboarding to trigger fresh path generation..."
ONBOARD_RESPONSE=$(curl -s -X POST "$BASE_URL/onboarding/students/details" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"courseId": 1, "branchId": 1, "skills": [1, 2, 3], "bio": "Testing resource enhancement"}')

echo -e "${GREEN}✓${NC} Onboarding triggered"
echo ""

echo "${YELLOW}⏳ Waiting 20 seconds for generation with resource fetching...${NC}"
sleep 20
echo ""

# Get learning path
echo "Fetching generated learning path..."
PATH_RESPONSE=$(curl -s -X GET "$BASE_URL/learning-path/my-path" \
  -H "Authorization: Bearer $TOKEN")

# Save full response to file
echo "$PATH_RESPONSE" | jq . > /tmp/enhanced_path_response.json

# Check if successful
STATUS=$(echo "$PATH_RESPONSE" | jq -r '.status')

if [ "$STATUS" != "true" ]; then
    echo -e "${RED}✗${NC} Failed to retrieve path"
    echo "$PATH_RESPONSE" | jq .
    exit 1
fi

echo -e "${GREEN}✓${NC} Learning path retrieved"
echo ""

# Extract and analyze modules
MODULES=$(echo "$PATH_RESPONSE" | jq -r '.body.modules')
MODULE_COUNT=$(echo "$MODULES" | jq 'length')

echo "================================================"
echo "Generated Modules Analysis (Total: $MODULE_COUNT)"
echo "================================================"
echo ""

# Check each module for required fields
for i in $(seq 0 $((MODULE_COUNT - 1))); do
    MODULE=$(echo "$MODULES" | jq ".[$i]")
    
    TITLE=$(echo "$MODULE" | jq -r '.title')
    CONTENT_URL=$(echo "$MODULE" | jq -r '.contentUrl')
    THUMBNAIL_URL=$(echo "$MODULE" | jq -r '.thumbnailUrl')
    FORMAT=$(echo "$MODULE" | jq -r '.format')
    PREREQS=$(echo "$MODULE" | jq -r '.prerequisiteModules | length')
    DURATION=$(echo "$MODULE" | jq -r '.duration')
    
    echo "Module $((i + 1)): $TITLE"
    echo "  Duration: $DURATION minutes"
    
    # Check contentUrl
    if [ "$CONTENT_URL" != "null" ] && [ ! -z "$CONTENT_URL" ]; then
        echo -e "  ${GREEN}✓${NC} Content URL: ${CONTENT_URL:0:50}..."
    else
        echo -e "  ${RED}✗${NC} Content URL: Missing"
    fi
    
    # Check thumbnailUrl
    if [ "$THUMBNAIL_URL" != "null" ] && [ ! -z "$THUMBNAIL_URL" ]; then
        echo -e "  ${GREEN}✓${NC} Thumbnail URL: ${THUMBNAIL_URL:0:50}..."
    else
        echo -e "  ${RED}✗${NC} Thumbnail URL: Missing"
    fi
    
    # Check format
    if [ "$FORMAT" != "null" ] && [ ! -z "$FORMAT" ]; then
        echo -e "  ${GREEN}✓${NC} Format: $FORMAT"
    else
        echo -e "  ${RED}✗${NC} Format: Missing"
    fi
    
    # Check prerequisites
    if [ "$PREREQS" -gt 0 ]; then
        echo -e "  ${GREEN}✓${NC} Prerequisites: $PREREQS module(s)"
    else
        echo -e "  ${BLUE}ℹ${NC}  Prerequisites: None (first modules expected)"
    fi
    
    # Check for PDF resources in metadata
    PDF_COUNT=$(echo "$MODULE" | jq -r '.generationMetadata.pdfResources | length // 0')
    if [ "$PDF_COUNT" -gt 0 ]; then
        echo -e "  ${GREEN}✓${NC} PDF Resources: $PDF_COUNT"
    fi
    
    echo ""
done

echo "================================================"
echo "Full response saved to: /tmp/enhanced_path_response.json"
echo "================================================"
