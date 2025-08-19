# 🚀 MCP Servers Config for Claude Code

**The ultimate portable setup for Claude Code with 10+ popular MCP servers on Linux!**

[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue)](https://modelcontextprotocol.io/)
[![Linux](https://img.shields.io/badge/Platform-Linux-green)](https://www.linux.org/)
[![2025 Ready](https://img.shields.io/badge/2025-Ready-brightgreen)](#)

This repository provides a **complete, portable setup** for Claude Code with the most popular Model Context Protocol (MCP) servers, ready to deploy on any Linux machine with a single command.

## 🚀 Quick Start (30 seconds)

### **One-Command Setup**
```bash
git clone https://github.com/IngarsPoliters/mcp-servers-config.git && cd mcp-servers-config
npm install
./setup.sh
claude
```

### **Step-by-Step Setup**
1. **Clone the repository**:
   ```bash
   git clone https://github.com/IngarsPoliters/mcp-servers-config.git
   cd mcp-servers-config
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment** (optional):
   ```bash
   cp .env.template .env
   # Edit .env with your API keys (GitHub token, Notion token, etc.)
   nano .env
   ```

4. **Run setup script**:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

5. **Verify installation**:
   ```bash
   claude doctor
   claude mcp list
   ```

6. **Start coding**:
   ```bash
   claude
   ```

## 📚 Documentation
- [Server Matrix](docs/server-matrix.md)
- [Configuration Guide](docs/configuration.md)
- [Advanced Usage & Troubleshooting](docs/advanced-usage.md)
- [Compatibility](docs/compatibility.md)
- [Security Best Practices](docs/security.md)
- [Additional Resources](docs/additional-resources.md)
- [Contributing](CONTRIBUTING.md)

## 📄 License
MIT License - see [LICENSE](LICENSE) for details.

---

**⭐ If this repository helps you, please star it to help others find it!**

**🐛 Found an issue? [Report it here](https://github.com/IngarsPoliters/mcp-servers-config/issues)**
