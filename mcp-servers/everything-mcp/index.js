#!/usr/bin/env node

const { spawn } = require('child_process');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('transport', {
    type: 'string',
    description: 'Transport type (stdio or http)',
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
  .option('debug', {
    type: 'boolean',
    description: 'Enable debug mode',
    default: false,
    alias: 'd'
  })
  .help()
  .alias('help', 'help')
  .parse();

class EverythingMCPProxy {
  constructor() {
    this.transport = argv.transport || 'stdio';
    this.port = argv.port || 8080;
    this.host = argv.host || '0.0.0.0';
    this.debug = argv.debug || false;
  }

  async checkNpxAvailability() {
    return new Promise((resolve) => {
      const npx = spawn('npx', ['--version'], { stdio: 'pipe' });
      npx.on('close', (code) => {
        resolve(code === 0);
      });
      npx.on('error', () => {
        resolve(false);
      });
    });
  }

  async run() {
    // Check if npx is available
    const npxAvailable = await this.checkNpxAvailability();
    if (!npxAvailable) {
      console.error('Error: npx is not available. Please install Node.js and npm.');
      console.error('Visit https://nodejs.org/ for installation instructions.');
      process.exit(1);
    }

    console.error('Starting Everything MCP Server (Reference/Test Server)...');
    
    const args = ['-y', '@modelcontextprotocol/server-everything'];
    
    // Add transport-specific arguments if supported
    if (this.transport === 'http') {
      console.error(`Note: HTTP transport mode on ${this.host}:${this.port}`);
      // The everything server may not support all transport options
      // We'll pass them as environment variables instead
    }

    const env = {
      ...process.env
    };

    if (this.debug) {
      env.DEBUG = '1';
      env.MCP_DEBUG = '1';
    }

    if (this.transport === 'http') {
      env.MCP_TRANSPORT = 'http';
      env.MCP_PORT = this.port.toString();
      env.MCP_HOST = this.host;
    }

    const npx = spawn('npx', args, {
      stdio: ['inherit', 'inherit', 'inherit'],
      env: env
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.error('Shutting down Everything MCP Server...');
      npx.kill('SIGTERM');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.error('Shutting down Everything MCP Server...');
      npx.kill('SIGTERM');
      process.exit(0);
    });

    npx.on('close', (code) => {
      if (code !== 0 && code !== null) {
        console.error(`Everything MCP Server exited with code ${code}`);
        process.exit(code);
      }
    });

    npx.on('error', (error) => {
      console.error('Error starting Everything MCP Server:', error.message);
      console.error('Make sure npm/npx is installed and accessible in your PATH');
      console.error('You can install the server directly with: npm i @modelcontextprotocol/server-everything');
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
const proxy = new EverythingMCPProxy();
proxy.run().catch((error) => {
  console.error('Failed to start Everything MCP proxy:', error.message);
  process.exit(1);
});