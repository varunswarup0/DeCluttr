module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/$1',
  },
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
