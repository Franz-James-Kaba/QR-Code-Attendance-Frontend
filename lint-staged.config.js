module.exports = {
  'src/**/*.{ts,js,html,scss,json}': ['prettier --write', 'eslint --fix'],
  '*.{yml,yaml}': ['prettier --write'], // For .github/workflows/pr-checks.yml
  Dockerfile: ['hadolint'], // For Dockerfile, if using a linter
  '*.sh': ['shellcheck'], // For .husky/pre-commit, assuming it’s a shell script
  '*.js': ['prettier --write', 'eslint --fix'], // For lint-staged.config.js
};
