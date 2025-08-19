# Coolify Write Operations Documentation

## ⚠️ IMPORTANT: Confirmation Gate Pattern

**ALL WRITE OPERATIONS REQUIRE EXPLICIT USER CONFIRMATION**

Before performing any write operation, Claude must:
1. Show the exact command that will be executed
2. Ask user to type "YES" to confirm
3. Only proceed after receiving explicit "YES" response
4. Capture all output to `artifacts/coolify/last-action.json`

## Write Operation Tools

### Application Management

#### start_application
**Tool Name:** `start_application`
**Description:** Start a previously created application
**Parameters:**
- `uuid` (required): UUID of the application to start

**Usage Pattern:**
```
⚠️  WRITE OPERATION REQUESTED: start_application
📋 Action: Start application with UUID: abc123-def456-ghi789
🎯 Target: Application "my-app" 
📁 Output: artifacts/coolify/last-action.json

❓ Type "YES" to confirm this action, or anything else to cancel.
```

#### restart_application
**Tool Name:** `restart_application`  
**Description:** Restart an application by stopping and starting it
**Parameters:**
- `uuid` (required): UUID of the application to restart

**Usage Pattern:**
```
⚠️  WRITE OPERATION REQUESTED: restart_application
📋 Action: Restart application with UUID: abc123-def456-ghi789
🎯 Target: Application "my-app"
⏱️  Expected downtime: 30-60 seconds
📁 Output: artifacts/coolify/last-action.json

❓ Type "YES" to confirm this action, or anything else to cancel.
```

#### stop_application
**Tool Name:** `stop_application`
**Description:** Stop a running application
**Parameters:**
- `uuid` (required): UUID of the application to stop

**Usage Pattern:**
```
⚠️  WRITE OPERATION REQUESTED: stop_application
📋 Action: Stop application with UUID: abc123-def456-ghi789
🎯 Target: Application "my-app"
⚠️  Warning: This will make the application inaccessible
📁 Output: artifacts/coolify/last-action.json

❓ Type "YES" to confirm this action, or anything else to cancel.
```

### Service Management

#### start_service
**Tool Name:** `start_service`
**Description:** Start a previously created service
**Parameters:**
- `uuid` (required): UUID of the service to start

#### restart_service  
**Tool Name:** `restart_service`
**Description:** Restart a service by stopping and starting it
**Parameters:**
- `uuid` (required): UUID of the service to restart

**Usage Pattern:**
```
⚠️  WRITE OPERATION REQUESTED: restart_service
📋 Action: Restart service with UUID: xyz789-abc123-def456
🎯 Target: Service "backend-api"
⏱️  Expected downtime: 10-30 seconds
📁 Output: artifacts/coolify/last-action.json

❓ Type "YES" to confirm this action, or anything else to cancel.
```

#### stop_service
**Tool Name:** `stop_service`
**Description:** Stop a running service
**Parameters:**
- `uuid` (required): UUID of the service to stop

### Server Management

#### create_server
**Tool Name:** `create_server`
**Description:** Create a new server in Coolify
**Parameters:**
- `name` (required): Server name
- `ip` (required): Server IP address
- `port` (required): SSH port (default: 22)
- `user` (required): SSH username
- `private_key_uuid` (required): UUID of SSH private key

#### validate_server
**Tool Name:** `validate_server`
**Description:** Validate server configuration and connectivity
**Parameters:**
- `uuid` (required): Server UUID to validate

### Command Execution

#### execute_command_application
**Tool Name:** `execute_command_application`
**Description:** Execute a command inside an application container
**Parameters:**
- `uuid` (required): Application UUID
- `command` (required): Command to execute

**Usage Pattern:**
```
⚠️  WRITE OPERATION REQUESTED: execute_command_application
📋 Action: Execute command in application container
🎯 Target: Application UUID: abc123-def456-ghi789
💻 Command: npm run migrations
⚠️  Warning: Commands can modify application state
📁 Output: artifacts/coolify/last-action.json

❓ Type "YES" to confirm this action, or anything else to cancel.
```

## Confirmation Gate Implementation

