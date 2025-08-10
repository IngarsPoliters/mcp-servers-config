#!/bin/bash

# Exit on errors
set -e

# Install Node.js if missing (Ubuntu/Debian; adapt for other distros)
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    sudo apt update
    sudo apt install -y nodejs npm
fi

# Install Claude Code CLI globally (2025 Anthropic method)
if ! command -v claude &> /dev/null; then
    echo "Installing Claude Code CLI..."
    npm install -g @anthropic-ai/claude-code
fi

# Install common MCP server packages globally
echo "Installing MCP server packages..."
npm install -g @modelcontextprotocol/server-github @modelcontextprotocol/server-filesystem @modelcontextprotocol/server-puppeteer  # Add more as needed

# Prompt for secrets if unset (e.g., GITHUB_TOKEN)
if [ -z "${GITHUB_TOKEN}" ]; then
    read -p "Enter your GitHub Token (for MCP): " GITHUB_TOKEN
    export GITHUB_TOKEN
    echo "export GITHUB_TOKEN=${GITHUB_TOKEN}" >> ~/.bashrc  # Persist for session
fi

# Configure MCP servers from .mcp.json (project scope)
echo "Configuring MCP servers..."
claude mcp add --json .mcp.json --scope project

# Alternative: Add via CLI for remotes or customs (idempotent)
claude mcp add github --scope project -- npx -y @modelcontextprotocol/server-github --env GITHUB_TOKEN=${GITHUB_TOKEN} || true
claude mcp add filesystem --scope project -- npx -y @modelcontextprotocol/server-filesystem --env FS_ROOT=${PWD} || true
claude mcp add docker-hub-remote --scope project --transport http https://mcp.docker.com/hub || true  # 2025 remote example

# Test setup
claude mcp list
echo "Setup complete! Run 'claude' to start using Claude Code with MCP servers."
echo "Tip: For global servers, copy claude-user-config-template.json to ~/.claude.json and edit."