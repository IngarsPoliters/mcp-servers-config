const fs = require('fs');
const path = require('path');

describe('startup checks', () => {
  test('contains DISABLE_THOUGHT_LOGGING', () => {
    const file = fs.readFileSync(path.join(__dirname, '..', 'index.js'), 'utf8');
    expect(file).toMatch(/DISABLE_THOUGHT_LOGGING/);
  });
});
