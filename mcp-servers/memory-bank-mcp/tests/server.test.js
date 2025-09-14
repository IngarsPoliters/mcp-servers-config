const fs = require('fs');
const path = require('path');

describe('startup checks', () => {
  test('contains MEMORY_FILE_PATH', () => {
    const file = fs.readFileSync(path.join(__dirname, '..', 'index.js'), 'utf8');
    expect(file).toMatch(/MEMORY_FILE_PATH/);
  });
});
