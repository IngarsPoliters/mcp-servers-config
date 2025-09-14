const fs = require('fs');
const path = require('path');

describe('startup checks', () => {
  test('contains SLACK_MCP_XOXC_TOKEN', () => {
    const file = fs.readFileSync(path.join(__dirname, '..', 'index.js'), 'utf8');
    expect(file).toMatch(/SLACK_MCP_XOXC_TOKEN/);
  });
});
