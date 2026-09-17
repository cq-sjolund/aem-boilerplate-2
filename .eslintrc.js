module.exports = {
  root: true,
  extends: 'airbnb-base',
  env: {
    browser: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    requireConfigFile: false,
  },
  rules: {
    'import/extensions': ['error', { js: 'always' }], // require js file extensions in imports
    'linebreak-style': ['error', 'unix'], // enforce unix linebreaks
    'no-param-reassign': [2, { props: false }], // allow modifying properties of param
  },
  overrides: [
    {
      files: ['**/*.test.js'],
      env: {
        mocha: true,
        es2020: true, // for globalThis, used when mocking fetch in tests
      },
      rules: {
        'no-unused-expressions': 'off', // allow Chai BDD getter assertions, e.g. expect(x).to.exist
      },
    },
  ],
};
