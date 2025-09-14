const { spawn } = require('child_process');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

function parseArgs(builder) {
  return builder(yargs(hideBin(process.argv)))
    .help()
    .alias('help', 'h')
    .parse();
}

function launch(command, args, { env = process.env, serverName = 'MCP Server', onError, spawnOptions = {} } = {}) {
  const child = spawn(command, args, {
    stdio: ['inherit', 'inherit', 'inherit'],
    env,
    ...spawnOptions
  });

  function shutdown() {
    console.error(`Shutting down ${serverName}...`);
    child.kill('SIGTERM');
    process.exit(0);
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  child.on('close', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`${serverName} exited with code ${code}`);
      process.exit(code);
    }
  });

  child.on('error', (error) => {
    if (onError) {
      onError(error);
    } else {
      console.error(`Error starting ${serverName}:`, error.message);
    }
    process.exit(1);
  });

  return child;
}

module.exports = { parseArgs, launch };
