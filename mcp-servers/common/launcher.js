const { spawn } = require('child_process');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

function parseArgs(builder) {
  return builder(yargs(hideBin(process.argv)))
    .help()
    .alias('help', 'h')
    .parse();
}

function launch({ command, args = [], env = process.env, cwd, name = 'MCP Server', onError, onClose }) {
  console.error(`Starting ${name}...`);
  const child = spawn(command, args, { stdio: ['inherit', 'inherit', 'inherit'], env, cwd });

  const shutdown = () => {
    console.error(`Shutting down ${name}...`);
    child.kill('SIGTERM');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  child.on('close', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`${name} exited with code ${code}`);
      if (onClose) onClose(code);
      process.exit(code);
    }
  });

  child.on('error', (error) => {
    console.error(`Error starting ${name}:`, error.message);
    if (onError) onError(error);
    process.exit(1);
  });

  return child;
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = { parseArgs, launch, spawn };
