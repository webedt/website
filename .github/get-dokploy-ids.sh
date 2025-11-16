#!/bin/bash

# Dokploy ID Fetcher for WebEDT
# This script helps you get the Project ID and Application ID from your Dokploy instance
# to configure GitHub Secrets for automated deployments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_header() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}\n"
}

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    print_warning "jq is not installed. Output will be raw JSON."
    print_info "Install jq for formatted output: sudo apt-get install jq (Ubuntu/Debian) or brew install jq (macOS)"
    USE_JQ=false
else
    USE_JQ=true
fi

# Get Dokploy URL from environment or prompt
if [ -z "$DOKPLOY_URL" ]; then
    print_header "Dokploy Configuration"
    echo -n "Enter your Dokploy URL (e.g., https://dokploy.yourdomain.com): "
    read DOKPLOY_URL
fi

# Ensure URL doesn't end with /api
DOKPLOY_URL=$(echo "$DOKPLOY_URL" | sed 's/\/api$//')

# Get API Key from environment or prompt
if [ -z "$DOKPLOY_API" ]; then
    echo -n "Enter your Dokploy API Key: "
    read -s DOKPLOY_API
    echo
fi

print_info "Fetching projects from Dokploy..."

# Fetch all projects
RESPONSE=$(curl -s -w "\n%{http_code}" -X 'GET' \
    "${DOKPLOY_URL}/api/project.all" \
    -H 'accept: application/json' \
    -H "x-api-key: ${DOKPLOY_API}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

# Check HTTP response code
if [ "$HTTP_CODE" -ne 200 ]; then
    print_error "Failed to fetch projects (HTTP $HTTP_CODE)"
    echo "$BODY"
    exit 1
fi

print_success "Successfully fetched projects from Dokploy"

# Parse and display projects
print_header "Available Projects"

if [ "$USE_JQ" = true ]; then
    # Count projects
    PROJECT_COUNT=$(echo "$BODY" | jq '. | length')
    print_info "Found $PROJECT_COUNT project(s)\n"

    # Display projects
    echo "$BODY" | jq -r '.[] | "\(.name)\n  Project ID: \(.projectId)\n  Description: \(.description // "No description")\n"'

    # Find "WebEDT" project (or any project matching the repo name)
    print_header "GitHub Secrets Configuration"

    WEBEDT_PROJECT_ID=$(echo "$BODY" | jq -r '.[] | select(.name == "WebEDT") | .projectId')

    if [ -n "$WEBEDT_PROJECT_ID" ] && [ "$WEBEDT_PROJECT_ID" != "null" ]; then
        print_success "Found 'WebEDT' project!"
        echo ""
        echo "Add this to GitHub Variables as DOKPLOY_PROJECT_ID:"
        echo -e "${GREEN}${WEBEDT_PROJECT_ID}${NC}"
        echo ""

        # Get environments in WebEDT project
        print_info "Environments in 'WebEDT' project:\n"

        ENVS=$(echo "$BODY" | jq -r '.[] | select(.name == "WebEDT") | .environments[]? | "  - \(.name)\n    Environment ID: \(.environmentId)\n"')

        if [ -n "$ENVS" ]; then
            echo "$ENVS"
        else
            print_warning "No environments found in 'WebEDT' project"
        fi

        echo ""

        # Show applications in WebEDT project (for reference only)
        print_info "Existing applications in 'WebEDT' project (for reference):\n"

        APPS=$(echo "$BODY" | jq -r '.[] | select(.name == "WebEDT") | .environments[]? | .applications[]? | "  - \(.name)\n    Application ID: \(.applicationId)\n    Type: \(.applicationType // "N/A")\n    Status: \(.applicationStatus // "N/A")\n"')

        if [ -n "$APPS" ]; then
            echo "$APPS"
        else
            print_info "No applications found yet - they will be created automatically on first deployment"
        fi

        # Also check for compose services, databases, etc.
        COMPOSE=$(echo "$BODY" | jq -r '.[] | select(.name == "WebEDT") | .compose[]? | "  - \(.name) (Compose)\n    Compose ID: \(.composeId)\n"')
        if [ -n "$COMPOSE" ]; then
            echo -e "\n${BLUE}Compose Services:${NC}"
            echo "$COMPOSE"
        fi

        POSTGRES=$(echo "$BODY" | jq -r '.[] | select(.name == "WebEDT") | .postgres[]? | "  - \(.name) (PostgreSQL)\n    Postgres ID: \(.postgresId)\n"')
        if [ -n "$POSTGRES" ]; then
            echo -e "\n${BLUE}PostgreSQL Databases:${NC}"
            echo "$POSTGRES"
        fi

        MYSQL=$(echo "$BODY" | jq -r '.[] | select(.name == "WebEDT") | .mysql[]? | "  - \(.name) (MySQL)\n    MySQL ID: \(.mysqlId)\n"')
        if [ -n "$MYSQL" ]; then
            echo -e "\n${BLUE}MySQL Databases:${NC}"
            echo "$MYSQL"
        fi

        REDIS=$(echo "$BODY" | jq -r '.[] | select(.name == "WebEDT") | .redis[]? | "  - \(.name) (Redis)\n    Redis ID: \(.redisId)\n"')
        if [ -n "$REDIS" ]; then
            echo -e "\n${BLUE}Redis Instances:${NC}"
            echo "$REDIS"
        fi

    else
        print_warning "No 'WebEDT' project found"
        print_info "Please create a 'WebEDT' project in Dokploy or use a different project name"
        print_info "You can also select any project from the list above"
    fi

    # Summary of required GitHub configuration
    print_header "Required GitHub Configuration Summary"
    echo "Configure these in: Settings > Secrets and variables > Actions"
    echo ""
    echo -e "${BLUE}GitHub Variables (Variables tab):${NC}"
    echo ""
    echo "1. DOKPLOY_URL"
    echo -e "   Value: ${GREEN}${DOKPLOY_URL}${NC}"
    echo ""
    echo "2. DOKPLOY_PROJECT_ID"
    if [ -n "$WEBEDT_PROJECT_ID" ] && [ "$WEBEDT_PROJECT_ID" != "null" ]; then
        echo -e "   Value: ${GREEN}${WEBEDT_PROJECT_ID}${NC}"
    else
        echo -e "   Value: ${YELLOW}[Get this from the project list above]${NC}"
    fi
    echo ""
    echo "3. DOKPLOY_ENVIRONMENT_ID"
    echo -e "   Value: ${YELLOW}[Get this from the environment list above]${NC}"
    echo ""
    echo "4. DOKPLOY_GITHUB_ID"
    echo -e "   Value: ${YELLOW}[Get this from Dokploy Settings > GitHub]${NC}"
    echo ""
    echo "5. DOKPLOY_SERVER_ID"
    echo -e "   Value: ${YELLOW}[Get this from Dokploy Servers page]${NC}"
    echo ""
    echo -e "${BLUE}GitHub Secrets (Secrets tab):${NC}"
    echo ""
    echo "6. DOKPLOY_API_KEY"
    echo -e "   Value: ${GREEN}[Your API Key - keep this secret]${NC}"
    echo ""
    echo "7. DATABASE_URL (optional)"
    echo -e "   Value: ${YELLOW}[PostgreSQL connection string]${NC}"
    echo ""
    echo "8. SESSION_SECRET"
    echo -e "   Value: ${YELLOW}[Random secret for session encryption]${NC}"
    echo ""
    echo "9. GITHUB_OAUTH_CLIENT_ID"
    echo -e "   Value: ${YELLOW}[GitHub OAuth App Client ID]${NC}"
    echo ""
    echo "10. GITHUB_OAUTH_CLIENT_SECRET"
    echo -e "   Value: ${YELLOW}[GitHub OAuth App Client Secret]${NC}"
    echo ""
    echo "11. GITHUB_OAUTH_REDIRECT_URL"
    echo -e "   Value: ${YELLOW}[e.g., https://your-domain.com/api/github/oauth/callback]${NC}"
    echo ""
    echo "12. AI_WORKER_URL"
    echo -e "   Value: ${YELLOW}[AI Coding Worker URL]${NC}"
    echo ""
    echo -e "${GREEN}✓${NC} Applications will be created automatically - no need to pre-create them!"
    echo ""

else
    # jq not available - show raw JSON
    echo "Raw JSON response (install jq for formatted output):"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
fi

print_header "Next Steps"
echo "1. Copy the IDs from above"
echo "2. Go to your GitHub repository"
echo "3. Navigate to: Settings > Secrets and variables > Actions"
echo "4. Add Variables (Variables tab): DOKPLOY_URL, DOKPLOY_PROJECT_ID, DOKPLOY_ENVIRONMENT_ID, DOKPLOY_GITHUB_ID, DOKPLOY_SERVER_ID"
echo "5. Add Secrets (Secrets tab): DOKPLOY_API_KEY, DATABASE_URL, SESSION_SECRET, GITHUB_OAUTH_CLIENT_ID, GITHUB_OAUTH_CLIENT_SECRET, GITHUB_OAUTH_REDIRECT_URL, AI_WORKER_URL"
echo "6. Push code to trigger the deployment workflow"
echo "7. Applications will be created automatically with unique domains!"
echo ""
print_info "For more information about the deployment process, see the GitHub Actions workflow files in .github/workflows/"
