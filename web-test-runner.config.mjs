export default {
  files: 'blocks/**/*.test.js',
  nodeResolve: true,
  coverageConfig: {
    include: ['blocks/**/*.js'],
    exclude: ['blocks/**/*.test.js'],
  },
};
