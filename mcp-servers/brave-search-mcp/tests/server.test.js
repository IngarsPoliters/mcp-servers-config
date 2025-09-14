const fs = require('fs');
const path = require('path');

describe('startup checks', () => {
  test('contains BRAVE_API_KEY', () => {
    const file = fs.readFileSync(path.join(__dirname, '..', 'index.js'), 'utf8');
    expect(file).toMatch(/BRAVE_API_KEY/);
  });
});
