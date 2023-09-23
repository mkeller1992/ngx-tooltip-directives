
module.exports = {
    preset: 'jest-preset-angular',
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
    ],
    coverageReporters: ['html', 'text-summary', 'lcov'],
};
