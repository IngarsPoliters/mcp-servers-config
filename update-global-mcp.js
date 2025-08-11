#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load configurations
const globalConfigPath = '/home/coder/.claude.json';
const projectConfigPath = '/home/coder/project/mcp-servers-config/.mcp.json';
const envPath = '/home/coder/project/mcp-servers-config/.env';

console.log('🔧 Updating global Claude MCP configuration...');

// Read global config
const globalConfig = JSON.parse(fs.readFileSync(globalConfigPath, 'utf8'));

// Read project config
const projectConfig = JSON.parse(fs.readFileSync(projectConfigPath, 'utf8'));

// Read environment variables
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=');
        env[key.trim()] = valueParts.join('=').trim();
    }
});

console.log('📝 Environment variables loaded:', Object.keys(env).length);

// Merge MCP servers - prioritize our project servers
const mergedServers = {
    // Keep existing global servers
    ...globalConfig.mcpServers,
    // Add our project servers
    ...projectConfig.mcpServers
};

// Update configurations with actual environment values for our servers
Object.keys(projectConfig.mcpServers).forEach(serverName => {
    const server = mergedServers[serverName];
    if (server.env) {
        Object.keys(server.env).forEach(envKey => {
            const envValue = server.env[envKey];
            // Replace ${VAR_NAME} with actual values
            if (envValue.startsWith('${') && envValue.endsWith('}')) {
                const varName = envValue.slice(2, -1);
                if (env[varName]) {
                    server.env[envKey] = env[varName];
                    console.log(`✅ Set ${serverName}.env.${envKey} from ${varName}`);
                } else {
                    console.log(`⚠️  Missing environment variable: ${varName} for ${serverName}`);
                }
            }
        });
    }
});

// Update global config
globalConfig.mcpServers = mergedServers;

// Write updated global config
fs.writeFileSync(globalConfigPath, JSON.stringify(globalConfig, null, 2));

console.log('🎉 Global Claude configuration updated!');
console.log('📊 Total MCP servers configured:', Object.keys(mergedServers).length);
console.log('🔧 Your servers:', Object.keys(projectConfig.mcpServers).join(', '));

console.log('\n🚀 Run "claude mcp list" to verify the updated configuration');