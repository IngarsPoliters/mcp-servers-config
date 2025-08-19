FROM codercom/code-server:latest  # Use your current image/tag from Coolify

# Install Node.js, Claude Code CLI (supersedes your manual install), and utils
RUN apt-get update && apt-get install -y nodejs npm tree \
    && npm install -g @anthropic-ai/claude-code \
    && echo 'alias ll="ls -la"' >> /home/coder/.bashrc

# Set working dir and user
USER coder
WORKDIR /home/coder/project

# Entry point for code-server
CMD ["--bind-addr", "0.0.0.0:8080", "."]
