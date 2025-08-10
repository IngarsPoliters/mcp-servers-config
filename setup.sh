#!/bin/bash

# Exit on errors
set -e

# Detect OS and install Node.js if missing
install_nodejs() {
    echo "Installing Node.js..."
    if command -v apt &> /dev/null; then
        # Ubuntu/Debian
        sudo apt update
        sudo apt install -y nodejs npm
    elif command -v yum &> /dev/null; then
        # RHEL/CentOS/Fedora
        sudo yum install -y nodejs npm
    elif command -v dnf &> /dev/null; then
        # Modern Fedora
        sudo dnf install -y nodejs npm
    elif command -v pacman &> /dev/null; then
        # Arch Linux
        sudo pacman -S nodejs npm
    elif command -v zypper &> /dev/null; then
        # openSUSE
        sudo zypper install -y nodejs npm
    else
        echo "Unsupported package manager. Please install Node.js 18+ manually."
        exit 1
    fi
}

# Check Node.js version requirement (18+)
check_nodejs_version() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_VERSION" -lt 18 ]; then
            echo "Node.js version $NODE_VERSION is too old. Need 18+. Updating..."
            install_nodejs
        fi
    else
        install_nodejs
    fi
}

check_nodejs_version

# Install Claude Code CLI using official 2025 method
if ! command -v claude &> /dev/null; then
    echo "Installing Claude Code CLI..."
    echo "Using native binary installation (recommended method)..."
    if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        # Windows PowerShell method
        powershell -Command "irm https://claude.ai/install.ps1 | iex"
    else
        # macOS, Linux, WSL method
        curl -fsSL https://claude.ai/install.sh | bash
    fi
    
    # Fallback to npm if native installation fails
    if ! command -v claude &> /dev/null; then
        echo "Native installation failed, falling back to npm method..."
        npm install -g @anthropic-ai/claude-code
    fi
fi

# Install common MCP server packages globally
echo "Installing MCP server packages..."
npm install -g @modelcontextprotocol/server-github @modelcontextprotocol/server-filesystem @modelcontextprotocol/server-puppeteer  # Add more as needed

# Check for environment file and prompt for missing variables
if [ -f ".env" ]; then
    echo "Loading environment variables from .env file..."
    set -a  # automatically export all variables
    source .env
    set +a
else
    echo "No .env file found. Copy .env.template to .env and configure your environment variables."
fi

# Prompt for secrets if unset (e.g., GITHUB_TOKEN)
if [ -z "${GITHUB_TOKEN}" ]; then
    echo "GITHUB_TOKEN not set in environment."
    read -p "Enter your GitHub Token (for MCP GitHub integration): " GITHUB_TOKEN
    export GITHUB_TOKEN
    echo "Consider adding GITHUB_TOKEN to your .env file for persistence."
fi

# Verify Claude Code installation
echo "Verifying Claude Code installation..."
claude doctor || echo "Claude doctor check completed with warnings"

# Configure MCP servers from .mcp.json (project scope)
echo "Configuring MCP servers from .mcp.json..."
claude mcp add --json .mcp.json --scope project

# Test setup
echo "Testing MCP server configuration..."
claude mcp list

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Run 'claude doctor' to verify your installation"
echo "2. Copy .env.template to .env and configure your environment variables"
echo "3. Run 'claude' in your project directory to start coding"
echo ""
echo "Tips:"
echo "- Use 'claude mcp list' to view configured servers"
echo "- For global servers, edit ~/.claude.json (see claude-user-config-template.json)"
echo "- Restart your terminal if 'claude' command is not found"