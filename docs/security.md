# Security

## Best Practices Implemented
- **Read-only defaults**: Database and filesystem servers use safe permissions
- **Environment isolation**: API keys stored in environment variables
- **Credential validation**: Servers validate tokens before operation
- **Safe execution**: Sandboxed server execution with error boundaries
- **Access controls**: Configurable permission levels per server

## API Key Security
```bash
# Use environment variables (recommended)
export GITHUB_TOKEN=ghp_xxxxx

# Or secure .env file
chmod 600 .env
echo ".env" >> .gitignore
```
