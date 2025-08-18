#!/bin/bash

# Add n8n-MCP to existing Claude Code configuration
# This script adds n8n-mcp server to your current global MCP setup

set -e

echo "🤖 Adding n8n-MCP Server to Claude Code"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
    print_error "Claude Code is not installed. Please install it first."
    exit 1
fi

# Check if jq is available
if ! command -v jq &> /dev/null; then
    print_error "jq is required but not installed. Please install jq first."
    exit 1
fi

# Install n8n-mcp globally
print_status "Installing n8n-mcp package globally..."
npm install -g n8n-mcp

print_success "n8n-mcp installed successfully"

# Backup existing Claude config
CLAUDE_CONFIG="$HOME/.claude.json"
if [ -f "$CLAUDE_CONFIG" ]; then
    BACKUP_FILE="$CLAUDE_CONFIG.backup-n8n-$(date +%Y%m%d-%H%M%S)"
    print_status "Backing up existing Claude config to $BACKUP_FILE"
    cp "$CLAUDE_CONFIG" "$BACKUP_FILE"
else
    print_error "No existing Claude config found at $CLAUDE_CONFIG"
    print_error "Please run ./setup-global-mcp.sh first to set up base configuration"
    exit 1
fi

# Add n8n-mcp server configuration
print_status "Adding n8n-mcp server to Claude configuration..."

N8N_MCP_CONFIG='{
    "n8n-mcp": {
        "type": "stdio",
        "command": "npx",
        "args": ["-y", "n8n-mcp"],
        "env": {
            "MCP_MODE": "stdio",
            "LOG_LEVEL": "error",
            "DISABLE_CONSOLE_OUTPUT": "true",
            "N8N_API_URL": "https://n8n.evolviqsphere.com",
            "N8N_API_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzNDNjMzFiNS03Yjg1LTQzMzAtYTdkNC1mM2VlZDk4ZWM0NWQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0OTA2NzA5fQ.9H2KAgSamsIm3pBGNYmlB6-xFwF5TyIydlWESmkh7Y4"
        }
    }
}'

# Merge the new server into existing configuration
jq --argjson n8n_mcp "$N8N_MCP_CONFIG" '.mcpServers += $n8n_mcp' "$CLAUDE_CONFIG" > "$CLAUDE_CONFIG.tmp" && mv "$CLAUDE_CONFIG.tmp" "$CLAUDE_CONFIG"

print_success "n8n-mcp server added to Claude configuration"

# Test the configuration
print_status "Testing n8n-mcp server connection..."
if claude mcp list | grep -q "n8n-mcp"; then
    if claude mcp list | grep "n8n-mcp" | grep -q "✓ Connected"; then
        print_success "n8n-mcp server connected successfully!"
    else
        print_warning "n8n-mcp server found but connection failed. Check your n8n API configuration."
    fi
else
    print_warning "n8n-mcp server not found in MCP list. Configuration may need verification."
fi

echo ""
print_success "🎉 n8n-MCP Setup Complete!"
echo ""
echo "📋 What you can now do with Claude:"
echo "• Ask about any n8n node: 'How do I configure the Slack node?'"
echo "• Get workflow help: 'Create a workflow to send daily reports'"
echo "• Validate configurations: 'Check this n8n workflow for errors'"
echo "• Generate workflows: 'Build a webhook to email workflow'"
echo ""
echo "🔧 n8n-MCP Features Available:"
echo "✅ 532+ n8n nodes documentation"
echo "✅ Node property schemas and validation"  
echo "✅ Workflow creation and management"
echo "✅ Direct integration with your n8n instance"
echo "✅ AI-powered workflow assistance"
echo ""
echo "📂 Files modified:"
echo "  - ~/.claude.json (added n8n-mcp server)"
if [ -n "$BACKUP_FILE" ]; then
    echo "  - $BACKUP_FILE (backup of original config)"
fi
echo ""
echo "💡 Try asking Claude: 'What n8n nodes can help me automate email workflows?'"