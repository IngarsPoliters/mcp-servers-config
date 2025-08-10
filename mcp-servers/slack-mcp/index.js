#!/usr/bin/env node

const { spawn } = require('child_process');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('xoxc-token', {
    type: 'string',
    description: 'Slack browser token (xoxc-...)',
    alias: 'xoxc'
  })
  .option('xoxd-token', {
    type: 'string',
    description: 'Slack browser cookie d (xoxd-...)',
    alias: 'xoxd'
  })
  .option('xoxp-token', {
    type: 'string',
    description: 'User OAuth token (xoxp-...) - alternative to xoxc/xoxd',
    alias: 'xoxp'
  })
  .option('transport', {
    type: 'string',
    description: 'Transport mode (stdio or sse)',
    choices: ['stdio', 'sse'],
    default: 'stdio',
    alias: 't'
  })
  .option('port', {
    type: 'number',
    description: 'Port for MCP server (for SSE transport)',
    default: 13080,
    alias: 'p'
  })
  .option('host', {
    type: 'string',
    description: 'Host for MCP server (for SSE transport)',
    default: '127.0.0.1',
    alias: 'h'
  })
  .option('sse-api-key', {
    type: 'string',
    description: 'Bearer token for SSE transport',
    alias: 'key'
  })
  .option('proxy', {
    type: 'string',
    description: 'Proxy URL for outgoing requests',
    alias: 'px'
  })
  .option('user-agent', {
    type: 'string',
    description: 'Custom User-Agent for Enterprise Slack environments',
    alias: 'ua'
  })
  .option('enable-messaging', {
    type: 'string',
    description: 'Enable message posting (true for all, channel IDs comma-separated)',
    alias: 'msg'
  })
  .option('log-level', {
    type: 'string',
    description: 'Log level (debug, info, warn, error)',
    choices: ['debug', 'info', 'warn', 'error'],
    default: 'info',
    alias: 'log'
  })
  .option('implementation', {
    type: 'string',
    description: 'Slack MCP implementation to use',
    choices: ['korotovsky', 'avimbu'],
    default: 'korotovsky',
    alias: 'impl'
  })
  .help()
  .alias('help', 'help')
  .parse();

class SlackMCPProxy {
  constructor() {
    this.xoxcToken = argv.xoxcToken || process.env.SLACK_MCP_XOXC_TOKEN;
    this.xoxdToken = argv.xoxdToken || process.env.SLACK_MCP_XOXD_TOKEN;
    this.xoxpToken = argv.xoxpToken || process.env.SLACK_MCP_XOXP_TOKEN;
    this.transport = argv.transport || 'stdio';
    this.port = argv.port || process.env.SLACK_MCP_PORT || 13080;
    this.host = argv.host || process.env.SLACK_MCP_HOST || '127.0.0.1';
    this.sseApiKey = argv.sseApiKey || process.env.SLACK_MCP_SSE_API_KEY;
    this.proxy = argv.proxy || process.env.SLACK_MCP_PROXY;
    this.userAgent = argv.userAgent || process.env.SLACK_MCP_USER_AGENT;
    this.enableMessaging = argv.enableMessaging || process.env.SLACK_MCP_ADD_MESSAGE_TOOL;
    this.logLevel = argv.logLevel || process.env.SLACK_MCP_LOG_LEVEL || 'info';
    this.implementation = argv.implementation || 'korotovsky';
  }

