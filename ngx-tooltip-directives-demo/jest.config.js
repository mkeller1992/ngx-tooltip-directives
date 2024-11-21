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
};