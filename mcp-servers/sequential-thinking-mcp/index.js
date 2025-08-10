#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} = require('@modelcontextprotocol/sdk/types.js');
const chalk = require('chalk');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('disable-thought-logging', {
    type: 'boolean',
    description: 'Disable logging of thought information',
    default: false
  })
  .help()
  .alias('help', 'h')
  .parse();

const DISABLE_THOUGHT_LOGGING = argv['disable-thought-logging'] || process.env.DISABLE_THOUGHT_LOGGING === 'true';

class SequentialThinkingServer {
  constructor() {
    this.server = new Server(
      {
        name: 'sequential-thinking-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    
    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'sequentialthinking',
            description: 'A detailed tool for dynamic and reflective problem-solving through thoughts. This tool helps analyze problems through a flexible thinking process that can adapt and evolve. Each thought can build on, question, or revise previous insights as understanding deepens.',
            inputSchema: {
              type: 'object',
              properties: {
                thought: {
                  type: 'string',
                  description: 'Your current thinking step, which can include: Regular analytical steps, Revisions of previous thoughts, Questions about previous decisions, Realizations about needing more analysis, Changes in approach, Hypothesis generation, Hypothesis verification'
                },
                nextThoughtNeeded: {
                  type: 'boolean',
                  description: 'Whether another thought step is needed'
                },
                thoughtNumber: {
                  type: 'integer',
                  minimum: 1,
                  description: 'Current thought number'
                },
                totalThoughts: {
                  type: 'integer',
                  minimum: 1,
                  description: 'Estimated total thoughts needed (can be adjusted up/down)'
                },
                isRevision: {
                  type: 'boolean',
                  description: 'Whether this revises previous thinking'
                },
                revisesThought: {
                  type: 'integer',
                  minimum: 1,
                  description: 'Which thought is being reconsidered'
                },
                branchFromThought: {
                  type: 'integer',
                  minimum: 1,
                  description: 'Branching point thought number'
                },
                branchId: {
                  type: 'string',
                  description: 'Branch identifier'
                },
                needsMoreThoughts: {
                  type: 'boolean',
                  description: 'If more thoughts are needed'
                }
              },
              required: ['thought', 'nextThoughtNeeded', 'thoughtNumber', 'totalThoughts']
            }
          }
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      if (name !== 'sequentialthinking') {
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
      }

      return await this.handleSequentialThinking(args);
    });
  }

  async handleSequentialThinking(args) {
    const {
      thought,
      nextThoughtNeeded,
      thoughtNumber,
      totalThoughts,
      isRevision = false,
      revisesThought,
      branchFromThought,
      branchId,
      needsMoreThoughts = false
    } = args;

    // Validate required parameters
    if (typeof thought !== 'string' || thought.trim() === '') {
      throw new McpError(ErrorCode.InvalidParams, 'thought must be a non-empty string');
    }
    
    if (typeof nextThoughtNeeded !== 'boolean') {
      throw new McpError(ErrorCode.InvalidParams, 'nextThoughtNeeded must be a boolean');
    }
    
    if (typeof thoughtNumber !== 'number' || thoughtNumber < 1) {
      throw new McpError(ErrorCode.InvalidParams, 'thoughtNumber must be a positive integer');
    }
    
    if (typeof totalThoughts !== 'number' || totalThoughts < 1) {
      throw new McpError(ErrorCode.InvalidParams, 'totalThoughts must be a positive integer');
    }

    // Log the thought information if not disabled
    if (!DISABLE_THOUGHT_LOGGING) {
      let logMessage = chalk.blue(`Thought ${thoughtNumber}/${totalThoughts}:`);
      
      if (isRevision && revisesThought) {
        logMessage += chalk.yellow(` (Revising thought ${revisesThought})`);
      }
      
      if (branchFromThought && branchId) {
        logMessage += chalk.green(` (Branch ${branchId} from thought ${branchFromThought})`);
      }
      
      if (needsMoreThoughts) {
        logMessage += chalk.red(' (Needs more thoughts)');
      }
      
      console.error(logMessage);
      console.error(chalk.white(thought));
      console.error('---');
    }

    // Prepare response
    let responseText = `Thought ${thoughtNumber}/${totalThoughts}: ${thought}`;
    
    const metadata = {
      thoughtNumber,
      totalThoughts,
      nextThoughtNeeded,
      isRevision,
      needsMoreThoughts
    };
    
    if (revisesThought) {
      metadata.revisesThought = revisesThought;
    }
    
    if (branchFromThought) {
      metadata.branchFromThought = branchFromThought;
    }
    
    if (branchId) {
      metadata.branchId = branchId;
    }

    return {
      content: [
        {
          type: 'text',
          text: responseText
        }
      ],
      isError: false,
      metadata
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    if (!DISABLE_THOUGHT_LOGGING) {
      console.error(chalk.green('Sequential Thinking MCP Server is running...'));
    }
  }
}

// Error handling
process.on('SIGINT', async () => {
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
const server = new SequentialThinkingServer();
server.run().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});