/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@org/common/(.*)$": [
      "<rootDir>/../../packages/common/src/$1",
      "<rootDir>/../../packages/common/src/exports/$1",
      "<rootDir>/../../packages/common/src/infrastructure/$1",
    ],
    "^@org/identity-and-access/(.*)$": [
      "<rootDir>/../../packages/identity-and-access/src/$1",
      "<rootDir>/../../packages/identity-and-access/src/exports/$1",
    ],
    "^@org/subscription/(.*)$": [
      "<rootDir>/../../packages/subscription/src/$1",
      "<rootDir>/../../packages/subscription/src/exports/$1",
    ],
  },
};
