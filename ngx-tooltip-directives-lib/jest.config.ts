
module.exports = {
    preset: 'jest-preset-angular',
    maxWorkers: "4", // Use 4 threads for parallel test runs
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/projects/ngx-tooltip-directives/src/jest.setup.ts'],
    testPathIgnorePatterns: [
      '<rootDir>/node_modules/',
      '<rootDir>/dist/',
      '<rootDir>/cypress/',
    ],
    modulePathIgnorePatterns: ["<rootDir>/dist/"],
    moduleNameMapper: {
      '^@lib/(.*)$': '<rootDir>/src/lib/$1',
    },
    collectCoverage: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
      '<rootDir>/projects/ngx-tooltip-directives/src/**/*.{ts,js}',
      '!<rootDir>/projects/ngx-tooltip-directives/src/public-api.ts',
      '!<rootDir>/projects/ngx-tooltip-directives/src/lib/*.module.ts', // Exclude module files
      '!<rootDir>/projects/ngx-tooltip-directives/src/**/*.spec.ts', // Exclude test files
      '!<rootDir>/projects/ngx-tooltip-directives/src/lib/mocks/mock-ngx-tooltip-directives.module.ts',
    ],
    coverageReporters: ['html', 'text', 'text-summary', 'lcov'],
};
