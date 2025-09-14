#!/usr/bin/env node

const { parseArgs, launch } = require('../common/launcher');

const argv = parseArgs((yargs) =>
  yargs
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
);

const apiKey = argv.apiKey || process.env.BRAVE_API_KEY;
const transport = argv.transport || process.env.BRAVE_MCP_TRANSPORT || 'stdio';
const port = argv.port || process.env.BRAVE_MCP_PORT || 8080;
const host = argv.host || process.env.BRAVE_MCP_HOST || '0.0.0.0';

if (!apiKey) {
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

if (transport === 'http') {
  args.push('--transport', 'http', '--port', port.toString(), '--host', host);
} else {
  args.push('--transport', 'stdio');
}

launch('npx', args, {
  env: {
    ...process.env,
    BRAVE_API_KEY: apiKey,
    BRAVE_MCP_TRANSPORT: transport,
    BRAVE_MCP_PORT: port.toString(),
    BRAVE_MCP_HOST: host
  },
  serverName: 'Brave Search MCP Server'
});
