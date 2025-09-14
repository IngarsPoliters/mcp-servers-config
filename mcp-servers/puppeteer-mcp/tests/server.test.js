const fs = require('fs');
const path = require('path');

describe('startup checks', () => {
  test('contains Launching browser', () => {
    const file = fs.readFileSync(path.join(__dirname, '..', 'index.js'), 'utf8');
    expect(file).toMatch(/Launching browser/);
  });
});
