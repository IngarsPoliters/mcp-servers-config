
# Sourcegraph MCP Server

This MCP server provides access to the Sourcegraph API, allowing you to search for code and retrieve information about repositories.

## Configuration

To use this server, you need to set the following environment variables:

*   `SOURCEGRAPH_URL`: The URL of your Sourcegraph instance.
*   `SOURCEGRAPH_TOKEN`: Your Sourcegraph access token.

## Usage

### sg_search

This tool allows you to search for code across repositories.

**Example:**

```json
{
  "tool": "sg_search",
  "query": "your search query",
  "first": 10
}
```

### sg_get_file

This tool allows you to fetch the content of a file.

**Example:**

```json
{
  "tool": "sg_get_file",
  "repo": "github.com/owner/repo",
  "rev": "main",
  "path": "path/to/file"
}
```
