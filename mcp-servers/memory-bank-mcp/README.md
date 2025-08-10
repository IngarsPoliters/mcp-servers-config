# Memory Bank MCP Server

A persistent memory storage server for AI assistants using the Model Context Protocol (MCP). This server enables AI agents to store, retrieve, and manage memories across sessions with advanced search and organization capabilities.

## Features

- **Persistent Storage**: Memories are stored in JSON files and persist across sessions
- **Advanced Search**: Search memories by content, tags, importance level, and context
- **Memory Organization**: Tag-based categorization and importance levels (1-10)
- **Memory Management**: Create, read, update, delete, and clear memories
- **Statistics**: Get insights about your memory bank usage
- **Configurable Limits**: Set maximum number of memories to prevent unbounded growth

## Tools

### Memory Storage
- `store_memory` - Store new memories with content, tags, importance, and context
- `update_memory` - Update existing memories
- `delete_memory` - Delete specific memories

### Memory Retrieval
- `retrieve_memories` - Search and filter memories with advanced criteria
- `list_memories` - List all memories with sorting options
- `get_memory_stats` - Get statistics about the memory bank

### Memory Management
- `clear_memories` - Clear all memories (requires confirmation)

## Installation

```bash
cd memory-bank-mcp
npm install
```

## Usage

### Basic Usage

```bash
npm start
```

### With Custom Options

```bash
node index.js --memory-file ./my-memories.json --max-memories 500
```

### Options

- `--memory-file, -f` - Path to memory storage file (default: memory-bank.json)
- `--max-memories` - Maximum number of memories to store (default: 1000)
- `--help, -h` - Show help

## Memory Structure

Each memory contains:
- `id` - Unique identifier
- `content` - The memory content (required)
- `tags` - Array of categorization tags
- `importance` - Importance level (1-10)
- `context` - Additional contextual information
- `created` - Creation timestamp
- `modified` - Last modification timestamp

## Example Usage

### Store a Memory
```json
{
  "tool": "store_memory",
  "arguments": {
    "content": "The user prefers TypeScript over JavaScript for new projects",
    "tags": ["preference", "programming", "typescript"],
    "importance": 8,
    "context": "During discussion about project setup"
  }
}
```

### Search Memories
```json
{
  "tool": "retrieve_memories",
  "arguments": {
    "query": "typescript",
    "min_importance": 5,
    "limit": 10
  }
}
```

### Update a Memory
```json
{
  "tool": "update_memory",
  "arguments": {
    "id": "memory_1234567890_abc123",
    "content": "Updated content",
    "importance": 9
  }
}
```

### Get Memory Statistics
```json
{
  "tool": "get_memory_stats",
  "arguments": {}
}
```

## Search Capabilities

The memory bank supports powerful search features:

- **Content Search**: Find memories containing specific text
- **Tag Filtering**: Filter by one or more tags
- **Importance Levels**: Filter by minimum importance threshold
- **Combined Searches**: Use multiple criteria together
- **Smart Sorting**: Results sorted by importance and recency

## Data Persistence

- Memories are automatically saved to a JSON file after each operation
- Default file: `memory-bank.json` in the current directory
- Custom file path can be specified with `--memory-file` option
- File includes metadata: version, timestamp, and count

## Memory Management

- **Capacity Limits**: Configurable maximum number of memories
- **Automatic Cleanup**: Clear old or low-importance memories as needed
- **Batch Operations**: Efficient handling of multiple operations
- **Data Integrity**: Automatic backup and recovery mechanisms

## Use Cases

- **Personal Assistant**: Remember user preferences and past conversations
- **Project Context**: Store project-specific information and decisions
- **Learning Systems**: Accumulate knowledge over time
- **Session Continuity**: Maintain context across multiple interactions
- **Knowledge Base**: Build searchable repositories of information

## Environment Variables

- `MEMORY_FILE_PATH` - Override default memory file location

## Data Format

The memory bank file structure:
```json
{
  "version": "1.0.0",
  "timestamp": "2025-08-10T23:15:00.000Z",
  "memories": {
    "memory_id_1": {
      "id": "memory_id_1",
      "content": "Memory content",
      "tags": ["tag1", "tag2"],
      "importance": 7,
      "context": "Additional context",
      "created": "2025-08-10T23:15:00.000Z",
      "modified": "2025-08-10T23:15:00.000Z"
    }
  },
  "count": 1
}
```

## Best Practices

1. **Meaningful Tags**: Use consistent, descriptive tags for better organization
2. **Importance Levels**: Reserve high importance (8-10) for critical information
3. **Context Information**: Add context to make memories more useful later
4. **Regular Cleanup**: Periodically review and remove outdated memories
5. **Backup**: Keep backups of your memory bank files

## Security

- Memories are stored locally in JSON files
- No external network connections for storage
- File permissions should be set appropriately for sensitive data
- Consider encrypting memory files for sensitive information

## License

MIT License