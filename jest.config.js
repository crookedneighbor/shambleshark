/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");

module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["./test/helpers/setup.ts"],
  moduleNameMapper: {
    "^Js/(.*)$": path.resolve(__dirname, "src/js/$1"),
    "^Helpers/(.*)$": path.resolve(__dirname, "test/helpers/$1"),
    "\\.(css|gif|png|jpg|jpeg)$": "<rootDir>/test/mocks/assets.ts",

    // These need to be duplicated from the webpack config
    "^Constants$": path.resolve(__dirname, "src/js/resources/constants.ts"),
    "^Features/(.*)$": path.resolve(__dirname, "src/js/features/$1"),
    "^Feature$": path.resolve(__dirname, "src/js/features/feature.ts"),
    "^Lib/(.*)$": path.resolve(__dirname, "src/js/lib/$1"),
    "^Ui/(.*)$": path.resolve(__dirname, "src/js/lib/ui-elements/$1"),
    "^Svg$": path.resolve(__dirname, "src/js/resources/svg.ts"),
    "^Browser/runtime$": path.resolve(__dirname, "src/js/lib/chrome/runtime"),
    "^Browser/storage$": path.resolve(__dirname, "src/js/lib/chrome/storage"),
  },
  clearMocks: true,
  moduleFileExtensions: ["ts", "js", "json", "node"],
};
