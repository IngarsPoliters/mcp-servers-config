# GitHub MCP Server

A proxy wrapper for GitHub's official MCP Server that provides comprehensive GitHub API integration through the Model Context Protocol.

## Important Note

This server uses GitHub's official MCP Docker image: `ghcr.io/github/github-mcp-server`

The original npm package `@modelcontextprotocol/server-github` has been deprecated. GitHub now maintains their own official implementation in Go, which is more robust and feature-complete.

## Features

- **Repository Management**: Create, fork, and manage repositories
- **File Operations**: Create, update, read files with automatic branch creation
- **Issue Management**: Create, update, list, and comment on issues
- **Pull Request Management**: Create, review, and manage pull requests
- **Search Functionality**: Search repositories, code, issues, and users
- **Branch Operations**: Create branches and manage Git operations
- **Code Review**: Create pull request reviews with comments

## Requirements

- **Docker**: This server requires Docker to run the official GitHub MCP image
- **GitHub Personal Access Token**: Required for API authentication

## Setup

### 1. Create a GitHub Personal Access Token

1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Generate a new token (classic)
3. Select the following scopes:
   - `repo` - Full control of private repositories
   - `public_repo` - Access public repositories
   - `read:user` - Read user profile data
   - `user:email` - Access user email addresses

### 2. Install Dependencies

```bash
cd github-mcp
npm install
```

## Usage

### With Environment Variable

```bash
export GITHUB_PERSONAL_ACCESS_TOKEN="your_token_here"
npm start
```

### With Command Line Flag

```bash
node index.js --token "your_token_here"
```

### Options

- `--token, -t`: GitHub Personal Access Token
- `--docker-image, -i`: Docker image to use (default: ghcr.io/github/github-mcp-server)
- `--help, -h`: Show help

## Available Tools

The GitHub MCP Server provides 20+ tools including:

1. **File Operations**
   - `create_or_update_file` - Create or update files
   - `get_file_contents` - Read file contents
   - `push_files` - Push multiple files in a single commit

2. **Repository Management**
   - `create_repository` - Create new repositories
   - `fork_repository` - Fork repositories
   - `search_repositories` - Search for repositories

3. **Issue Management**
   - `create_issue` - Create new issues
   - `update_issue` - Update existing issues
   - `list_issues` - List and filter issues
   - `get_issue` - Get specific issue details
   - `add_issue_comment` - Add comments to issues

4. **Pull Request Management**
   - `create_pull_request` - Create new pull requests
   - `list_pull_requests` - List and filter pull requests
   - `get_pull_request` - Get specific pull request details
   - `create_pull_request_review` - Create pull request reviews

5. **Branch Operations**
   - `create_branch` - Create new branches
   - `list_commits` - List commits on a branch

6. **Search Functions**
   - `search_code` - Search code across repositories
   - `search_issues` - Search issues and pull requests
   - `search_users` - Search GitHub users

## Docker Requirements

This server automatically:
- Checks for Docker availability
- Pulls the latest GitHub MCP Docker image
- Handles container lifecycle management
- Provides graceful shutdown

## Security

- All operations use your GitHub Personal Access Token
- The token is passed securely to the Docker container
- No credentials are stored locally
- Uses GitHub's official, maintained implementation

## Troubleshooting

### Docker Not Available
If you see "Docker is not available", install Docker:
- Visit: https://docs.docker.com/get-docker/

### Token Issues
If authentication fails:
1. Verify your token has the correct scopes
2. Check that the token hasn't expired
3. Ensure the token is correctly set as an environment variable

### Container Issues
The server automatically pulls the latest image. If you encounter issues:
```bash
docker pull ghcr.io/github/github-mcp-server
```

## License

MIT License