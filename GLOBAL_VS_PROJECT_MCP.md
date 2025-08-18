# 🌍 Global vs Project-Specific MCP Configuration Guide

This guide explains how to set up MCP servers globally (available in all Claude Code sessions) vs project-specifically (only in certain directories).

## 📋 Quick Summary

| Configuration Type | File Location | Scope | Use Case |
|-------------------|---------------|-------|----------|
| **Global** | `~/.claude.json` | All Claude sessions | Common tools (filesystem, browser, GitHub) |
| **Project** | `.mcp.json` | Current project only | Specialized tools for specific projects |

---

## 🌍 Global MCP Configuration

### Purpose
Global MCP servers are available in **every Claude Code session**, regardless of which directory you're in. Perfect for:

- **File system access** (browse files anywhere)
- **Web browsing** and search capabilities  
- **GitHub integration** (works across all repos)
- **General-purpose tools** (fetch, memory, thinking)

### Setup Process

1. **Run the global setup script:**
   ```bash
   ./setup-global-mcp.sh
   ```

2. **Configure environment variables:**
   ```bash
   # Edit the generated template
   nano ~/.claude-mcp.env
   
   # Add your API keys:
   export GITHUB_TOKEN="ghp_your_token_here"
   export BRAVE_API_KEY="your_brave_key_here"
   
   # Source it in your shell profile
   echo "source ~/.claude-mcp.env" >> ~/.bashrc
   ```

3. **Global servers are now available everywhere!**

### Global Configuration Structure
The setup script modifies `~/.claude.json`:

```json
{
  "mcpServers": {
    "filesystem": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "..."],
      "env": { "FS_ROOT": "${HOME}" }
    },
    "github": {
      "type": "stdio", 
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "${GITHUB_TOKEN}" }
    }
    // ... more global servers
  }
}
```

---

## 🏗️ Project-Specific MCP Configuration

### Purpose
Project MCP servers are **only active in specific project directories**. Perfect for:

- **Database connections** specific to a project
- **Custom APIs** and integrations
- **Specialized tools** for particular tech stacks
- **Development servers** and project tooling

### Setup Process

1. **Create `.mcp.json` in your project directory:**
   ```bash
   cd /path/to/your/project
   cp /path/to/template/.mcp.json .
   ```

2. **Customize for your project needs:**
   ```json
   {
     "mcpServers": {
       "postgres": {
         "type": "stdio",
         "command": "node",
         "args": ["./mcp-servers/postgres-mcp/index.js"],
         "env": {
           "DATABASE_URL": "${DATABASE_URL}"
         }
       },
       "project-api": {
         "type": "stdio", 
         "command": "node",
         "args": ["./custom-mcp-server.js"]
       }
     }
   }
   ```

3. **Create project-specific `.env` file:**
   ```bash
   # .env (project-specific)
   DATABASE_URL=postgresql://localhost:5432/myproject
   API_KEY=project_specific_key
   ```

---

## 🔄 Configuration Hierarchy & Priority

Claude Code loads MCP configurations in this order:

1. **Project-specific** `.mcp.json` (highest priority)
2. **Global** `~/.claude.json` mcpServers (fallback)
3. **Merge behavior**: Project configs override global ones by server name

### Example Scenario
- **Global**: GitHub, filesystem, browser tools
- **Project A**: Custom database + API servers (+ inherits global)
- **Project B**: Different database + messaging tools (+ inherits global)

When in **Project A directory**: You get Project A servers + Global servers
When in **any other directory**: You only get Global servers

---

## 🛠️ Recommended Setup Strategy

### Phase 1: Set Up Global Foundation
```bash
# Run once after installing Claude Code
./setup-global-mcp.sh

# Configure your common API keys
nano ~/.claude-mcp.env
source ~/.claude-mcp.env
```

**Global servers to include:**
- ✅ Filesystem (file access everywhere)
- ✅ GitHub (git operations)
- ✅ Browser tools (web automation)
- ✅ Fetch (HTTP requests)
- ✅ Memory bank (persistent memory)

### Phase 2: Add Project-Specific Tools
```bash
# In each project directory
cp template/.mcp.json .mcp.json

# Customize per project:
# - Database connections
# - Project APIs
# - Custom tooling
# - Development servers
```

---

## 📁 File Structure Example

```
~/.claude.json              # Global MCP config
~/.claude-mcp.env           # Global environment variables

/project-a/
├── .mcp.json              # Project A specific MCP servers  
├── .env                   # Project A environment variables
└── mcp-servers/           # Custom project servers

/project-b/
├── .mcp.json              # Project B specific MCP servers
├── .env                   # Project B environment variables  
└── custom-servers/        # Different custom servers

/some-other-directory/      # Only global MCP servers available here
```

---

## ✅ Verification & Testing

### Check Global Configuration
```bash
# From any directory
claude mcp list

# Should show your global servers (filesystem, github, etc.)
```

### Check Project Configuration  
```bash
# From project directory with .mcp.json
cd /path/to/project
claude mcp list

# Should show: Project servers + Global servers
```

### Debug Configuration Issues
```bash
# Check Claude configuration
claude doctor

# Validate JSON files
jq . ~/.claude.json
jq . .mcp.json  # in project directory
```

---

## 🔧 Troubleshooting

### Common Issues

1. **Environment variables not loading:**
   ```bash
   # Make sure variables are exported
   source ~/.claude-mcp.env
   echo $GITHUB_TOKEN  # Should show your token
   ```

2. **Project servers not loading:**
   - Verify `.mcp.json` is in current directory
   - Check JSON syntax with `jq . .mcp.json`
   - Ensure server executables exist

3. **Global servers missing:**
   - Verify `~/.claude.json` has `mcpServers` section
   - Check npm global packages: `npm list -g --depth=0`

### Reset Configuration
```bash
# Backup and reset global config
cp ~/.claude.json ~/.claude.json.backup
echo '{"mcpServers": {}}' > ~/.claude.json

# Re-run global setup
./setup-global-mcp.sh
```

---

## 🎯 Best Practices

### ✅ Do's
- Use **global** for universal tools (filesystem, GitHub, browser)
- Use **project-specific** for databases and custom APIs  
- Keep sensitive tokens in environment variables
- Version control `.mcp.json` but not `.env` files
- Test configurations with `claude mcp list`

### ❌ Don'ts
- Don't hardcode secrets in configuration files
- Don't duplicate servers between global and project configs
- Don't commit `.env` files to version control
- Don't use absolute paths that won't work on other machines

---

## 🚀 Advanced Configuration

### Environment Variable Expansion
Both global and project configs support environment variable expansion:

```json
{
  "mcpServers": {
    "custom": {
      "env": {
        "API_URL": "${PROJECT_API_URL:-https://api.example.com}",
        "TOKEN": "${PROJECT_TOKEN}"
      }
    }
  }
}
```

### Conditional Loading
Create different configurations for different environments:

```bash
# Development
export MCP_ENV=development
cp .mcp.dev.json .mcp.json

# Production  
export MCP_ENV=production
cp .mcp.prod.json .mcp.json
```

---

This guide provides everything you need to set up both global and project-specific MCP configurations effectively! 🎉