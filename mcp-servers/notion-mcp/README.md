# Notion MCP Server

A Model Context Protocol (MCP) server that provides seamless integration with Notion workspaces. This wrapper provides easy integration with the official Notion MCP server implementation.

## Features

- **Full Notion API Access**: Complete integration with Notion's API for pages, databases, and comments
- **Workspace Management**: Create, read, update pages and databases
- **Content Operations**: Add comments, search content, and manage workspace data
- **Flexible Authentication**: Support for integration tokens and advanced header configurations
- **Multiple Transport Options**: STDIO and HTTP transport modes
- **Multiple Installation Methods**: NPM, Docker official image, or local Docker build
- **Security Controls**: Configurable integration capabilities and access controls

## Prerequisites

- Notion workspace with integration setup
- At least one of the following:
  - Node.js 18+ with npm/npx
  - Docker installation

## Notion Integration Setup

### 1. Create Notion Integration

1. Go to [https://www.notion.so/profile/integrations](https://www.notion.so/profile/integrations)
2. Create a new **internal** integration
3. Configure capabilities (read/write permissions as needed)
4. Copy the integration token (starts with `ntn_`)

### 2. Connect Pages to Integration

**Option A: Bulk Access (Recommended)**
1. Visit the **Access** tab in your integration settings
2. Edit access and select the pages you want to use

**Option B: Individual Page Access**
1. Go to the target Notion page
2. Click the 3 dots menu → "Connect to integration"
3. Select your integration

## Installation

```bash
npm install
```

## Usage

### Basic Usage (STDIO Transport)

```bash
export NOTION_TOKEN="ntn_your_token_here"
node index.js
```

### With Command Line Token

```bash
node index.js --token "ntn_your_token_here"
```

### HTTP Transport Mode

```bash
node index.js --transport http --port 3000 --auth-token "your-http-auth-token"
```

### Using Docker

```bash
node index.js --method docker-official --token "ntn_your_token_here"
```

## Configuration Options

```bash
node index.js [options]

Options:
  --token, -t <string>         Notion integration token
  --transport, -tr <type>      Transport mode (stdio|http) [default: stdio]
  --port, -p <number>          HTTP server port [default: 3000]
  --auth-token, --auth <str>   HTTP auth token (http transport only)
  --headers, -h <json>         Custom headers as JSON (advanced use)
  --method, -m <method>        Installation method [default: npm]
                              (npm|docker-official|docker-local)
  --help                      Show help
```

## Available Tools

The Notion MCP server provides comprehensive tools for workspace management:

### Page Operations
- **Create Pages**: Add new pages to your workspace
- **Read Pages**: Retrieve page content and metadata
- **Update Pages**: Modify existing page content
- **Search Pages**: Find pages by title or content

### Database Operations
- **Query Databases**: Search and filter database entries
- **Create Database Entries**: Add new records to databases
- **Update Database Entries**: Modify existing database records
- **Database Schema**: Access database structure and properties

### Content Operations
- **Add Comments**: Comment on pages and database entries
- **Search Content**: Full-text search across workspace content
- **Content Retrieval**: Get specific content by ID

## Environment Variables

- `NOTION_TOKEN`: Your Notion integration token (recommended)
- `OPENAPI_MCP_HEADERS`: Advanced header configuration as JSON
- `AUTH_TOKEN`: HTTP authentication token (for HTTP transport)

## MCP Configuration

### STDIO Transport (Recommended)

```json
{
  "mcpServers": {
    "notion": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/notion-mcp/index.js"],
      "env": {
        "NOTION_TOKEN": "${NOTION_TOKEN}"
      }
    }
  }
}
```

### Using NPM Directly

```json
{
  "mcpServers": {
    "notion": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "NOTION_TOKEN": "${NOTION_TOKEN}"
      }
    }
  }
}
```

### Using Docker Official Image

```json
{
  "mcpServers": {
    "notion": {
      "type": "stdio",
      "command": "docker",
      "args": ["run", "--rm", "-i", "-e", "NOTION_TOKEN", "mcp/notion"],
      "env": {
        "NOTION_TOKEN": "${NOTION_TOKEN}"
      }
    }
  }
}
```

### HTTP Transport Configuration

```json
{
  "mcpServers": {
    "notion-http": {
      "type": "http",
      "url": "http://localhost:3000/mcp",
      "headers": {
        "Authorization": "Bearer your-auth-token-here"
      }
    }
  }
}
```

## Advanced Configuration

### Custom Headers (Advanced Use)

For advanced authentication scenarios:

```bash
export OPENAPI_MCP_HEADERS='{"Authorization": "Bearer ntn_your_token", "Notion-Version": "2022-06-28"}'
node index.js --headers "$OPENAPI_MCP_HEADERS"
```

### HTTP Transport with Authentication

```bash
node index.js --transport http --port 8080 --auth-token "secure-random-token"
```

The server will display the authentication details for HTTP requests:

```
Generated auth token: your-secure-token-here
Use this token in the Authorization header: Bearer your-secure-token-here
```

## Usage Examples

### Create a Page
```
Add a page titled "Project Updates" to page "Work"
```

### Add Comments
```
Comment "Great work on this!" on page "Team Meeting Notes"
```

### Search Content
```
Find all pages containing "quarterly review"
```

### Get Page Content
```
Get the content of page 1a6b35e6e67f802fa7e1d27686f017f2
```

## Security Considerations

### Integration Capabilities
Configure your Notion integration with minimal required permissions:
- **Read-only**: Enable only "Read content" capability
- **Limited scope**: Connect only necessary pages/databases
- **Regular review**: Periodically audit integration access

### Token Security
- Store tokens securely (environment variables, not code)
- Use different integrations for different purposes
- Rotate tokens periodically
- Monitor integration usage in Notion

### Network Security
- Use HTTPS for HTTP transport in production
- Implement proper authentication for HTTP transport
- Consider network isolation for sensitive workspaces

## Error Handling

The server includes comprehensive error handling for:
- Missing or invalid Notion tokens
- Network connectivity issues
- Notion API rate limiting
- Invalid page/database permissions
- Transport configuration errors

## Troubleshooting

### Common Issues

**"Missing integration token"**
- Ensure `NOTION_TOKEN` is set or `--token` is provided
- Verify the token starts with `ntn_`

**"Page not found"**
- Check that the integration has access to the page
- Visit page → 3 dots → Connect to integration

**"Docker not available"**
- Install Docker or switch to `--method npm`
- Ensure Docker daemon is running

**"Permission denied"**
- Review integration capabilities in Notion settings
- Ensure integration has required read/write permissions

## License

MIT License - This wrapper follows the same license as the official Notion MCP server.

## Related Links

- [Official Notion MCP Server](https://github.com/makenotion/notion-mcp-server)
- [Notion API Documentation](https://developers.notion.com/reference/intro)
- [Notion Integration Setup](https://www.notion.so/profile/integrations)
- [Model Context Protocol](https://modelcontextprotocol.io/)