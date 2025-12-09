module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  collectCoverageFrom: [
    'services/**/*.js',
    'controllers/**/*.js',
    '!**/node_modules/**',
  ],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
};
