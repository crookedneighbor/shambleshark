const path = require('path')

module.exports = {
  setupFilesAfterEnv: ['./test/_setup.js'],
  moduleNameMapper: {
    BrowserStorage: path.resolve(__dirname, 'src/js/lib/chrome-storage/')
  }
}
