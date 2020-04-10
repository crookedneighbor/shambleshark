const path = require('path')

module.exports = {
  preset: 'ts-jest',
  setupFilesAfterEnv: ['./test/_setup.js'],
  moduleNameMapper: {
    '^Js/(.*)$': path.resolve(__dirname, 'src/js/$1'),
    '^Constants$': path.resolve(__dirname, 'src/js/resources/constants.js'),
    '^Features/(.*)$': path.resolve(__dirname, 'src/js/features/$1'),
    '^Feature$': path.resolve(__dirname, 'src/js/features/feature.js'),
    '^Lib/(.*)$': path.resolve(__dirname, 'src/js/lib/$1'),
    '^Ui/(.*)$': path.resolve(__dirname, 'src/js/lib/ui-elements/$1'),
    '^Svg$': path.resolve(__dirname, 'src/js/resources/svg.js'),
    '^Browser/runtime$': path.resolve(__dirname, 'src/js/lib/chrome/runtime'),
    '^Browser/storage$': path.resolve(__dirname, 'src/js/lib/chrome/storage'),
    '\\.css$': '<rootDir>/test/mocks/styles.js'
  },
  transform: {
    '^.+\\.[jt]s$': 'babel-jest'
  }
}
