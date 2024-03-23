module.exports = {
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
      '<rootDir>/src/app/*.{ts,js}',
      '!<rootDir>/src/app/*.module.ts', // Exclude module files
    ],
    coverageReporters: ['html', 'text', 'text-summary', 'lcov'],
};