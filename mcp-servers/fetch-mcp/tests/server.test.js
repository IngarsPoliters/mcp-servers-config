const fs = require('fs');
const path = require('path');

describe('startup checks', () => {
  test('contains None of the required tools (uvx, docker, npx)', () => {
    const file = fs.readFileSync(path.join(__dirname, '..', 'index.js'), 'utf8');
    expect(file).toMatch(/None of the required tools \(uvx, docker, npx\)/);
  });
});
