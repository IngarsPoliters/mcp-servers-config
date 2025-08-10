#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} = require('@modelcontextprotocol/sdk/types.js');
const { Client } = require('pg');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('connection-string', {
    type: 'string',
    description: 'PostgreSQL connection string',
    demandOption: true,
    alias: 'c'
  })
  .option('read-only', {
    type: 'boolean',
    description: 'Enable read-only mode (recommended)',
    default: true
  })
  .help()
  .alias('help', 'h')
  .parse();

class PostgresMCPServer {
  constructor(connectionString, readOnly = true) {
    this.connectionString = connectionString;
    this.readOnly = readOnly;
    this.client = null;
    
    this.server = new Server(
      {
        name: 'postgres-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );
    
    this.setupToolHandlers();
  }

  async connectDatabase() {
    try {
      this.client = new Client({
        connectionString: this.connectionString,
        ssl: this.connectionString.includes('ssl=true') ? { rejectUnauthorized: false } : false
      });
      
      await this.client.connect();
      
      // Set read-only mode if enabled
      if (this.readOnly) {
        await this.client.query('BEGIN READ ONLY');
      }
      
      console.error('Connected to PostgreSQL database');
    } catch (error) {
      console.error('Failed to connect to PostgreSQL:', error.message);
      throw error;
    }
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'query',
            description: 'Execute a SQL query against the PostgreSQL database. Supports SELECT statements and other read operations.',
            inputSchema: {
              type: 'object',
              properties: {
                sql: {
                  type: 'string',
                  description: 'The SQL query to execute'
                }
              },
              required: ['sql']
            }
          },
          {
            name: 'describe_table',
            description: 'Get detailed information about a table including columns, types, and constraints',
            inputSchema: {
              type: 'object',
              properties: {
                table_name: {
                  type: 'string',
                  description: 'Name of the table to describe'
                },
                schema_name: {
                  type: 'string',
                  description: 'Schema name (optional, defaults to public)',
                  default: 'public'
                }
              },
              required: ['table_name']
            }
          },
          {
            name: 'list_tables',
            description: 'List all tables in the database with their schemas',
            inputSchema: {
              type: 'object',
              properties: {
                schema_name: {
                  type: 'string',
                  description: 'Filter by schema name (optional)'
                }
              }
            }
          }
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      if (!this.client) {
        await this.connectDatabase();
      }
      
      switch (name) {
        case 'query':
          return await this.handleQuery(args);
        case 'describe_table':
          return await this.handleDescribeTable(args);
        case 'list_tables':
          return await this.handleListTables(args);
        default:
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
      }
    });
  }

  async handleQuery(args) {
    const { sql } = args;
    
    if (!sql || typeof sql !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'sql parameter is required and must be a string');
    }

    // Basic safety check for read-only mode
    if (this.readOnly) {
      const lowerSql = sql.toLowerCase().trim();
      const writeOperations = ['insert', 'update', 'delete', 'drop', 'create', 'alter', 'truncate'];
      
      for (const operation of writeOperations) {
        if (lowerSql.startsWith(operation)) {
          throw new McpError(
            ErrorCode.InvalidParams, 
            `Write operation '${operation}' is not allowed in read-only mode`
          );
        }
      }
    }

    try {
      const result = await this.client.query(sql);
      
      return {
        content: [
          {
            type: 'text',
            text: `Query executed successfully. Rows affected: ${result.rowCount}\n\nResults:\n${JSON.stringify(result.rows, null, 2)}`
          }
        ],
        isError: false
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Query failed: ${error.message}`);
    }
  }

  async handleDescribeTable(args) {
    const { table_name, schema_name = 'public' } = args;
    
    if (!table_name) {
      throw new McpError(ErrorCode.InvalidParams, 'table_name parameter is required');
    }

    try {
      const result = await this.client.query(`
        SELECT 
          c.column_name,
          c.data_type,
          c.is_nullable,
          c.column_default,
          c.character_maximum_length,
          c.numeric_precision,
          c.numeric_scale,
          tc.constraint_type
        FROM information_schema.columns c
        LEFT JOIN information_schema.key_column_usage kcu 
          ON c.table_name = kcu.table_name 
          AND c.column_name = kcu.column_name
          AND c.table_schema = kcu.table_schema
        LEFT JOIN information_schema.table_constraints tc 
          ON kcu.constraint_name = tc.constraint_name
          AND kcu.table_schema = tc.table_schema
        WHERE c.table_name = $1 
          AND c.table_schema = $2
        ORDER BY c.ordinal_position
      `, [table_name, schema_name]);

      if (result.rows.length === 0) {
        throw new McpError(ErrorCode.InvalidParams, `Table '${schema_name}.${table_name}' not found`);
      }

      return {
        content: [
          {
            type: 'text',
            text: `Table: ${schema_name}.${table_name}\n\nColumns:\n${JSON.stringify(result.rows, null, 2)}`
          }
        ],
        isError: false
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to describe table: ${error.message}`);
    }
  }

  async handleListTables(args) {
    const { schema_name } = args || {};
    
    try {
      let query = `
        SELECT 
          schemaname as schema_name,
          tablename as table_name,
          tableowner as table_owner
        FROM pg_tables
      `;
      
      const params = [];
      if (schema_name) {
        query += ' WHERE schemaname = $1';
        params.push(schema_name);
      } else {
        query += " WHERE schemaname NOT IN ('information_schema', 'pg_catalog')";
      }
      
      query += ' ORDER BY schemaname, tablename';
      
      const result = await this.client.query(query, params);

      return {
        content: [
          {
            type: 'text',
            text: `Tables:\n${JSON.stringify(result.rows, null, 2)}`
          }
        ],
        isError: false
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to list tables: ${error.message}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('PostgreSQL MCP Server is running...');
  }

  async cleanup() {
    if (this.client) {
      try {
        if (this.readOnly) {
          await this.client.query('ROLLBACK');
        }
        await this.client.end();
      } catch (error) {
        console.error('Error during cleanup:', error.message);
      }
    }
  }
}

// Error handling and cleanup
process.on('SIGINT', async () => {
  console.error('Received SIGINT, shutting down...');
  if (global.pgServer) {
    await global.pgServer.cleanup();
  }
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
async function main() {
  try {
    const server = new PostgresMCPServer(argv.connectionString, argv.readOnly);
    global.pgServer = server;
    await server.run();
  } catch (error) {
    console.error('Failed to start PostgreSQL MCP server:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}