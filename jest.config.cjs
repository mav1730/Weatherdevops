module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
  },
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
};
