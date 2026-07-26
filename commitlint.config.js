/**
 * Enforce Conventional Commits (https://www.conventionalcommits.org).
 * Runs from the Husky `commit-msg` hook.
 *
 * Format: <type>(<optional scope>): <subject>
 * Examples:
 *   feat(server): add rate limiting
 *   fix(web): correct dashboard total calculation
 *   docs: update README architecture diagram
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
    'subject-case': [0],
    'header-max-length': [2, 'always', 120],
  },
};
