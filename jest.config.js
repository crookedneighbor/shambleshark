/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");

module.exports = {
  // TODO change to ts-jest when all converted over
  preset: "ts-jest/presets/js-with-babel",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["./test/helpers/setup.js"],
  moduleNameMapper: {
    "^Js/(.*)$": path.resolve(__dirname, "src/js/$1"),
    "^Helpers/(.*)$": path.resolve(__dirname, "test/helpers/$1"),
    "\\.css$": "<rootDir>/test/mocks/styles.js",

    // These need to be duplicated from the webpack config
    "^Constants$": path.resolve(__dirname, "src/js/resources/constants.js"),
    "^Features/(.*)$": path.resolve(__dirname, "src/js/features/$1"),
    "^Feature$": path.resolve(__dirname, "src/js/features/feature.js"),
    "^Lib/(.*)$": path.resolve(__dirname, "src/js/lib/$1"),
    "^Ui/(.*)$": path.resolve(__dirname, "src/js/lib/ui-elements/$1"),
    "^Svg$": path.resolve(__dirname, "src/js/resources/svg.js"),
    "^Browser/runtime$": path.resolve(__dirname, "src/js/lib/chrome/runtime"),
    "^Browser/storage$": path.resolve(__dirname, "src/js/lib/chrome/storage"),
  },
  clearMocks: true,
  moduleFileExtensions: ["ts", "js", "json", "node"],
};
