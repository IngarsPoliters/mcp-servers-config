# 🚀 MCP Servers Config for Claude Code

**The ultimate portable setup for Claude Code with 10+ popular MCP servers on Linux!**

[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue)](https://modelcontextprotocol.io/)
[![Linux](https://img.shields.io/badge/Platform-Linux-green)](https://www.linux.org/)
[![2025 Ready](https://img.shields.io/badge/2025-Ready-brightgreen)](#)

This repository provides a **complete, portable setup** for Claude Code with the most popular Model Context Protocol (MCP) servers, ready to deploy on any Linux machine with a single command.

## 🌟 What's Included

### **🔥 Top MCP Servers (2025 Edition)**
Based on usage data from Smithery.ai and community adoption:

| Server | Usage | Description | Features |
|--------|--------|-------------|----------|
| **Sequential Thinking** | 5,550+ uses | Dynamic problem-solving through structured thinking | Multi-step reasoning, hypothesis generation, branch exploration |
| **GitHub** | Official | Complete GitHub/Git integration | File operations, repository management, search functionality |
| **Brave Search** | 680+ uses | Privacy-focused web search | Web/news/image search, AI summarization, local results |
| **Filesystem** | Official | Secure file system operations | Read/write files, directory management, configurable access |
| **Puppeteer** | Popular | Advanced web automation | Browser control, screenshots, form filling, JavaScript execution |
| **PostgreSQL** | Database | Secure database interactions | Query execution, schema inspection, read-only safety |
| **Fetch** | Official | Web content retrieval | HTML to markdown, chunked reading, efficient content processing |
| **Everything** | Official | Comprehensive MCP demo | Full protocol implementation, testing, development reference |
| **Notion** | Official | Workspace integration | Pages, databases, comments, complete workspace management |
| **Slack** | Enterprise | Team communication context | Channels, DMs, search, advanced messaging capabilities |
| **Memory Bank** | Utility | Persistent AI memory | Store/retrieve context, tagging, importance levels, search |

### **⚡ Enterprise Features**
- **Multi-Distro Support**: Ubuntu, Debian, RHEL, CentOS, Fedora, Arch Linux, openSUSE
- **Modern Installation**: 2025 Claude Code CLI with native binary support
- **Environment Management**: Comprehensive `.env` template with 25+ variables
- **Security**: Safe defaults, credential validation, permission controls
- **Documentation**: Detailed guides for each server with examples

## 🚀 Quick Start (30 seconds)

### **One-Command Setup**
```bash
git clone https://github.com/IngarsPoliters/mcp-servers-config.git && cd mcp-servers-config
npm install
./setup.sh
claude
```

That's it! Claude Code will start with all MCP servers configured and ready.

### **Step-by-Step Setup**
1. **Clone the repository**:
   ```bash
   git clone https://github.com/IngarsPoliters/mcp-servers-config.git
   cd mcp-servers-config
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment** (optional):
   ```bash
   cp .env.template .env
   # Edit .env with your API keys (GitHub token, Notion token, etc.)
   nano .env
   ```

4. **Run setup script**:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

5. **Verify installation**:
   ```bash
   claude doctor
   claude mcp list
   ```

6. **Start coding**:
   ```bash
   claude
   ```

## 🛠️ Configuration

### **Environment Variables**
The `.env.template` file includes comprehensive configuration options:

```bash
# Core System
FS_ROOT=/home/user                    # Filesystem root access
CLAUDE_DEBUG=false                    # Debug mode

# API Keys
GITHUB_TOKEN=ghp_xxx                  # GitHub integration
NOTION_TOKEN=secret_xxx               # Notion workspace access
SLACK_USER_TOKEN=xoxp-xxx            # Slack team access
BRAVE_API_KEY=BSAxxx                  # Brave Search API

# Database
DATABASE_URL=postgresql://...         # PostgreSQL connection
SQLITE_DB_PATH=/path/to/db.sqlite    # SQLite database

# Memory & Storage
MEMORY_BANK_PATH=/path/to/memory     # Persistent memory storage
MEMORY_IMPORTANCE_THRESHOLD=5        # Memory importance level
```

### **Server Configuration**
All servers are configured in `.mcp.json` for project-scoped usage:

```json
{
  "mcpServers": {
    "sequential-thinking": { "command": "node", "args": ["mcp-servers/sequential-thinking-mcp"] },
    "github": { "command": "node", "args": ["mcp-servers/github-mcp"], "env": {"GITHUB_TOKEN": "${GITHUB_TOKEN}"} },
    "brave-search": { "command": "node", "args": ["mcp-servers/brave-search-mcp"], "env": {"BRAVE_API_KEY": "${BRAVE_API_KEY}"} },
    // ... and 8 more servers
  }
}
```

## 🔧 Advanced Usage

### **Individual Server Testing**
Test any server independently:
```bash
# Test Sequential Thinking server
cd mcp-servers/sequential-thinking-mcp && npm test

# Test GitHub integration
cd mcp-servers/github-mcp && node index.js --help

# Test Brave Search
BRAVE_API_KEY=your_key node mcp-servers/brave-search-mcp/index.js --help
```

### **Custom Server Addition**
Add your own MCP servers:
```bash
mkdir mcp-servers/my-server
cd mcp-servers/my-server
npm init -y
# Implement your server
# Add to .mcp.json configuration
```

### **Multi-Machine Deployment**
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

## 📊 Performance & Usage

### **Server Popularity (2025 Data)**
- **Sequential Thinking**: 5,550+ active users - Complex problem solving
- **Brave Search**: 680+ active users - Privacy-focused search
- **Official Servers**: GitHub, Filesystem, Fetch, Everything - Enterprise standard
- **Productivity**: Notion, Slack - Team collaboration
- **Development**: Puppeteer, PostgreSQL, Memory Bank - Developer tools

### **Resource Usage**
- **Memory**: ~50MB per active server
- **Storage**: ~500MB total installation
- **Network**: Minimal (only for API calls)
- **CPU**: Low impact, scales with usage

## 🔍 Troubleshooting

### **Common Issues**

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

### **Debug Mode**
Enable detailed logging:
```bash
export CLAUDE_DEBUG=true
export MCP_DEBUG=true
claude
```

## 🤝 Contributing

### **Adding New Servers**
1. Research popular MCP servers at [awesome-mcp-servers](https://github.com/wong2/awesome-mcp-servers)
2. Create server directory in `mcp-servers/`
3. Implement server with proper package.json, index.js, README.md
4. Add to `.mcp.json` configuration
5. Update `.env.template` with new environment variables
6. Test thoroughly and submit PR

### **Improving Existing Servers**
1. Check server-specific README in `mcp-servers/[server-name]/README.md`
2. Follow MCP 2025 standards
3. Ensure compatibility with latest `@modelcontextprotocol/sdk`
4. Add comprehensive error handling
5. Update documentation

## 📋 Compatibility

### **Supported Platforms**
- ✅ **Ubuntu** 20.04+ (apt)
- ✅ **Debian** 11+ (apt) 
- ✅ **RHEL/CentOS** 8+ (yum/dnf)
- ✅ **Fedora** 35+ (dnf)
- ✅ **Arch Linux** (pacman)
- ✅ **openSUSE** (zypper)

### **Requirements**
- **Node.js**: 18+ (auto-installed)
- **npm**: 9+ (included with Node.js)
- **Claude Code CLI**: Latest (auto-installed)
- **Internet**: For API-based servers
- **Storage**: 500MB available space

### **MCP Client Support**
- ✅ **Claude Code CLI** (primary)
- ✅ **Cursor IDE** (via MCP configuration)
- ✅ **VS Code** (via MCP extensions)
- ✅ **Custom MCP clients** (stdio transport)

## 🔐 Security

### **Best Practices Implemented**
- **Read-only defaults**: Database and filesystem servers use safe permissions
- **Environment isolation**: API keys stored in environment variables
- **Credential validation**: Servers validate tokens before operation
- **Safe execution**: Sandboxed server execution with error boundaries
- **Access controls**: Configurable permission levels per server

### **API Key Security**
```bash
# Use environment variables (recommended)
export GITHUB_TOKEN=ghp_xxxxx

# Or secure .env file
chmod 600 .env
echo ".env" >> .gitignore
```

## 📚 Additional Resources

- **Official MCP Documentation**: https://modelcontextprotocol.io/
- **Claude Code Docs**: https://docs.anthropic.com/en/docs/claude-code
- **MCP Server Registry**: https://github.com/wong2/awesome-mcp-servers
- **Community Forum**: https://github.com/modelcontextprotocol/discussions

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Anthropic** for Claude Code and MCP protocol
- **MCP Community** for server implementations
- **Smithery.ai** for usage statistics
- **Contributors** to awesome-mcp-servers

---

**⭐ If this repository helps you, please star it to help others find it!**

**🐛 Found an issue? [Report it here](https://github.com/IngarsPoliters/mcp-servers-config/issues)**

**💡 Want to contribute? [Check our guidelines](CONTRIBUTING.md)**