const path = require('path')

module.exports = {
  setupFilesAfterEnv: ['./test/_setup.js'],
  moduleNameMapper: {
    Browser: path.resolve(__dirname, 'src/js/lib/chrome/')
  }
}
