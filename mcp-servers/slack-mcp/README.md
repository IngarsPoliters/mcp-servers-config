# Slack MCP Server

A Model Context Protocol (MCP) server that provides comprehensive team communication and workspace integration with Slack. This wrapper provides easy integration with powerful Slack MCP server implementations.

## Features

- **Complete Slack Integration**: Full access to channels, DMs, threads, and workspace data
- **Multiple Authentication Modes**: Stealth mode (no permissions) and OAuth token support
- **Smart Message Handling**: Fetch messages by date/count with intelligent pagination
- **Advanced Search**: Search messages across channels, threads, and DMs with filters
- **Safe Message Posting**: Configurable message posting with channel restrictions
- **Enterprise Support**: Works with Enterprise Slack environments
- **Multiple Transports**: STDIO and Server-Sent Events (SSE) support
- **Comprehensive Coverage**: Channels, DMs, Group DMs, threads, and user management
- **Performance Optimized**: Caching system for users and channels

## Prerequisites

- Slack workspace access
- At least one of the following:
  - Go 1.18+ (for korotovsky implementation - recommended)
  - Node.js 18+ with npm/npx (for alternative implementations)

## Slack Authentication Setup

You need one of the following authentication methods:

### Method 1: User OAuth Token (Recommended)
1. Create a Slack app at [https://api.slack.com/apps](https://api.slack.com/apps)
2. Add OAuth scopes (channels:read, chat:write, etc.)
3. Install the app to your workspace
4. Use the `xoxp-` token

### Method 2: Browser Tokens (Stealth Mode)
1. Open Slack in your browser
2. Extract `xoxc-` and `xoxd-` tokens from browser cookies/localStorage
3. No additional permissions required

For detailed setup instructions, visit: [Authentication Setup Guide](https://github.com/korotovsky/slack-mcp-server/blob/master/docs/01-authentication-setup.md)

## Installation

```bash
npm install
```

## Usage

### Basic Usage with OAuth Token

```bash
export SLACK_MCP_XOXP_TOKEN="xoxp-your-oauth-token"
node index.js
```

### Using Browser Tokens (Stealth Mode)

```bash
export SLACK_MCP_XOXC_TOKEN="xoxc-your-browser-token"
export SLACK_MCP_XOXD_TOKEN="xoxd-your-browser-cookie"
node index.js
```

### Command Line Options

```bash
node index.js --xoxp-token "xoxp-your-token"
node index.js --xoxc-token "xoxc-token" --xoxd-token "xoxd-token"
```

### SSE Transport Mode

```bash
node index.js --transport sse --port 13080 --sse-api-key "your-api-key"
```

## Configuration Options

```bash
node index.js [options]

Authentication:
  --xoxp-token, --xoxp <str>     User OAuth token (xoxp-...)
  --xoxc-token, --xoxc <str>     Slack browser token (xoxc-...)
  --xoxd-token, --xoxd <str>     Slack browser cookie d (xoxd-...)

Transport:
  --transport, -t <type>         Transport mode (stdio|sse) [default: stdio]
  --port, -p <number>           Port for MCP server [default: 13080]
  --host, -h <string>           Host for MCP server [default: 127.0.0.1]
  --sse-api-key, --key <str>    Bearer token for SSE transport

Advanced:
  --proxy, --px <url>           Proxy URL for outgoing requests
  --user-agent, --ua <str>      Custom User-Agent for Enterprise Slack
  --enable-messaging, --msg <str> Enable message posting (see security)
  --log-level, --log <level>    Log level [default: info]
  --implementation, --impl <type> Implementation (korotovsky|avimbu) [default: korotovsky]
  --help                        Show help
```

## Available Tools

### Message Operations
- **conversations_history**: Get messages from channels and DMs with smart pagination
- **conversations_replies**: Fetch thread messages with full context
- **conversations_add_message**: Post messages to channels/DMs (when enabled)
- **conversations_search_messages**: Advanced search across workspace

### Workspace Management  
- **channels_list**: List all channels, DMs, and groups with metadata

### Resources
- **slack://<workspace>/channels**: CSV directory of all channels
- **slack://<workspace>/users**: CSV directory of all users

## Environment Variables

### Required Authentication (choose one method)
```bash
# Method 1: OAuth Token
SLACK_MCP_XOXP_TOKEN="xoxp-your-oauth-token"

# Method 2: Browser Tokens
SLACK_MCP_XOXC_TOKEN="xoxc-your-browser-token"
SLACK_MCP_XOXD_TOKEN="xoxd-your-browser-cookie"
```

### Optional Configuration
```bash
SLACK_MCP_PORT=13080                    # Server port
SLACK_MCP_HOST=127.0.0.1               # Server host
SLACK_MCP_SSE_API_KEY="bearer-token"   # SSE authentication
SLACK_MCP_PROXY="http://proxy:8080"    # Proxy configuration
SLACK_MCP_USER_AGENT="CustomAgent/1.0" # Custom user agent
SLACK_MCP_LOG_LEVEL="info"             # Logging level
SLACK_MCP_ADD_MESSAGE_TOOL="C123,C456" # Enable messaging for specific channels
```

## MCP Configuration

### STDIO Transport (Recommended)

```json
{
  "mcpServers": {
    "slack": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/slack-mcp/index.js"],
      "env": {
        "SLACK_MCP_XOXP_TOKEN": "${SLACK_OAUTH_TOKEN}"
      }
    }
  }
}
```

### SSE Transport Configuration

```json
{
  "mcpServers": {
    "slack-sse": {
      "type": "http",
      "url": "http://localhost:13080/mcp",
      "headers": {
        "Authorization": "Bearer your-api-key"
      }
    }
  }
}
```

### Browser Tokens Configuration

```json
{
  "mcpServers": {
    "slack": {
      "type": "stdio", 
      "command": "node",
      "args": ["/path/to/slack-mcp/index.js"],
      "env": {
        "SLACK_MCP_XOXC_TOKEN": "${SLACK_XOXC_TOKEN}",
        "SLACK_MCP_XOXD_TOKEN": "${SLACK_XOXD_TOKEN}"
      }
    }
  }
}
```

## Usage Examples

### Fetch Recent Messages
```
Get the last 50 messages from #general channel
```

### Search Messages
```
Search for "project update" in #announcements from last week
```

### Post Message (when enabled)
```
Post "Meeting starts in 10 minutes!" to #team-standup
```

### Get Thread Messages
```
Get all replies in the thread from message timestamp 1234567890.123456 in #development
```

### Channel Analytics
```
List all channels with member counts sorted by popularity
```

## Security Features

### Message Posting Control
Message posting is **disabled by default** for safety. Enable it by setting:

```bash
# Enable for all channels
SLACK_MCP_ADD_MESSAGE_TOOL="true"

# Enable for specific channels only  
SLACK_MCP_ADD_MESSAGE_TOOL="C1234567890,C0987654321"

# Enable for all except specific channels
SLACK_MCP_ADD_MESSAGE_TOOL="!C1234567890,!C0987654321"
```

### Authentication Modes
- **OAuth Mode**: Secure, permission-based access
- **Stealth Mode**: No additional permissions required (browser tokens)
- **Enterprise Support**: Custom TLS and proxy configurations

### Network Security
- Proxy support for corporate environments
- Custom TLS configurations
- Configurable user agents for Enterprise Slack

## Performance & Caching

The server includes intelligent caching for:
- **User Information**: Cached to avoid repeated API calls
- **Channel Metadata**: Cached for faster channel operations
- **Message History**: Smart pagination and history management

Cache files (configurable):
- `.users_cache.json`: User information cache
- `.channels_cache_v2.json`: Channel metadata cache

## Troubleshooting

### Authentication Issues
- Verify tokens are correct and not expired
- Check token permissions and scopes
- For browser tokens, ensure they're extracted correctly

### Connection Problems
- Check proxy configuration if using corporate network
- Verify Slack workspace permissions
- Test tokens with Slack API directly

### Performance Issues
- Enable caching for better performance
- Adjust log levels to reduce output
- Use specific channel filters in searches

### Enterprise Environments
- Set custom user agent: `--user-agent "YourCompany/1.0"`
- Configure proxy: `--proxy "http://proxy.company.com:8080"`
- Enable custom TLS if required

## Implementation Options

### Korotovsky (Default - Recommended)
- Most feature-rich implementation
- Go-based for performance
- Supports all advanced features
- Active development and maintenance

### AVIMBU (Alternative)
- Node.js-based implementation
- Simpler setup (no Go required)
- Basic functionality focused

## Error Handling

Comprehensive error handling for:
- Authentication failures
- Network connectivity issues
- Slack API rate limiting
- Invalid channel/user references
- Permission denied errors

## License

MIT License - This wrapper follows the same license terms as the underlying implementations.

## Related Links

- [Korotovsky Slack MCP Server](https://github.com/korotovsky/slack-mcp-server) (Primary implementation)
- [AVIMBU Slack MCP Server](https://github.com/AVIMBU/slack-mcp-server) (Alternative)
- [Slack API Documentation](https://api.slack.com/web)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## Contributing

This wrapper supports multiple Slack MCP implementations. Contributions welcome for:
- Additional implementation support
- Enhanced error handling
- Documentation improvements
- Security enhancements