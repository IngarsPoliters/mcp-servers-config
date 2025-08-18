#!/bin/bash

# Global MCP Server Setup Script for Claude Code
# This script configures global MCP servers that work across all Claude Code sessions

set -e

echo "🌍 Setting up Global MCP Servers for Claude Code"
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Claude Code is installed
if ! command -v claude &> /dev/null; then
    print_error "Claude Code is not installed. Please install it first:"
    echo "  curl -fsSL https://claude.ai/install.sh | bash"
    exit 1
fi

# Check if jq is available for JSON processing
if ! command -v jq &> /dev/null; then
    print_warning "jq is not installed. Installing jq for JSON processing..."
    if command -v apt &> /dev/null; then
        sudo apt update && sudo apt install -y jq
    elif command -v yum &> /dev/null; then
        sudo yum install -y jq
    elif command -v brew &> /dev/null; then
        brew install jq
    else
        print_error "Cannot install jq automatically. Please install it manually."
        exit 1
    fi
fi

# Create backup of existing ~/.claude.json
CLAUDE_CONFIG="$HOME/.claude.json"
if [ -f "$CLAUDE_CONFIG" ]; then
    BACKUP_FILE="$CLAUDE_CONFIG.backup-$(date +%Y%m%d-%H%M%S)"
    print_status "Backing up existing Claude config to $BACKUP_FILE"
    cp "$CLAUDE_CONFIG" "$BACKUP_FILE"
else
    print_status "No existing Claude config found, creating new one"
    echo '{}' > "$CLAUDE_CONFIG"
fi

# Read the global template
TEMPLATE_FILE="$(dirname "$0")/global-claude-config-template.json"
if [ ! -f "$TEMPLATE_FILE" ]; then
    print_error "Global MCP template not found at $TEMPLATE_FILE"
    exit 1
fi

print_status "Installing global MCP servers..."

# Install common MCP server packages globally
print_status "Installing core MCP servers..."
npm install -g \
    @modelcontextprotocol/server-filesystem \
    @modelcontextprotocol/server-github \
    @agentdeskai/browser-tools-mcp

print_status "Installing additional MCP servers..."  
npm install -g \
    @kazuph/mcp-fetch \
    firecrawl-mcp \
    n8n-mcp

print_status "Note: Some MCP servers will be used via npx without global installation"

print_success "MCP packages installed globally"

# Merge global MCP configuration
print_status "Merging MCP configuration into ~/.claude.json"

# Read template and merge with existing config
TEMPLATE_MCP=$(cat "$TEMPLATE_FILE")
jq --argjson template_mcp "$TEMPLATE_MCP" '
    .mcpServers = $template_mcp.mcpServers
' "$CLAUDE_CONFIG" > "$CLAUDE_CONFIG.tmp" && mv "$CLAUDE_CONFIG.tmp" "$CLAUDE_CONFIG"

print_success "Global MCP configuration merged successfully"

# Set up environment variables template
ENV_TEMPLATE="$HOME/.claude-mcp.env"
if [ ! -f "$ENV_TEMPLATE" ]; then
    print_status "Creating environment variables template at $ENV_TEMPLATE"
    cat > "$ENV_TEMPLATE" << 'EOF'
# Global MCP Server Environment Variables
# Copy this to your shell profile (.bashrc, .zshrc, etc.) or source it

# GitHub Personal Access Token (for GitHub MCP server)
export GITHUB_TOKEN="your_github_token_here"

# Brave Search API Key (for web search capabilities)  
export BRAVE_API_KEY="your_brave_api_key_here"

# Firecrawl API Key (for advanced web scraping and crawling)
export FIRECRAWL_API_KEY="fc-bac30db0109f4c91a9f94b0d8e9be0ba"

# n8n API Configuration (for workflow management capabilities)
export N8N_API_URL="https://n8n.evolviqsphere.com"
export N8N_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzNDNjMzFiNS03Yjg1LTQzMzAtYTdkNC1mM2VlZDk4ZWM0NWQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0OTA2NzA5fQ.9H2KAgSamsIm3pBGNYmlB6-xFwF5TyIydlWESmkh7Y4"

# Memory Bank Path (for persistent memory)
export MEMORY_BANK_PATH="$HOME/.claude/memory-bank"

# Optional: Notion Integration Token
# export NOTION_TOKEN="your_notion_integration_token_here"

# Optional: Slack User Token
# export SLACK_USER_TOKEN="your_slack_user_token_here"

# Optional: Database URL for PostgreSQL server
# export DATABASE_URL="postgresql://username:password@localhost:5432/dbname"
EOF
    print_success "Environment template created at $ENV_TEMPLATE"
else
    print_warning "Environment template already exists at $ENV_TEMPLATE"
fi

# Create memory bank directory
MEMORY_DIR="$HOME/.claude/memory-bank"
if [ ! -d "$MEMORY_DIR" ]; then
    mkdir -p "$MEMORY_DIR"
    print_success "Created memory bank directory at $MEMORY_DIR"
fi

# Test configuration
print_status "Testing MCP server configuration..."
claude mcp list || print_warning "MCP server test completed with warnings (this is normal if environment variables aren't set)"

echo ""
print_success "🎉 Global MCP Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Edit $ENV_TEMPLATE and add your API keys"
echo "2. Source the environment file: source $ENV_TEMPLATE"
echo "3. Or add the exports to your shell profile (.bashrc, .zshrc, etc.)"
echo "4. Restart your terminal or run: source ~/.bashrc (or ~/.zshrc)"
echo "5. Test with: claude mcp list"
echo ""
echo "🔧 Global MCP servers are now available in ALL Claude Code sessions!"
echo "💡 For project-specific servers, create .mcp.json in your project directories"
echo ""
echo "📂 Files created/modified:"
echo "  - ~/.claude.json (global MCP configuration)"
echo "  - $ENV_TEMPLATE (environment variables template)"
echo "  - $MEMORY_DIR (memory bank directory)"
if [ -n "$BACKUP_FILE" ]; then
    echo "  - $BACKUP_FILE (backup of original config)"
fi