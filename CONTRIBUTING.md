# 🤝 Contributing to MCP Servers Config

Thank you for your interest in contributing to the MCP Servers Config repository! This guide will help you get started with contributing to this collection of Model Context Protocol (MCP) servers.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Adding New Servers](#adding-new-servers)
- [Improving Existing Servers](#improving-existing-servers)
- [Documentation Guidelines](#documentation-guidelines)
- [Testing Requirements](#testing-requirements)
- [Security Guidelines](#security-guidelines)
- [Code Style](#code-style)
- [Submitting Changes](#submitting-changes)
- [Community Guidelines](#community-guidelines)

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (for JavaScript-based servers)
- **Python** 3.11+ (for Python-based servers)
- **Git** for version control
- **Claude Code CLI** for testing MCP integrations
- **Docker** (optional, for containerized testing)

### Initial Setup

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/mcp-servers-config.git
   cd mcp-servers-config
   ```

2. **Set up the development environment**
   ```bash
   # Copy environment template
   cp .env.template .env
   # Edit .env with your API keys (optional for development)
   
   # Run setup script
   chmod +x setup.sh
   ./setup.sh
   ```

3. **Verify installation**
   ```bash
   claude doctor
   claude mcp list
   ```

## 🛠️ Development Setup

### For JavaScript/Node.js Servers

```bash
cd mcp-servers/your-server-name
npm install
npm test  # If tests exist
node index.js --help
```

### For Python Servers

```bash
cd mcp-servers/your-server-name
python -m venv .venv
source .venv/bin/activate  # or `.venv\Scripts\activate` on Windows
pip install -e .
python -m pytest  # If tests exist
```

### Testing with Claude Code

```bash
# Test individual server
claude mcp test your-server-name

# Test with specific configuration
cd mcp-servers/your-server-name
YOUR_API_KEY="test_key" node index.js --help
```

## 🆕 Adding New Servers

### 1. Research and Planning

Before adding a new server, ensure:
- [ ] The service/API has sufficient documentation
- [ ] There's community demand for the integration  
- [ ] You have access to test the service/API
- [ ] The service supports programmatic access
- [ ] Check [awesome-mcp-servers](https://github.com/wong2/awesome-mcp-servers) for existing implementations

### 2. Server Structure

Create a new directory following the naming convention:
```
mcp-servers/service-name-mcp/
├── README.md           # Comprehensive documentation
├── package.json        # Node.js dependencies and scripts
├── index.js           # Main server implementation
├── .gitignore         # Ignore node_modules, .env files
└── tests/            # Test files (optional but recommended)
    └── server.test.js
```

For Python servers:
```
mcp-servers/service-name-mcp/
├── README.md          # Comprehensive documentation
├── pyproject.toml     # Python project configuration
├── src/
│   ├── __init__.py
│   └── server.py      # Main server implementation
├── tests/             # Test files
│   └── test_server.py
└── .gitignore
```

### 3. Implementation Requirements

#### Minimum Requirements
- [ ] Implement basic MCP protocol compliance
- [ ] Use environment variables for configuration
- [ ] Include comprehensive error handling
- [ ] Follow security best practices
- [ ] Provide clear success/error messages
- [ ] Include proper logging

#### Node.js Template (index.js)
```javascript
#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('api-key', {
    type: 'string',
    description: 'API key for authentication',
    alias: 'k'
  })
  .help()
  .alias('help', 'h')
  .parse();

class ServiceMCPServer {
  constructor() {
    this.apiKey = argv.apiKey || process.env.SERVICE_API_KEY;
  }

  async validateAuth() {
    if (!this.apiKey) {
      console.error('Error: API key is required.');
      console.error('Set SERVICE_API_KEY environment variable or use --api-key flag');
      process.exit(1);
    }
  }

  async start() {
    await this.validateAuth();
    // Implement server logic
  }
}

const server = new ServiceMCPServer();
server.start().catch(console.error);
```

### 4. Documentation Requirements

Each server MUST include a comprehensive README.md with:
- [ ] Clear description and features
- [ ] Installation instructions
- [ ] Configuration requirements  
- [ ] Environment variables documentation
- [ ] Usage examples
- [ ] API requirements and limitations
- [ ] Troubleshooting section
- [ ] Contributing guidelines

Use the existing server READMEs as templates.

## 🔧 Improving Existing Servers

### Types of Improvements Welcome

1. **Bug Fixes**: Fix functionality issues or errors
2. **Feature Enhancements**: Add new capabilities
3. **Performance Improvements**: Optimize speed or resource usage
4. **Documentation**: Improve clarity and completeness
5. **Testing**: Add or improve test coverage
6. **Security**: Address security vulnerabilities

### Before Making Changes

1. **Create an issue** describing the problem or enhancement
2. **Check existing issues** to avoid duplicate work
3. **Discuss approach** with maintainers if it's a major change
4. **Test thoroughly** with multiple scenarios

## 📚 Documentation Guidelines

### README Structure

Follow this structure for all server READMEs:

```markdown
# Service Name MCP Server

Brief description of what the server does.

## Features

- [ ] List key features
- [ ] Use checkboxes for completion status

## Installation

Step-by-step installation guide

## Configuration

Environment variables and setup

## Usage

Clear examples with expected output

## API Requirements

Service-specific requirements

## Troubleshooting

Common issues and solutions

## Contributing

How to contribute to this specific server
```

### Writing Style

- **Be Clear**: Use simple, direct language
- **Be Complete**: Include all necessary information
- **Be Accurate**: Test all examples and instructions
- **Be Consistent**: Follow established patterns
- **Use Examples**: Include practical, working examples

## 🧪 Testing Requirements

### Manual Testing

Before submitting changes:
- [ ] Test with minimal configuration
- [ ] Test with various API keys/tokens
- [ ] Test error scenarios (invalid keys, network issues)
- [ ] Test with Claude Code CLI
- [ ] Verify all documented examples work

### Automated Testing (Recommended)

Add tests for:
- [ ] Configuration validation
- [ ] Authentication handling
- [ ] Core functionality
- [ ] Error cases
- [ ] Edge cases

### Testing Framework Examples

**Node.js (Jest)**:
```javascript
// tests/server.test.js
describe('ServiceMCPServer', () => {
  test('should validate API key requirement', () => {
    // Test implementation
  });
});
```

**Python (pytest)**:
```python
# tests/test_server.py
def test_api_key_validation():
    # Test implementation
    pass
```

## 🔒 Security Guidelines

### Authentication & Secrets

- [ ] **Never** hardcode API keys or secrets
- [ ] Use environment variables for all sensitive data
- [ ] Validate API keys before making requests
- [ ] Implement proper error handling for auth failures
- [ ] Use secure defaults (read-only when possible)

### Input Validation

- [ ] Validate all user inputs
- [ ] Sanitize data before processing
- [ ] Implement rate limiting where appropriate
- [ ] Handle malformed requests gracefully

### Dependencies

- [ ] Use latest stable versions of dependencies
- [ ] Regularly audit for security vulnerabilities
- [ ] Minimize dependency count when possible
- [ ] Pin dependency versions in production

### Code Security

- [ ] Follow principle of least privilege
- [ ] Implement proper error boundaries
- [ ] Don't expose sensitive information in logs
- [ ] Use secure communication (HTTPS/TLS)

## 🎨 Code Style

### JavaScript/Node.js

- Use **ES6+** features where appropriate
- Follow **standard** JavaScript conventions
- Use **async/await** for asynchronous operations
- Include **JSDoc** comments for functions
- Use **meaningful variable names**

### Python

- Follow **PEP 8** style guide
- Use **type hints** where appropriate
- Include **docstrings** for all functions and classes
- Use **meaningful variable names**
- Follow **black** formatting

### General Principles

- **DRY**: Don't Repeat Yourself
- **KISS**: Keep It Simple, Stupid
- **SOLID**: Follow SOLID principles
- **Comment**: Explain why, not what
- **Consistent**: Follow existing patterns in the codebase

## 📨 Submitting Changes

### Pull Request Process

1. **Create a branch** from main
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. **Make your changes** following the guidelines above

3. **Test thoroughly** (see Testing Requirements)

4. **Update documentation** as needed

5. **Commit with clear messages**
   ```bash
   git add .
   git commit -m "feat: add new feature for X service
   
   - Implement core functionality
   - Add comprehensive tests
   - Update documentation"
   ```

6. **Push and create pull request**
   ```bash
   git push origin your-branch-name
   # Create PR on GitHub
   ```

### Pull Request Template

Include in your PR description:

```markdown
## Changes Made
- [ ] List of changes

## Testing Done
- [ ] Manual testing scenarios
- [ ] Automated tests added/updated

## Documentation Updated
- [ ] README updated
- [ ] Code comments added
- [ ] Examples tested

## Security Considerations
- [ ] No secrets exposed
- [ ] Input validation implemented
- [ ] Dependencies are secure
```

### Commit Message Guidelines

Use conventional commits:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `test:` for adding tests
- `refactor:` for code refactoring
- `security:` for security-related changes

## 👥 Community Guidelines

### Code of Conduct

- **Be Respectful**: Treat all contributors with respect
- **Be Collaborative**: Work together constructively
- **Be Patient**: Help newcomers and be patient with questions
- **Be Professional**: Maintain professional communication
- **Be Inclusive**: Welcome contributors from all backgrounds

### Communication

- **Issues**: Use GitHub issues for bug reports and feature requests
- **Discussions**: Use GitHub discussions for general questions
- **Reviews**: Provide constructive feedback on pull requests
- **Documentation**: Keep documentation up to date

### Recognition

Contributors will be recognized through:
- **Attribution**: Listed in repository contributors
- **Acknowledgment**: Mentioned in release notes for significant contributions
- **Maintainer Status**: Offered to regular contributors

## 🆘 Getting Help

### Resources

- **MCP Documentation**: https://modelcontextprotocol.io/
- **Claude Code Docs**: https://docs.anthropic.com/en/docs/claude-code
- **Repository Issues**: For specific problems
- **GitHub Discussions**: For general questions

### Contact

- **Create an issue** for bugs or feature requests
- **Start a discussion** for general questions  
- **Tag maintainers** (@username) for urgent issues

---

## 🏆 Recognition

We appreciate all contributors! Your contributions help make MCP more accessible and powerful for the entire community.

**Thank you for contributing!** 🎉

---

*This guide is a living document. Please suggest improvements by creating an issue or pull request.*