export default {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  moduleFileExtensions: ['ts', 'html', 'js', 'json', 'mjs'],
  transform: {
    '^.+\\.ts$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.html$',
      },
    ],
  },
  // Improved moduleNameMapper configuration
  moduleNameMapper: {
    // Use exact path for each alias - make sure these match exactly with your tsconfig.json
    "^@store/(.*)$": "<rootDir>/src/app/core/store/$1",
    "^@environments/(.*)$": "<rootDir>/src/environments/$1", // Fix environment path
    "^@app/(.*)$": "<rootDir>/src/app/$1",
    "^@core/(.*)$": "<rootDir>/src/app/core/$1",
    "^@shared/(.*)$": "<rootDir>/src/app/shared/$1",
    "^@features/(.*)$": "<rootDir>/src/app/features/$1",
    "^@services/(.*)$": "<rootDir>/src/app/core/services/$1",
    "^@models/(.*)$": "<rootDir>/src/app/shared/models/$1", // Fix models path to match your structure
    "^@utils/(.*)$": "<rootDir>/src/app/core/utils/$1",
    "^@config/(.*)$": "<rootDir>/src/app/core/config/$1",
    "^@assets/(.*)$": "<rootDir>/src/assets/$1", // Fix assets path
    "^@styles/(.*)$": "<rootDir>/src/styles/$1", // Fix styles path

    // Feature-specific paths for Admin
    "^@Admin/store/(.*)$": "<rootDir>/src/app/features/Admin/core/store/$1",
    "^@Admin/environments/(.*)$": "<rootDir>/src/app/features/Admin/environments/$1",
    "^@Admin/app/(.*)$": "<rootDir>/src/app/features/Admin/$1",
    "^@Admin/core/(.*)$": "<rootDir>/src/app/features/Admin/core/$1",
    "^@Admin/shared/(.*)$": "<rootDir>/src/app/features/Admin/shared/$1",
    "^@Admin/features/(.*)$": "<rootDir>/src/app/features/Admin/features/$1",
    "^@Admin/services/(.*)$": "<rootDir>/src/app/features/Admin/core/services/$1",
    "^@Admin/models/(.*)$": "<rootDir>/src/app/features/Admin/core/models/$1",
    "^@Admin/utils/(.*)$": "<rootDir>/src/app/features/Admin/core/utils/$1",
    "^@Admin/config/(.*)$": "<rootDir>/src/app/features/Admin/core/config/$1",
    "^@Admin/assets/(.*)$": "<rootDir>/src/app/features/Admin/assets/$1",
    "^@Admin/styles/(.*)$": "<rootDir>/src/app/features/Admin/styles/$1" // Fix Admin styles path
  },
  // Add moduleDirectories to help resolve modules
  moduleDirectories: ['node_modules', '<rootDir>'],
  // Make sure transformIgnorePatterns is configured correctly
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)']
};
