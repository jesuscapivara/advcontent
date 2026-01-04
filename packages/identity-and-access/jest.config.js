/** @type {import('ts-jest').JestConfigWithTsJest} */

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@org/common/(.*)$": [
      "<rootDir>/../common/src/$1",
      "<rootDir>/../common/src/exports/$1",
      "<rootDir>/../common/src/infrastructure/$1",
    ],
  },
};
