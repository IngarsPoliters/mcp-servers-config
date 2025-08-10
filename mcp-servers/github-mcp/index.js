#!/usr/bin/env node

const { spawn } = require('child_process');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('token', {
    type: 'string',
    description: 'GitHub Personal Access Token',
    alias: 't'
  })
  .option('docker-image', {
    type: 'string',
    description: 'GitHub MCP Docker image',
    default: 'ghcr.io/github/github-mcp-server',
    alias: 'i'
  })
  .help()
  .alias('help', 'h')
  .parse();

class GitHubMCPProxy {
  constructor() {
    this.dockerImage = argv.dockerImage || 'ghcr.io/github/github-mcp-server';
    this.token = argv.token || process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
  }

  async checkDockerAvailability() {
    return new Promise((resolve) => {
      const docker = spawn('docker', ['--version'], { stdio: 'pipe' });
      docker.on('close', (code) => {
        resolve(code === 0);
      });
      docker.on('error', () => {
        resolve(false);
      });
    });
  }

  async pullDockerImage() {
    return new Promise((resolve, reject) => {
      console.error(`Checking for Docker image: ${this.dockerImage}`);
      
      const pull = spawn('docker', ['pull', this.dockerImage], { 
        stdio: ['inherit', 'pipe', 'pipe'] 
      });
      
      pull.stdout.on('data', (data) => {
        console.error(data.toString());
      });
      
      pull.stderr.on('data', (data) => {
        console.error(data.toString());
      });
      
      pull.on('close', (code) => {
        if (code === 0) {
          console.error('Docker image is ready');
          resolve();
        } else {
          reject(new Error(`Failed to pull Docker image. Exit code: ${code}`));
        }
      });
    });
  }

  async run() {
    // Check if Docker is available
    const dockerAvailable = await this.checkDockerAvailability();
    if (!dockerAvailable) {
      console.error('Error: Docker is not available. Please install Docker to use the GitHub MCP server.');
      console.error('Visit https://docs.docker.com/get-docker/ for installation instructions.');
      process.exit(1);
    }

    // Check if token is provided
    if (!this.token) {
      console.error('Error: GitHub Personal Access Token is required.');
      console.error('Set GITHUB_PERSONAL_ACCESS_TOKEN environment variable or use --token flag');
      console.error('');
      console.error('To create a token:');
      console.error('1. Go to GitHub Settings > Developer settings > Personal access tokens');
      console.error('2. Generate a new token with "repo" scope');
      console.error('3. Set the token as an environment variable or pass it with --token');
      process.exit(1);
    }

    try {
      // Pull the latest Docker image
      await this.pullDockerImage();
    } catch (error) {
      console.error('Warning: Could not update Docker image:', error.message);
      console.error('Continuing with existing image...');
    }

    // Start the GitHub MCP server in Docker
    console.error('Starting GitHub MCP Server...');
    
    const dockerArgs = [
      'run',
      '-i',
      '--rm',
      '-e', `GITHUB_PERSONAL_ACCESS_TOKEN=${this.token}`,
      this.dockerImage
    ];

    const docker = spawn('docker', dockerArgs, {
      stdio: ['inherit', 'inherit', 'inherit']
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.error('Shutting down GitHub MCP Server...');
      docker.kill('SIGTERM');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.error('Shutting down GitHub MCP Server...');
      docker.kill('SIGTERM');
      process.exit(0);
    });

    docker.on('close', (code) => {
      if (code !== 0 && code !== null) {
        console.error(`GitHub MCP Server exited with code ${code}`);
        process.exit(code);
      }
    });

    docker.on('error', (error) => {
      console.error('Error starting GitHub MCP Server:', error.message);
      process.exit(1);
    });
  }
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start proxy server
const proxy = new GitHubMCPProxy();
proxy.run().catch((error) => {
  console.error('Failed to start GitHub MCP proxy:', error.message);
  process.exit(1);
});