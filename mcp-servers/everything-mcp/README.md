# Everything MCP Server

A Model Context Protocol (MCP) server that provides a comprehensive test and reference implementation of all MCP features. This wrapper provides easy integration with the official Everything MCP server by Anthropic.

## Overview

The Everything MCP server is a comprehensive test server that exercises **all features** of the MCP protocol. It is specifically designed as a reference implementation and test server for builders of MCP clients, showcasing the full capabilities of the Model Context Protocol.

**Note**: This server is not intended to be a useful production server, but rather serves as a comprehensive demonstration and testing tool for MCP protocol features.

## Features

- **Complete MCP Protocol Coverage**: Implements all MCP features including tools, resources, prompts, and sampling
- **Message Type Demonstrations**: Shows different message types (error, success, debug)
- **Image Handling**: Demonstrates image processing capabilities within MCP
- **Resource Management**: Showcases resource handling and management
- **Tool Integration**: Comprehensive tool implementation examples
- **Prompt Templates**: Example prompt implementations
- **Sampling Demonstrations**: Shows sampling capabilities
- **Elicitation Examples**: Demonstrates client elicitation features

## Prerequisites

- Node.js 18+ with npm and npx available
- Internet connection for downloading the official server package

## Installation

```bash
npm install
```

## Usage

### Basic Usage (STDIO Transport)

```bash
node index.js
```

### With Debug Mode

```bash
node index.js --debug
```

### HTTP Transport Mode

```bash
node index.js --transport http --port 8080
```

### Complete Configuration

```bash
node index.js --transport stdio --debug
```

## Configuration Options

```bash
node index.js [options]

Options:
  --transport, -t <type>    Transport type (stdio|http) [default: stdio]
  --port, -p <number>       HTTP server port (default: 8080)
  --host, -h <string>       HTTP server host (default: 0.0.0.0)
  --debug, -d              Enable debug mode [default: false]
  --help                   Show help
```

## Available Features

The Everything server provides comprehensive examples of:

### Tools
- Various tool implementations demonstrating MCP tool capabilities
- Error handling examples
- Parameter validation demonstrations
- Tool result formatting

### Resources
- Resource discovery and management
- Dynamic resource updates
- Resource metadata handling
- Resource content delivery

### Prompts
- Prompt template implementations
- Dynamic prompt generation
- Prompt parameter handling
- Prompt result processing

### Sampling
- Sampling request handling
- Response formatting
- Sampling parameter management
- Client-server sampling coordination

### Message Types
- Success message examples
- Error message demonstrations
- Debug message implementations
- Progress update examples

## Environment Variables

The server supports the following environment variables:
- `DEBUG`: Enable debug output (set to "1")
- `MCP_DEBUG`: Enable MCP-specific debug output (set to "1")
- `MCP_TRANSPORT`: Transport mode ("stdio" or "http")
- `MCP_PORT`: HTTP server port
- `MCP_HOST`: HTTP server host

## MCP Configuration

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "everything": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/everything-mcp/index.js"]
    }
  }
}
```

### Alternative Direct Configuration

```json
{
  "mcpServers": {
    "everything": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-everything"]
    }
  }
}
```

### HTTP Transport Configuration

```json
{
  "mcpServers": {
    "everything-http": {
      "type": "http",
      "url": "http://localhost:8080"
    }
  }
}
```

## Testing and Development

The Everything server is ideal for:

### Client Development
- Testing MCP client implementations
- Validating protocol compliance
- Debugging client-server communication
- Performance testing

### Feature Testing
- Testing all MCP protocol features
- Validating message handling
- Resource management testing
- Tool execution testing

### Protocol Compliance
- Ensuring protocol specification adherence
- Testing edge cases
- Validating error handling
- Message format validation

## Common Use Cases

### 1. MCP Client Development
Use the Everything server to test your MCP client implementation against all protocol features.

### 2. Protocol Learning
Explore all MCP capabilities through a single, comprehensive server implementation.

### 3. Debugging
Debug MCP client-server communication issues using the comprehensive logging and debug features.

### 4. Integration Testing
Test integration scenarios with a server that implements all MCP features.

## Error Handling

The server includes comprehensive error handling for:
- Missing npm/npx installation
- Network connectivity issues
- Package download failures
- Transport configuration errors
- Protocol communication errors

## Debug Mode

When debug mode is enabled, the server provides detailed logging of:
- Protocol message exchanges
- Tool execution details
- Resource access patterns
- Error conditions and stack traces
- Performance metrics

## Performance Considerations

As a comprehensive test server, the Everything server:
- May use more resources than production servers
- Includes extensive logging and debugging features
- Implements all protocol features (even unused ones)
- Is optimized for testing rather than production performance

## License

MIT License - This wrapper follows the same license as the official Everything MCP server by Anthropic.

## Related Links

- [Official Everything MCP Server](https://www.npmjs.com/package/@modelcontextprotocol/server-everything)
- [MCP Servers Repository](https://github.com/modelcontextprotocol/servers)
- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [MCP Protocol Specification](https://modelcontextprotocol.io/spec)