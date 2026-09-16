/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.test.json',
      },
    ],
  },
  moduleNameMapper: {
    '^nanoid$': '<rootDir>/src/__mocks__/nanoidMock.cjs',
    '^.+\\.module\\.css$': '<rootDir>/src/__mocks__/styleMock.cjs',
    '^.+\\.css$': '<rootDir>/src/__mocks__/styleMock.cjs',
  },
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
};
