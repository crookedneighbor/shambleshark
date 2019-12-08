const path = require('path')

module.exports = {
  setupFilesAfterEnv: ['./test/_setup.js'],
  moduleNameMapper: {
    '^Browser/runtime$': path.resolve(__dirname, 'src/js/lib/chrome/runtime'),
    '^Browser/storage$': path.resolve(__dirname, 'src/js/lib/chrome/storage'),
    '\\.css$': '<rootDir>/test/mocks/styles.js'
  }
}
