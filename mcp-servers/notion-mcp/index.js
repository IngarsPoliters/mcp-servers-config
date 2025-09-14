#!/usr/bin/env node

const { spawn } = require('child_process');
const { parseArgs, launch } = require('../common/launcher');

const argv = parseArgs((yargs) =>
  yargs
    .option('token', {
      type: 'string',
      description: 'Notion integration token',
      alias: 't'
    })
    .option('transport', {
      type: 'string',
      description: 'Transport mode (stdio or http)',
      choices: ['stdio', 'http'],
      default: 'stdio',
      alias: 'tr'
    })
    .option('port', {
      type: 'number',
      description: 'HTTP server port (when using http transport)',
      default: 3000,
      alias: 'p'
    })
    .option('auth-token', {
      type: 'string',
      description: 'HTTP auth token (when using http transport)',
      alias: 'auth'
    })
    .option('headers', {
      type: 'string',
      description: 'Custom headers as JSON string (advanced use)',
      alias: 'h'
    })
    .option('method', {
      type: 'string',
      description: 'Installation method (npm, docker-official, docker-local)',
      choices: ['npm', 'docker-official', 'docker-local'],
      default: 'npm',
      alias: 'm'
    })
);

class NotionMCPProxy {
  constructor() {
    this.token = argv.token || process.env.NOTION_TOKEN;
    this.transport = argv.transport || 'stdio';
    this.port = argv.port || 3000;
    this.authToken = argv.authToken || process.env.AUTH_TOKEN;
    this.headers = argv.headers || process.env.OPENAPI_MCP_HEADERS;
    this.method = argv.method || 'npm';
  }

  async checkMethodAvailability(method) {
    return new Promise((resolve) => {
      const command = method.startsWith('docker') ? 'docker' : 'npx';
      const args = ['--version'];

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
    const methods = ['npm', 'docker-official', 'docker-local'];

    for (const method of methods) {
      const available = await this.checkMethodAvailability(method);
      if (available) {
        console.error(`Using ${method} for Notion MCP server`);
        return method;
      }
    }

    throw new Error('None of the required tools (npx, docker) are available');
  }

  buildEnv() {
    const env = { ...process.env };

    if (this.token) {
      env.NOTION_TOKEN = this.token;
    }

    if (this.headers) {
      env.OPENAPI_MCP_HEADERS = this.headers;
    }

    if (this.authToken && this.transport === 'http') {
      env.AUTH_TOKEN = this.authToken;
    }

    return env;
  }

  buildArgs() {
    const args = [];

    if (this.transport === 'http') {
      args.push('--transport', 'http');

      if (this.port !== 3000) {
        args.push('--port', this.port.toString());
      }

      if (this.authToken) {
        args.push('--auth-token', this.authToken);
      }
    } else {
      args.push('--transport', 'stdio');
    }

    return args;
  }

  async run() {
    let method = this.method;

    const methodAvailable = await this.checkMethodAvailability(method);
    if (!methodAvailable) {
      console.error(`Warning: Preferred method '${method}' is not available, searching for alternatives...`);
      method = await this.findAvailableMethod();
    }

    if (!this.token && !this.headers) {
      console.error('Error: Notion integration token is required.');
      console.error('Set NOTION_TOKEN environment variable or use --token flag');
      console.error('');
      console.error('To create a token:');
      console.error('1. Go to https://www.notion.so/profile/integrations');
      console.error('2. Create a new internal integration');
      console.error('3. Copy the integration token');
      console.error('4. Connect the integration to your Notion pages');
      process.exit(1);
    }

    console.error('Starting Notion MCP Server...');

    let command, args, env;

    switch (method) {
      case 'npm':
        command = 'npx';
        args = ['-y', '@notionhq/notion-mcp-server', ...this.buildArgs()];
        env = this.buildEnv();
        break;

      case 'docker-official':
        command = 'docker';
        args = ['run', '--rm', '-i'];

        if (this.token) {
          args.push('-e', 'NOTION_TOKEN');
        }
        if (this.headers) {
          args.push('-e', 'OPENAPI_MCP_HEADERS');
        }
        if (this.authToken && this.transport === 'http') {
          args.push('-e', 'AUTH_TOKEN');
        }

        args.push('mcp/notion', ...this.buildArgs());
        env = this.buildEnv();
        break;

      case 'docker-local':
        command = 'docker';
        args = ['run', '--rm', '-i'];

        if (this.token) {
          args.push('-e', `NOTION_TOKEN=${this.token}`);
        }
        if (this.headers) {
          args.push('-e', `OPENAPI_MCP_HEADERS=${this.headers}`);
        }
        if (this.authToken && this.transport === 'http') {
          args.push('-e', `AUTH_TOKEN=${this.authToken}`);
        }

        args.push('notion-mcp-server', ...this.buildArgs());
        env = process.env;
        break;

      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    launch(command, args, {
      env,
      serverName: 'Notion MCP Server',
      onError: (error) => {
        console.error('Error starting Notion MCP Server:', error.message);
        if (method === 'npm') {
          console.error('Make sure npm/npx is installed and accessible in your PATH');
        } else if (method.startsWith('docker')) {
          console.error('Make sure Docker is installed and running');
        }
      }
    });
  }
}

const proxy = new NotionMCPProxy();
proxy.run().catch((error) => {
  console.error('Failed to start Notion MCP proxy:', error.message);
  process.exit(1);
});
