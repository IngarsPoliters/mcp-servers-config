# MCP Servers Config for Claude Code

Portable setup for Claude Code with MCP servers on Linux.

## Quick Start on Any Linux PC
1. Clone/pull: `git clone https://github.com/IngarsPoliters/mcp-servers-config.git && cd mcp-servers-config` (or `git pull` if already cloned).
2. Run `./setup.sh` (installs everything automatically; sudo for Node.js if needed).
3. Start: Run `claude` in terminal—your MCP servers are ready!

## Notes
- For other distros (e.g., Fedora): Edit setup.sh to use `dnf install nodejs` instead of apt.
- Secrets: Script prompts for GITHUB_TOKEN if unset; add more env vars as needed.
- Updates: Edit .mcp.json, commit/push, then pull and re-run setup.sh on other machines.
- 2025 Tip: Use remote MCP servers (e.g., URLs) for no-install options.