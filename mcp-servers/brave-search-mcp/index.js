#!/usr/bin/env node

const { spawn } = require('child_process');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
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
  })
  .help()
  .alias('help', 'help')
  .parse();

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

    // Start the Brave Search MCP server using npx
    console.error('Starting Brave Search MCP Server...');
    
    const args = ['-y', '@brave/brave-search-mcp-server'];
    
    // Add transport-specific arguments
    if (this.transport === 'http') {
      args.push('--transport', 'http', '--port', this.port.toString(), '--host', this.host);
    } else {
      args.push('--transport', 'stdio');
    }

    const npx = spawn('npx', args, {
      stdio: ['inherit', 'inherit', 'inherit'],
      env: {
        ...process.env,
        BRAVE_API_KEY: this.apiKey,
        BRAVE_MCP_TRANSPORT: this.transport,
        BRAVE_MCP_PORT: this.port.toString(),
        BRAVE_MCP_HOST: this.host
      }
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.error('Shutting down Brave Search MCP Server...');
      npx.kill('SIGTERM');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.error('Shutting down Brave Search MCP Server...');
      npx.kill('SIGTERM');
      process.exit(0);
    });

    npx.on('close', (code) => {
      if (code !== 0 && code !== null) {
        console.error(`Brave Search MCP Server exited with code ${code}`);
        process.exit(code);
      }
    });

    npx.on('error', (error) => {
      console.error('Error starting Brave Search MCP Server:', error.message);
      console.error('Make sure npm/npx is installed and accessible in your PATH');
      process.exit(1);
    });
  }
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start proxy server
const proxy = new BraveSearchMCPProxy();
proxy.run().catch((error) => {
  console.error('Failed to start Brave Search MCP proxy:', error.message);
  process.exit(1);
});