  async checkGoAvailability() {
    return new Promise((resolve) => {
      const go = spawn('go', ['version'], { stdio: 'pipe' });
      go.on('close', (code) => {
        resolve(code === 0);
      });
      go.on('error', () => {
        resolve(false);
      });
    });
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

  buildEnvironment() {
    const env = { ...process.env };
    
    if (this.xoxcToken) env.SLACK_MCP_XOXC_TOKEN = this.xoxcToken;
    if (this.xoxdToken) env.SLACK_MCP_XOXD_TOKEN = this.xoxdToken;
    if (this.xoxpToken) env.SLACK_MCP_XOXP_TOKEN = this.xoxpToken;
    if (this.port) env.SLACK_MCP_PORT = this.port.toString();
    if (this.host) env.SLACK_MCP_HOST = this.host;
    if (this.sseApiKey) env.SLACK_MCP_SSE_API_KEY = this.sseApiKey;
    if (this.proxy) env.SLACK_MCP_PROXY = this.proxy;
    if (this.userAgent) env.SLACK_MCP_USER_AGENT = this.userAgent;
    if (this.enableMessaging) env.SLACK_MCP_ADD_MESSAGE_TOOL = this.enableMessaging;
    if (this.logLevel) env.SLACK_MCP_LOG_LEVEL = this.logLevel;
    
    return env;
  }

  async runKorotovsky() {
    const goAvailable = await this.checkGoAvailability();
    if (!goAvailable) {
      throw new Error('Go is not available. Please install Go to use the korotovsky Slack MCP server.\nVisit https://golang.org/dl/ for installation instructions.');
    }

    console.error('Cloning and building korotovsky/slack-mcp-server...');
    console.error('This may take a moment on first run.');

    // Clone the repository if it doesn't exist
    const cloneProcess = spawn('git', [
      'clone', 
      'https://github.com/korotovsky/slack-mcp-server.git',
      '/tmp/slack-mcp-server'
    ], { stdio: 'pipe' });

    await new Promise((resolve, reject) => {
      cloneProcess.on('close', (code) => {
        if (code === 0 || code === 128) { // 128 = already exists
          resolve();
        } else {
          reject(new Error(`Failed to clone repository. Exit code: ${code}`));
        }
      });
      cloneProcess.on('error', reject);
    });

    // Build and run the server
    const args = ['run', '/tmp/slack-mcp-server/mcp/mcp-server.go'];
    
    if (this.transport === 'sse') {
      args.push('--transport', 'sse');
    } else {
      args.push('--transport', 'stdio');
    }

    const server = spawn('go', args, {
      stdio: ['inherit', 'inherit', 'inherit'],
      env: this.buildEnvironment(),
      cwd: '/tmp/slack-mcp-server'
    });

    return server;
  }

  async runAvimbu() {
    const npxAvailable = await this.checkNpxAvailability();
    if (!npxAvailable) {
      throw new Error('npx is not available. Please install Node.js and npm.\nVisit https://nodejs.org/ for installation instructions.');
    }

    console.error('Using AVIMBU/slack-mcp-server implementation...');
    
    const server = spawn('npx', ['-y', 'slack-mcp-server'], {
      stdio: ['inherit', 'inherit', 'inherit'],
      env: this.buildEnvironment()
    });

    return server;
  }

  async run() {
    // Validate authentication tokens
    if (!this.xoxpToken && (!this.xoxcToken || !this.xoxdToken)) {
      console.error('Error: Slack authentication tokens are required.');
      console.error('');
      console.error('You need either:');
      console.error('  1. User OAuth token (xoxp): --xoxp-token or SLACK_MCP_XOXP_TOKEN');
      console.error('  2. Both browser tokens: --xoxc-token + --xoxd-token or SLACK_MCP_XOXC_TOKEN + SLACK_MCP_XOXD_TOKEN');
      console.error('');
      console.error('For setup instructions, visit:');
      console.error('https://github.com/korotovsky/slack-mcp-server/blob/master/docs/01-authentication-setup.md');
      process.exit(1);
    }

    console.error(`Starting Slack MCP Server (${this.implementation} implementation)...`);
    
    if (this.transport === 'sse') {
      console.error(`SSE transport mode on ${this.host}:${this.port}`);
      if (this.sseApiKey) {
        console.error('Authentication required for SSE transport');
      }
    }

    let server;
    try {
      if (this.implementation === 'korotovsky') {
        server = await this.runKorotovsky();
      } else {
        server = await this.runAvimbu();
      }
    } catch (error) {
      console.error('Error starting Slack MCP Server:', error.message);
      process.exit(1);
    }

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.error('Shutting down Slack MCP Server...');
      server.kill('SIGTERM');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.error('Shutting down Slack MCP Server...');
      server.kill('SIGTERM');
      process.exit(0);
    });

    server.on('close', (code) => {
      if (code !== 0 && code !== null) {
        console.error(`Slack MCP Server exited with code ${code}`);
        process.exit(code);
      }
    });

    server.on('error', (error) => {
      console.error('Error running Slack MCP Server:', error.message);
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
const proxy = new SlackMCPProxy();
proxy.run().catch((error) => {
  console.error('Failed to start Slack MCP proxy:', error.message);
  process.exit(1);
});