# Advanced Usage & Troubleshooting

## Individual Server Testing
Test any server independently:
```bash
# Test Sequential Thinking server
cd mcp-servers/sequential-thinking-mcp && npm test

# Test GitHub integration
cd mcp-servers/github-mcp && node index.js --help

# Test Brave Search
BRAVE_API_KEY=your_key node mcp-servers/brave-search-mcp/index.js --help
```

## Custom Server Addition
Add your own MCP servers:
```bash
mkdir mcp-servers/my-server
cd mcp-servers/my-server
npm init -y
# Implement your server
# Add to .mcp.json configuration
```

## Multi-Machine Deployment
For teams or multiple machines:
```bash
# Machine 1: Setup and configure
git clone https://github.com/YourUsername/mcp-servers-config.git
# Configure .env, test servers, commit changes
git add . && git commit -m "Configure for our team" && git push

# Machine 2+: One-command deploy
git clone https://github.com/YourUsername/mcp-servers-config.git
cd mcp-servers-config && ./setup.sh
```

## Performance & Usage
### Server Popularity (2025 Data)
- **Sequential Thinking**: 5,550+ active users - Complex problem solving
- **Brave Search**: 680+ active users - Privacy-focused search
- **Official Servers**: GitHub, Filesystem, Fetch, Everything - Enterprise standard
- **Productivity**: Notion, Slack - Team collaboration
- **Development**: Puppeteer, PostgreSQL, Memory Bank - Developer tools

### Resource Usage
- **Memory**: ~50MB per active server
- **Storage**: ~500MB total installation
- **Network**: Minimal (only for API calls)
- **CPU**: Low impact, scales with usage

## Troubleshooting
### Common Issues

**Setup fails with permission errors:**
```bash
sudo chmod +x setup.sh
sudo ./setup.sh
```

**Claude not found after installation:**
```bash
# Reload shell
source ~/.bashrc
# Or try direct installation
curl -fsSL https://claude.ai/install.sh | bash
```

**MCP servers not working:**
```bash
# Verify installation
claude mcp list
claude doctor

# Check environment
cat .env
echo $GITHUB_TOKEN
```

**API key issues:**
```bash
# Verify in environment
echo $GITHUB_TOKEN $NOTION_TOKEN $BRAVE_API_KEY

# Test individual servers
cd mcp-servers/github-mcp && node index.js --help
```

## Debug Mode
Enable detailed logging:
```bash
export CLAUDE_DEBUG=true
export MCP_DEBUG=true
claude
```
