# PostgreSQL MCP Server

A Model Context Protocol (MCP) server that provides secure access to PostgreSQL databases. This server enables AI assistants to interact with PostgreSQL databases through a standardized interface.

## Features

- **Read-Only Mode**: Enforces read-only access by default for safety
- **Query Execution**: Execute SQL SELECT queries and other read operations
- **Schema Inspection**: Describe table structures and list database tables
- **Connection Management**: Handles PostgreSQL connections with proper cleanup
- **Safety Checks**: Prevents dangerous write operations in read-only mode

## Tools

### query
Execute SQL queries against the PostgreSQL database.
- `sql` (string, required): The SQL query to execute

### describe_table
Get detailed information about a table including columns, types, and constraints.
- `table_name` (string, required): Name of the table to describe
- `schema_name` (string, optional): Schema name (defaults to 'public')

### list_tables
List all tables in the database with their schemas.
- `schema_name` (string, optional): Filter by schema name

## Installation

```bash
cd postgres-mcp
npm install
```

## Usage

### Command Line

```bash
node index.js --connection-string "postgresql://user:password@localhost:5432/database"
```

### Options

- `--connection-string, -c`: PostgreSQL connection string (required)
- `--read-only`: Enable read-only mode (default: true)
- `--help, -h`: Show help

### Environment Variables

For security, you can set the password via environment variable:

```bash
export PGPASSWORD=your_password
node index.js -c "postgresql://user@localhost:5432/database"
```

## Connection String Format

```
postgresql://[user[:password]@][host[:port]][/database][?param=value]
```

Examples:
- `postgresql://user:password@localhost:5432/mydb`
- `postgresql://user@localhost/mydb`
- `postgresql://localhost:5432/mydb`

## Security

- **Read-Only by Default**: The server operates in read-only mode by default
- **Write Protection**: Blocks INSERT, UPDATE, DELETE, DROP, CREATE, ALTER, TRUNCATE operations
- **Connection Safety**: Properly manages database connections and cleanup

## License

MIT License