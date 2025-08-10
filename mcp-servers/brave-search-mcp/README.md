# Brave Search MCP Server

A Model Context Protocol (MCP) server that provides privacy-focused search capabilities using the Brave Search API. This wrapper provides easy integration with the official Brave Search MCP server implementation.

## Features

- **Web Search**: Comprehensive web search with rich result types and advanced filtering
- **Local Search**: Find local businesses and places with detailed information
- **Image Search**: Search for images with automatic fetching and base64 encoding
- **Video Search**: Find videos with comprehensive metadata and thumbnails
- **News Search**: Current news articles with freshness controls
- **AI Summarization**: Generate AI-powered summaries from search results
- **Privacy-Focused**: Uses Brave's privacy-respecting search engine
- **Multiple Transports**: Supports both STDIO and HTTP transports

## Prerequisites

- Node.js 18+ or npx available
- Brave Search API key (get one at https://brave.com/search/api/)

## API Key Setup

1. Sign up for a [Brave Search API account](https://brave.com/search/api/)
2. Choose a plan:
   - **Free**: 2,000 queries/month, basic web search
   - **Pro**: Enhanced features including local search, AI summaries, extra snippets
3. Generate your API key from the [developer dashboard](https://api-dashboard.search.brave.com/app/keys)

## Installation

```bash
npm install
```

## Usage

### Environment Variable (Recommended)

```bash
export BRAVE_API_KEY="your-api-key-here"
node index.js
```

### Command Line Flag

```bash
node index.js --api-key "your-api-key-here"
```

### Configuration Options

```bash
node index.js [options]

Options:
  --api-key, -k <string>    Brave Search API key
  --transport, -t <type>    Transport mode (stdio|http) [default: stdio]
  --port, -p <number>       HTTP server port (default: 8080)
  --host, -h <string>       HTTP server host (default: 0.0.0.0)
  --help                    Show help
```

## Available Tools

### brave_web_search
Performs comprehensive web searches with rich result types and advanced filtering options.

**Parameters:**
- `query` (string, required): Search terms (max 400 chars, 50 words)
- `country` (string, optional): Country code (default: "US")
- `search_lang` (string, optional): Search language (default: "en")
- `count` (number, optional): Results per page (1-20, default: 10)
- `safesearch` (string, optional): Content filtering ("off", "moderate", "strict")
- `freshness` (string, optional): Time filter ("pd", "pw", "pm", "py")
- `summary` (boolean, optional): Enable summary generation for AI

### brave_local_search
Searches for local businesses and places with detailed information.

**Note:** Requires Pro plan for full local search capabilities.

### brave_image_search
Searches for images with automatic fetching and base64 encoding.

### brave_video_search
Searches for videos with comprehensive metadata and thumbnails.

### brave_news_search
Searches for current news articles with freshness controls.

### brave_summarizer
Generates AI-powered summaries from web search results.

## Environment Variables

- `BRAVE_API_KEY`: Your Brave Search API key (required)
- `BRAVE_MCP_TRANSPORT`: Transport mode ("http" or "stdio", default: "stdio")
- `BRAVE_MCP_PORT`: HTTP server port (default: 8080)
- `BRAVE_MCP_HOST`: HTTP server host (default: "0.0.0.0")

## MCP Configuration

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "brave-search": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/brave-search-mcp/index.js"],
      "env": {
        "BRAVE_API_KEY": "${BRAVE_API_KEY}"
      }
    }
  }
}
```

## Error Handling

The server includes comprehensive error handling for:
- Missing API keys
- Network connectivity issues
- API rate limiting
- Invalid search parameters
- Transport-specific errors

## License

MIT License - This wrapper follows the same license as the official Brave Search MCP server.

## Related Links

- [Official Brave Search MCP Server](https://github.com/brave/brave-search-mcp-server)
- [Brave Search API Documentation](https://brave.com/search/api/)
- [Model Context Protocol](https://modelcontextprotocol.io/)