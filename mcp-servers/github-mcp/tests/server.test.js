const fs = require('fs');
const path = require('path');

describe('startup checks', () => {
  test('contains GITHUB_PERSONAL_ACCESS_TOKEN', () => {
    const file = fs.readFileSync(path.join(__dirname, '..', 'index.js'), 'utf8');
    expect(file).toMatch(/GITHUB_PERSONAL_ACCESS_TOKEN/);
  });
});
