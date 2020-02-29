const path = require('path')

module.exports = {
  setupFilesAfterEnv: ['./test/_setup.js'],
  moduleNameMapper: {
    '^Features/(.*)$': path.resolve(__dirname, 'src/js/features/$1'),
    '^Lib/(.*)$': path.resolve(__dirname, 'src/js/lib/$1'),
    '^Ui/(.*)$': path.resolve(__dirname, 'src/js/lib/ui-elements/$1'),
    '^Browser/runtime$': path.resolve(__dirname, 'src/js/lib/chrome/runtime'),
    '^Browser/storage$': path.resolve(__dirname, 'src/js/lib/chrome/storage'),
    '\\.css$': '<rootDir>/test/mocks/styles.js'
  }
}