### Step 1: Show Operation Details
```javascript
function showWriteOperationConfirmation(toolName, params, target) {
    console.log(`⚠️  WRITE OPERATION REQUESTED: ${toolName}`);
    console.log(`📋 Action: ${getActionDescription(toolName, params)}`);
    console.log(`🎯 Target: ${target}`);
    console.log(`📁 Output: artifacts/coolify/last-action.json`);
    console.log();
    console.log(`❓ Type "YES" to confirm this action, or anything else to cancel.`);
}
```

### Step 2: Wait for User Confirmation
- Only proceed if user types exactly "YES"
- Any other response cancels the operation
- Log the user's response

### Step 3: Execute and Capture Output
```javascript
async function executeWithCapture(toolName, params) {
    const timestamp = new Date().toISOString();
    const outputFile = 'artifacts/coolify/last-action.json';
    
    try {
        const result = await callCoolifyTool(toolName, params);
        
        const actionLog = {
            tool_name: toolName,
            parameters: params,
            timestamp: timestamp,
            status: result.success ? 'success' : 'failed',
            result: result.data,
            error: result.error || null
        };
        
        fs.writeFileSync(outputFile, JSON.stringify(actionLog, null, 2));
        
        if (result.success) {
            console.log(`✅ SUCCESS: ${toolName} completed successfully`);
        } else {
            console.log(`❌ FAILED: ${toolName} failed - ${result.error}`);
        }
        
        console.log(`📁 Full details saved to: ${outputFile}`);
        
    } catch (error) {
        const errorLog = {
            tool_name: toolName,
            parameters: params,
            timestamp: timestamp,
            status: 'error',
            error: error.message
        };
        
        fs.writeFileSync(outputFile, JSON.stringify(errorLog, null, 2));
        console.log(`💥 ERROR: ${error.message}`);
        console.log(`📁 Error details saved to: ${outputFile}`);
    }
}
```

## Safe Testing Pattern

### Start with No-Risk Actions
1. **validate_server** - Read-only validation
2. **restart_service** on test/non-critical services
3. **execute_command_application** with safe commands like `ls` or `pwd`

### Progressive Risk Levels
1. **Low Risk**: Restart non-critical test services
2. **Medium Risk**: Restart staging applications  
3. **High Risk**: Production application operations

## Example Usage Scenarios

### Scenario 1: Restart Test Application
```
User: "Restart the test application"
Claude: 
⚠️  WRITE OPERATION REQUESTED: restart_application
📋 Action: Restart application with UUID: test-app-uuid-123
🎯 Target: Application "test-backend" (staging environment)
⏱️  Expected downtime: 30-60 seconds
📁 Output: artifacts/coolify/last-action.json

❓ Type "YES" to confirm this action, or anything else to cancel.

[User types: YES]

Claude: Executing restart_application...
✅ SUCCESS: Application restarted successfully
📁 Full details saved to: artifacts/coolify/last-action.json
```

### Scenario 2: Execute Safe Command
```
User: "Check disk space in the main app"
Claude:
⚠️  WRITE OPERATION REQUESTED: execute_command_application
📋 Action: Execute command in application container
🎯 Target: Application "main-app" 
💻 Command: df -h
📁 Output: artifacts/coolify/last-action.json

❓ Type "YES" to confirm this action, or anything else to cancel.

[User types: YES]

Claude: Executing command...
✅ SUCCESS: Command executed successfully
💾 Output: Filesystem usage information captured
📁 Full details saved to: artifacts/coolify/last-action.json
```

## Security Guidelines

1. **Never perform write operations without explicit "YES" confirmation**
2. **Always capture and log all actions**
3. **Start with the least risky operations**
4. **Verify target before execution**
5. **Provide clear action descriptions**
6. **Save detailed logs for audit trail**

## Output File Format

The `artifacts/coolify/last-action.json` file contains:
```json
{
  "tool_name": "restart_application",
  "parameters": {
    "uuid": "abc123-def456-ghi789"
  },
  "timestamp": "2025-08-19T01:45:00.000Z",
  "status": "success|failed|error",
  "result": { /* API response data */ },
  "error": null,
  "confirmation_received": "YES",
  "user_request": "Restart the test application"
}
```

## Implementation Notes

- All write operations must use the confirmation gate pattern
- No exceptions for "safe" operations - everything requires confirmation
- Log user confirmation in the output file
- Provide clear success/failure feedback
- Include troubleshooting information for failures