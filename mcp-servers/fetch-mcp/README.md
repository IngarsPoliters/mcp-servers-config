# Fetch MCP Server

A Model Context Protocol (MCP) server that provides web content fetching and conversion capabilities. This wrapper provides easy integration with the official Fetch MCP server implementation by Anthropic.

## Features

- **Web Content Fetching**: Fetch content from any URL and convert to markdown
- **Multiple Formats**: Support for HTML, JSON, plain text, and markdown
- **Chunked Reading**: Read large web pages in chunks using start_index
- **Security Options**: Configurable robots.txt respect and proxy support
- **Flexible Installation**: Supports uvx, Docker, and npx installation methods
- **Custom User Agents**: Set custom user agent strings for requests
- **Timeout Control**: Configurable request timeouts

## Prerequisites

At least one of the following must be installed:
- **uvx** (recommended): `pip install uv`
- **Docker**: [Install Docker](https://docs.docker.com/get-docker/)
- **npx**: Part of Node.js installation

## Installation

```bash
npm install
```

## Usage

The server will automatically detect and use the best available method (uvx, docker, or npx):

### Basic Usage

```bash
node index.js
```

### With Custom Options

```bash
node index.js --ignore-robots-txt --user-agent "MyBot/1.0" --timeout 60
```

### Force Specific Method

```bash
node index.js --method docker
node index.js --method uvx
node index.js --method npx
```

## Configuration Options

```bash
node index.js [options]

Options:
  --ignore-robots-txt       Ignore robots.txt restrictions [default: false]
  --user-agent, -ua <str>   Custom user agent string
  --proxy-url, --proxy <str> Proxy URL for requests
  --timeout <number>        Request timeout in seconds [default: 30]
  --method, -m <method>     Installation method (uvx|docker|npx) [default: uvx]
  --help, -h               Show help
```

## Available Tools

### fetch
Fetches a URL from the internet and extracts its contents as markdown.

**Parameters:**
- `url` (string, required): The URL to fetch
- `start_index` (number, optional): Start position for chunked reading
- `max_length` (number, optional): Maximum content length to return

**Features:**
- Automatic content type detection
- HTML to markdown conversion
- Chunked reading for large pages
- Support for various content types (HTML, JSON, plain text)

## Environment Variables

The server respects the following environment variables when using Docker:
- `IGNORE_ROBOTS_TXT`: Set to "true" to ignore robots.txt
- `USER_AGENT`: Custom user agent string
- `PROXY_URL`: Proxy URL for requests

## MCP Configuration

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "fetch": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/fetch-mcp/index.js"]
    }
  }
}
```

### Alternative Configurations

#### Using uvx directly (if available)
```json
{
  "mcpServers": {
    "fetch": {
      "type": "stdio",
      "command": "uvx",
      "args": ["mcp-server-fetch"]
    }
  }
}
```

#### Using Docker directly
```json
{
  "mcpServers": {
    "fetch": {
      "type": "stdio",
      "command": "docker",
      "args": ["run", "-i", "--rm", "mcp/fetch"]
    }
  }
}
```

## Security Considerations

**Warning**: This server can access local/internal IP addresses and may represent a security risk. Exercise caution when using this MCP server to ensure it does not expose any sensitive data.

### Security Features
- Robots.txt respect (enabled by default)
- Custom user agent support
- Proxy support for network isolation
- Configurable timeouts

## Method Priority

The server automatically selects the best available method in this order:

1. **uvx** (fastest, most efficient)
2. **docker** (isolated, secure)
3. **npx** (fallback, requires Node.js)

## Error Handling

The server includes comprehensive error handling for:
- Missing installation methods
- Network connectivity issues
- Invalid URLs
- Timeout errors
- Robots.txt restrictions

## Examples

### Fetch a web page
```bash
# Using the MCP client, call the fetch tool with:
# url: "https://example.com"
```

### Fetch with chunked reading
```bash
# Call fetch with:
# url: "https://example.com"
# start_index: 1000
# max_length: 2000
```

## License

MIT License - This wrapper follows the same license as the official Fetch MCP server by Anthropic.

## Related Links

- [Official Fetch MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/fetch)
- [MCP Fetch PyPI Package](https://pypi.org/project/mcp-server-fetch/)
- [Model Context Protocol](https://modelcontextprotocol.io/)