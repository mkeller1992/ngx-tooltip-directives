module.exports = {
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
      '<rootDir>/src/app/*.{ts,js}',
      '!<rootDir>/src/app/*.routes.ts', // Exclude route-files
    ],
    coverageReporters: ['html', 'text', 'text-summary', 'lcov'],
    moduleNameMapper: {
      '^@ngx-tooltip-directives$': '<rootDir>/../ngx-tooltip-directives-lib/projects/ngx-tooltip-directives/src/public-api.ts'
    },
    resolver: 'jest-ts-webcompat-resolver'
};