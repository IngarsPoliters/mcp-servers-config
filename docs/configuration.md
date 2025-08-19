# Configuration

## Environment Variables
The [.env.template](../.env.template) file includes comprehensive configuration options:

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

## Server Configuration
All servers are configured in [`.mcp.json`](../.mcp.json) for project-scoped usage:

```json
{
  "mcpServers": {
    "sequential-thinking": { "command": "node", "args": ["mcp-servers/sequential-thinking-mcp"] },
    "github": { "command": "node", "args": ["mcp-servers/github-mcp"], "env": {"GITHUB_TOKEN": "${GITHUB_TOKEN}"} },
    "brave-search": { "command": "node", "args": ["mcp-servers/brave-search-mcp"], "env": {"BRAVE_API_KEY": "${BRAVE_API_KEY}"} }
    // ... and 8 more servers
  }
}
```
