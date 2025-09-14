const fs = require('fs');
const path = require('path');

describe('startup checks', () => {
  test('contains npx is not available', () => {
    const file = fs.readFileSync(path.join(__dirname, '..', 'index.js'), 'utf8');
    expect(file).toMatch(/npx is not available/);
  });
});
