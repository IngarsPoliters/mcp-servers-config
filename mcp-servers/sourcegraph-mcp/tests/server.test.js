const fs = require('fs');
const path = require('path');

describe('startup checks', () => {
  test('contains SOURCEGRAPH_URL', () => {
    const file = fs.readFileSync(path.join(__dirname, '..', 'index.js'), 'utf8');
    expect(file).toMatch(/SOURCEGRAPH_URL/);
  });
  test('contains SOURCEGRAPH_TOKEN', () => {
    const file = fs.readFileSync(path.join(__dirname, '..', 'index.js'), 'utf8');
    expect(file).toMatch(/SOURCEGRAPH_TOKEN/);
  });
});
