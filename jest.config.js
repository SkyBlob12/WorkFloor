/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/__tests__/setup.ts'],
  testMatch: ['<rootDir>/__tests__/**/*.test.ts?(x)'],
  moduleNameMapper: {
    '^@components/(.*)$': '<rootDir>/components/$1',
    '^@hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@stores/(.*)$': '<rootDir>/stores/$1',
    '^@services/(.*)$': '<rootDir>/services/$1',
    '^@constants/(.*)$': '<rootDir>/constants/$1',
    '^@app-types/(.*)$': '<rootDir>/types/$1',
    '^@utils/(.*)$': '<rootDir>/utils/$1',
    '^@lib/(.*)$': '<rootDir>/lib/$1',
    '^@assets/(.*)$': '<rootDir>/assets/$1',
    '^@/(.*)$': '<rootDir>/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|@gorhom/.*|@supabase/.*|standard-navigation|i18next|react-i18next|zustand|posthog-react-native)',
  ],
  collectCoverageFrom: ['utils/**/*.ts', 'hooks/**/*.ts', 'constants/**/*.ts', 'services/**/*.ts'],
  coverageThreshold: {
    './utils/': { branches: 30, functions: 30, lines: 30, statements: 30 },
    './hooks/': { branches: 30, functions: 30, lines: 30, statements: 30 },
    './constants/': { branches: 30, functions: 30, lines: 30, statements: 30 },
  },
};
