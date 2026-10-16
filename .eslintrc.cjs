// Non-React rules from https://github.com/fishonfire/eslint-config-fishonfire
module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:sonarjs/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['@typescript-eslint', 'sonarjs'],
  ignorePatterns: ['.npm-cache/'],
  overrides: [
    {
      files: ['**/*.d.ts'],
      rules: { 'lines-between-class-members': 'off' }
    }
  ],
  rules: {
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'never'],
    'no-trailing-spaces': 'error',
    'comma-dangle': ['error', 'never'],
    'arrow-body-style': ['error', 'as-needed'],
    'eol-last': 'error',
    'space-before-function-paren': ['error', 'always'],
    'jsx-quotes': ['error', 'prefer-single'],
    'lines-between-class-members': ['error', 'always'],
    'multiline-ternary': ['error', 'always-multiline'],
    'newline-before-return': 'error',
    'no-empty': ['error', { allowEmptyCatch: true }],
    'no-useless-constructor': 'error',
    'no-var': 'error',
    'space-before-blocks': 'error',
    'prefer-template': 'error',
    'keyword-spacing': ['error', { before: true, after: true }],
    'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1, maxBOF: 0 }],
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: '*', next: 'return' },
      { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
      { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] }
    ],
    'operator-linebreak': ['error', 'after', { overrides: { '?': 'before', ':': 'before' } }],
    'require-yield': 'off'
  }
}
