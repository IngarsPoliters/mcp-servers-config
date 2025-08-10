#!/usr/bin/env node

const { spawn } = require('child_process');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('ignore-robots-txt', {
    type: 'boolean',
    description: 'Ignore robots.txt restrictions',
    default: false
  })
  .option('user-agent', {
    type: 'string',
    description: 'Custom user agent string',
    alias: 'ua'
  })
  .option('proxy-url', {
    type: 'string',
    description: 'Proxy URL for requests',
    alias: 'proxy'
  })
  .option('timeout', {
    type: 'number',
    description: 'Request timeout in seconds',
    default: 30
  })
  .option('method', {
    type: 'string',
    description: 'Preferred installation method (uvx, docker, npx)',
    choices: ['uvx', 'docker', 'npx'],
    default: 'uvx',
    alias: 'm'
  })
  .help()
  .alias('help', 'h')
  .parse();

class FetchMCPProxy {
  constructor() {
    this.ignoreRobotsTxt = argv.ignoreRobotsTxt;
    this.userAgent = argv.userAgent;
    this.proxyUrl = argv.proxyUrl;
    this.timeout = argv.timeout;
    this.method = argv.method;
  }

  async checkMethodAvailability(method) {
    return new Promise((resolve) => {
      const command = method === 'docker' ? 'docker' : method;
      const args = method === 'docker' ? ['--version'] : ['--version'];
      
      const process = spawn(command, args, { stdio: 'pipe' });
      process.on('close', (code) => {
        resolve(code === 0);
      });
      process.on('error', () => {
        resolve(false);
      });
    });
  }

  async findAvailableMethod() {
    const methods = ['uvx', 'docker', 'npx'];
    
    for (const method of methods) {
      const available = await this.checkMethodAvailability(method);
      if (available) {
        console.error(`Using ${method} for Fetch MCP server`);
        return method;
      }
    }
    
    throw new Error('None of the required tools (uvx, docker, npx) are available');
  }

  buildArgs() {
    const args = [];
    
    if (this.ignoreRobotsTxt) {
      args.push('--ignore-robots-txt');
    }
    
    if (this.userAgent) {
      args.push('--user-agent', this.userAgent);
    }
    
    if (this.proxyUrl) {
      args.push('--proxy-url', this.proxyUrl);
    }
    
    if (this.timeout && this.timeout !== 30) {
      args.push('--timeout', this.timeout.toString());
    }
    
    return args;
  }

  async run() {
    let method = this.method;
    
    // Check if the preferred method is available, otherwise find an available one
    const methodAvailable = await this.checkMethodAvailability(method);
    if (!methodAvailable) {
      console.error(`Warning: Preferred method '${method}' is not available, searching for alternatives...`);
      method = await this.findAvailableMethod();
    }

    console.error('Starting Fetch MCP Server...');
    
    let command, args, env;
    
    switch (method) {
      case 'uvx':
        command = 'uvx';
        args = ['mcp-server-fetch', ...this.buildArgs()];
        env = process.env;
        break;
        
      case 'docker':
        command = 'docker';
        args = ['run', '-i', '--rm'];
        
        // Add environment variables for Docker
        if (this.ignoreRobotsTxt) {
          args.push('-e', 'IGNORE_ROBOTS_TXT=true');
        }
        if (this.userAgent) {
          args.push('-e', `USER_AGENT=${this.userAgent}`);
        }
        if (this.proxyUrl) {
          args.push('-e', `PROXY_URL=${this.proxyUrl}`);
        }
        
        args.push('mcp/fetch', ...this.buildArgs());
        env = process.env;
        break;
        
      case 'npx':
        command = 'npx';
        args = ['-y', 'mcp-server-fetch', ...this.buildArgs()];
        env = process.env;
        break;
        
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    const server = spawn(command, args, {
      stdio: ['inherit', 'inherit', 'inherit'],
      env: env
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.error('Shutting down Fetch MCP Server...');
      server.kill('SIGTERM');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.error('Shutting down Fetch MCP Server...');
      server.kill('SIGTERM');
      process.exit(0);
    });

    server.on('close', (code) => {
      if (code !== 0 && code !== null) {
        console.error(`Fetch MCP Server exited with code ${code}`);
        process.exit(code);
      }
    });

    server.on('error', (error) => {
      console.error('Error starting Fetch MCP Server:', error.message);
      console.error('Please ensure the required tools are installed:');
      console.error('- For uvx: pip install uv');
      console.error('- For docker: https://docs.docker.com/get-docker/');
      console.error('- For npx: npm install -g npm');
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
const proxy = new FetchMCPProxy();
proxy.run().catch((error) => {
  console.error('Failed to start Fetch MCP proxy:', error.message);
  process.exit(1);
});