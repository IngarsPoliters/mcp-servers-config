#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} = require('@modelcontextprotocol/sdk/types.js');
const fs = require('fs-extra');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('memory-file', {
    type: 'string',
    description: 'Path to memory storage file',
    default: path.join(process.cwd(), 'memory-bank.json'),
    alias: 'f'
  })
  .option('max-memories', {
    type: 'number',
    description: 'Maximum number of memories to store',
    default: 1000
  })
  .help()
  .alias('help', 'h')
  .parse();

class MemoryBankMCPServer {
  constructor() {
    this.memoryFile = argv.memoryFile || process.env.MEMORY_FILE_PATH || path.join(process.cwd(), 'memory-bank.json');
    this.maxMemories = argv.maxMemories || 1000;
    this.memories = new Map();
    
    this.server = new Server(
      {
        name: 'memory-bank-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    
    this.setupToolHandlers();
    this.loadMemories();
  }

  async loadMemories() {
    try {
      if (await fs.pathExists(this.memoryFile)) {
        const data = await fs.readJson(this.memoryFile);
        this.memories = new Map(Object.entries(data.memories || {}));
        console.error(`Loaded ${this.memories.size} memories from ${this.memoryFile}`);
      } else {
        console.error(`Memory file ${this.memoryFile} does not exist, starting fresh`);
      }
    } catch (error) {
      console.error(`Error loading memories: ${error.message}`);
    }
  }

  async saveMemories() {
    try {
      const data = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        memories: Object.fromEntries(this.memories),
        count: this.memories.size
      };
      
      await fs.ensureFile(this.memoryFile);
      await fs.writeJson(this.memoryFile, data, { spaces: 2 });
    } catch (error) {
      console.error(`Error saving memories: ${error.message}`);
      throw error;
    }
  }

  generateId() {
    return `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'store_memory',
            description: 'Store a new memory with content, tags, and metadata',
            inputSchema: {
              type: 'object',
              properties: {
                content: {
                  type: 'string',
                  description: 'The memory content to store'
                },
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Tags to categorize the memory',
                  default: []
                },
                importance: {
                  type: 'number',
                  description: 'Importance level (1-10)',
                  minimum: 1,
                  maximum: 10,
                  default: 5
                },
                context: {
                  type: 'string',
                  description: 'Additional context about when/where this memory was created'
                }
              },
              required: ['content']
            }
          },
          {
            name: 'retrieve_memories',
            description: 'Retrieve memories based on search criteria',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query to match against memory content and tags'
                },
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Filter by specific tags'
                },
                min_importance: {
                  type: 'number',
                  description: 'Minimum importance level',
                  minimum: 1,
                  maximum: 10
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of memories to retrieve',
                  default: 10
                }
              }
            }
          },
          {
            name: 'update_memory',
            description: 'Update an existing memory',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'Memory ID to update'
                },
                content: {
                  type: 'string',
                  description: 'New memory content'
                },
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'New tags'
                },
                importance: {
                  type: 'number',
                  description: 'New importance level (1-10)',
                  minimum: 1,
                  maximum: 10
                }
              },
              required: ['id']
            }
          },
          {
            name: 'delete_memory',
            description: 'Delete a specific memory',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'Memory ID to delete'
                }
              },
              required: ['id']
            }
          },
          {
            name: 'list_memories',
            description: 'List all memories with basic information',
            inputSchema: {
              type: 'object',
              properties: {
                sort_by: {
                  type: 'string',
                  enum: ['created', 'modified', 'importance'],
                  description: 'Sort memories by field',
                  default: 'created'
                },
                order: {
                  type: 'string',
                  enum: ['asc', 'desc'],
                  description: 'Sort order',
                  default: 'desc'
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of memories to list',
                  default: 20
                }
              }
            }
          },
          {
            name: 'get_memory_stats',
            description: 'Get statistics about the memory bank',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'clear_memories',
            description: 'Clear all memories (use with caution)',
            inputSchema: {
              type: 'object',
              properties: {
                confirm: {
                  type: 'boolean',
                  description: 'Must be true to confirm deletion'
                }
              },
              required: ['confirm']
            }
          }
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      switch (name) {
        case 'store_memory':
          return await this.handleStoreMemory(args);
        case 'retrieve_memories':
          return await this.handleRetrieveMemories(args);
        case 'update_memory':
          return await this.handleUpdateMemory(args);
        case 'delete_memory':
          return await this.handleDeleteMemory(args);
        case 'list_memories':
          return await this.handleListMemories(args);
        case 'get_memory_stats':
          return await this.handleGetMemoryStats(args);
        case 'clear_memories':
          return await this.handleClearMemories(args);
        default:
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
      }
    });
  }

  async handleStoreMemory(args) {
    const { content, tags = [], importance = 5, context } = args;
    
    if (!content || typeof content !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'content is required and must be a string');
    }

    // Check if we've reached the maximum number of memories
    if (this.memories.size >= this.maxMemories) {
      throw new McpError(ErrorCode.InternalError, `Maximum number of memories (${this.maxMemories}) reached`);
    }

    const id = this.generateId();
    const now = new Date().toISOString();
    
    const memory = {
      id,
      content,
      tags: Array.isArray(tags) ? tags : [],
      importance: Math.max(1, Math.min(10, importance)),
      context: context || null,
      created: now,
      modified: now
    };

    this.memories.set(id, memory);
    await this.saveMemories();

    return {
      content: [
        {
          type: 'text',
          text: `Memory stored successfully with ID: ${id}`
        }
      ],
      isError: false,
      metadata: { memoryId: id, totalMemories: this.memories.size }
    };
  }

  async handleRetrieveMemories(args) {
    const { query, tags, min_importance, limit = 10 } = args || {};
    
    let matches = Array.from(this.memories.values());

    // Filter by minimum importance
    if (min_importance) {
      matches = matches.filter(memory => memory.importance >= min_importance);
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      matches = matches.filter(memory => 
        tags.some(tag => memory.tags.includes(tag))
      );
    }

    // Filter by query
    if (query && typeof query === 'string') {
      const queryLower = query.toLowerCase();
      matches = matches.filter(memory => {
        const contentMatch = memory.content.toLowerCase().includes(queryLower);
        const tagMatch = memory.tags.some(tag => tag.toLowerCase().includes(queryLower));
        const contextMatch = memory.context && memory.context.toLowerCase().includes(queryLower);
        return contentMatch || tagMatch || contextMatch;
      });
    }

    // Sort by importance, then by creation date (newest first)
    matches.sort((a, b) => {
      if (a.importance !== b.importance) {
        return b.importance - a.importance;
      }
      return new Date(b.created) - new Date(a.created);
    });

    // Limit results
    matches = matches.slice(0, limit);

    const resultText = matches.length > 0 
      ? `Found ${matches.length} matching memories:\n\n` + 
        matches.map(memory => 
          `ID: ${memory.id}\n` +
          `Content: ${memory.content}\n` +
          `Tags: [${memory.tags.join(', ')}]\n` +
          `Importance: ${memory.importance}/10\n` +
          `Created: ${memory.created}\n` +
          `${memory.context ? `Context: ${memory.context}\n` : ''}---`
        ).join('\n\n')
      : 'No memories found matching the criteria.';

    return {
      content: [
        {
          type: 'text',
          text: resultText
        }
      ],
      isError: false,
      metadata: { matchCount: matches.length, totalMemories: this.memories.size }
    };
  }

  async handleUpdateMemory(args) {
    const { id, content, tags, importance } = args;
    
    if (!id) {
      throw new McpError(ErrorCode.InvalidParams, 'id is required');
    }

    const memory = this.memories.get(id);
    if (!memory) {
      throw new McpError(ErrorCode.InvalidParams, `Memory with ID ${id} not found`);
    }

    // Update fields if provided
    if (content !== undefined) memory.content = content;
    if (tags !== undefined) memory.tags = Array.isArray(tags) ? tags : [];
    if (importance !== undefined) memory.importance = Math.max(1, Math.min(10, importance));
    
    memory.modified = new Date().toISOString();

    this.memories.set(id, memory);
    await this.saveMemories();

    return {
      content: [
        {
          type: 'text',
          text: `Memory ${id} updated successfully`
        }
      ],
      isError: false
    };
  }

  async handleDeleteMemory(args) {
    const { id } = args;
    
    if (!id) {
      throw new McpError(ErrorCode.InvalidParams, 'id is required');
    }

    if (!this.memories.has(id)) {
      throw new McpError(ErrorCode.InvalidParams, `Memory with ID ${id} not found`);
    }

    this.memories.delete(id);
    await this.saveMemories();

    return {
      content: [
        {
          type: 'text',
          text: `Memory ${id} deleted successfully`
        }
      ],
      isError: false,
      metadata: { totalMemories: this.memories.size }
    };
  }

  async handleListMemories(args) {
    const { sort_by = 'created', order = 'desc', limit = 20 } = args || {};
    
    let memories = Array.from(this.memories.values());

    // Sort memories
    memories.sort((a, b) => {
      let valueA, valueB;
      
      switch (sort_by) {
        case 'importance':
          valueA = a.importance;
          valueB = b.importance;
          break;
        case 'modified':
          valueA = new Date(a.modified);
          valueB = new Date(b.modified);
          break;
        case 'created':
        default:
          valueA = new Date(a.created);
          valueB = new Date(b.created);
          break;
      }

      if (order === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    // Limit results
    memories = memories.slice(0, limit);

    const resultText = memories.length > 0
      ? `Memory Bank Contents (${memories.length} of ${this.memories.size} total):\n\n` +
        memories.map(memory => 
          `${memory.id} | ${memory.content.substring(0, 100)}${memory.content.length > 100 ? '...' : ''} | [${memory.tags.join(', ')}] | Importance: ${memory.importance}`
        ).join('\n')
      : 'No memories in the bank.';

    return {
      content: [
        {
          type: 'text',
          text: resultText
        }
      ],
      isError: false
    };
  }

  async handleGetMemoryStats(args) {
    const memories = Array.from(this.memories.values());
    const allTags = new Set();
    let totalImportance = 0;

    memories.forEach(memory => {
      memory.tags.forEach(tag => allTags.add(tag));
      totalImportance += memory.importance;
    });

    const avgImportance = memories.length > 0 ? (totalImportance / memories.length).toFixed(2) : 0;
    const uniqueTags = Array.from(allTags).sort();

    const stats = {
      totalMemories: memories.length,
      maxMemories: this.maxMemories,
      averageImportance: parseFloat(avgImportance),
      uniqueTags: uniqueTags.length,
      tags: uniqueTags,
      memoryFile: this.memoryFile,
      oldestMemory: memories.length > 0 ? Math.min(...memories.map(m => new Date(m.created))) : null,
      newestMemory: memories.length > 0 ? Math.max(...memories.map(m => new Date(m.created))) : null
    };

    return {
      content: [
        {
          type: 'text',
          text: `Memory Bank Statistics:\n\n${JSON.stringify(stats, null, 2)}`
        }
      ],
      isError: false,
      metadata: stats
    };
  }

  async handleClearMemories(args) {
    const { confirm } = args;
    
    if (confirm !== true) {
      throw new McpError(ErrorCode.InvalidParams, 'Must confirm deletion by setting confirm=true');
    }

    const count = this.memories.size;
    this.memories.clear();
    await this.saveMemories();

    return {
      content: [
        {
          type: 'text',
          text: `All ${count} memories have been cleared from the memory bank`
        }
      ],
      isError: false
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error(`Memory Bank MCP Server is running with ${this.memories.size} memories loaded`);
    console.error(`Memory file: ${this.memoryFile}`);
  }
}

// Error handling
process.on('SIGINT', async () => {
  console.error('Shutting down Memory Bank MCP Server...');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
const server = new MemoryBankMCPServer();
server.run().catch((error) => {
  console.error('Failed to start Memory Bank MCP server:', error.message);
  process.exit(1);
});