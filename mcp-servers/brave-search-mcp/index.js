#!/usr/bin/env node

const { parseArgs, launch } = require('../common/launcher');

// Parse command line arguments
const argv = parseArgs(yargs => yargs
  .option('api-key', {
    type: 'string',
    description: 'Brave Search API key',
    alias: 'k'
  })
  .option('transport', {
    type: 'string',
    description: 'Transport mode (stdio or http)',
    choices: ['stdio', 'http'],
    default: 'stdio',
    alias: 't'
  })
  .option('port', {
    type: 'number',
    description: 'HTTP server port (when using http transport)',
    default: 8080,
    alias: 'p'
  })
  .option('host', {
    type: 'string',
    description: 'HTTP server host (when using http transport)',
    default: '0.0.0.0',
    alias: 'h'
  }));

class BraveSearchMCPProxy {
  constructor() {
    this.apiKey = argv.apiKey || process.env.BRAVE_API_KEY;
    this.transport = argv.transport || process.env.BRAVE_MCP_TRANSPORT || 'stdio';
    this.port = argv.port || process.env.BRAVE_MCP_PORT || 8080;
    this.host = argv.host || process.env.BRAVE_MCP_HOST || '0.0.0.0';
  }

  async run() {
    // Check if API key is provided
    if (!this.apiKey) {
      console.error('Error: Brave Search API key is required.');
      console.error('Set BRAVE_API_KEY environment variable or use --api-key flag');
      console.error('');
      console.error('To get an API key:');
      console.error('1. Sign up at https://brave.com/search/api/');
      console.error('2. Generate your API key from the developer dashboard');
      console.error('3. Set the key as an environment variable or pass it with --api-key');
      process.exit(1);
    }

    const args = ['-y', '@brave/brave-search-mcp-server'];

    // Add transport-specific arguments
    if (this.transport === 'http') {
      args.push('--transport', 'http', '--port', this.port.toString(), '--host', this.host);
    } else {
      args.push('--transport', 'stdio');
    }

    launch({
      command: 'npx',
      args,
      env: {
        ...process.env,
        BRAVE_API_KEY: this.apiKey,
        BRAVE_MCP_TRANSPORT: this.transport,
        BRAVE_MCP_PORT: this.port.toString(),
        BRAVE_MCP_HOST: this.host
      },
      name: 'Brave Search MCP Server',
      onError: () => {
        console.error('Make sure npm/npx is installed and accessible in your PATH');
      }
    });
  }
}

// Start proxy server
const proxy = new BraveSearchMCPProxy();
proxy.run().catch((error) => {
  console.error('Failed to start Brave Search MCP proxy:', error.message);
  process.exit(1);
});
