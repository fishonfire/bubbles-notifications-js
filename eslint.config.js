import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import sonarjs from 'eslint-plugin-sonarjs'
import globals from 'globals'
import tseslint from 'typescript-eslint'

// Fish on Fire formatting and quality rules, using maintained flat-config plugins.
export default [
  { ignores: ['.npm-cache/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: { '@stylistic': stylistic, sonarjs },
    rules: {
      // Preserve the original SonarJS recommended scope; newer presets add unrelated policies.
      'sonarjs/cognitive-complexity': 'error',
      'sonarjs/elseif-without-else': 'off',
      'sonarjs/max-switch-cases': 'error',
      'sonarjs/no-all-duplicated-branches': 'error',
      'sonarjs/no-collapsible-if': 'error',
      'sonarjs/no-collection-size-mischeck': 'error',
      'sonarjs/no-duplicate-string': 'error',
      'sonarjs/no-duplicated-branches': 'error',
      'sonarjs/no-element-overwrite': 'error',
      'sonarjs/no-empty-collection': 'error',
      'sonarjs/no-extra-arguments': 'error',
      'sonarjs/no-gratuitous-expressions': 'error',
      'sonarjs/no-identical-conditions': 'error',
      'sonarjs/no-identical-expressions': 'error',
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-ignored-return': 'error',
      'sonarjs/no-inverted-boolean-check': 'off',
      'sonarjs/no-nested-switch': 'error',
      'sonarjs/no-nested-template-literals': 'error',
      // SonarJS retired no-one-iteration-loop in favor of this core rule.
      'no-unreachable-loop': 'error',
      'sonarjs/no-redundant-boolean': 'error',
      'sonarjs/no-redundant-jump': 'error',
      'sonarjs/no-same-line-conditional': 'error',
      'sonarjs/no-small-switch': 'error',
      'sonarjs/no-unused-collection': 'error',
      'sonarjs/no-use-of-empty-return-value': 'error',
      'sonarjs/no-useless-catch': 'error',
      'sonarjs/non-existent-operator': 'error',
      'sonarjs/prefer-immediate-return': 'error',
      'sonarjs/prefer-object-literal': 'error',
      'sonarjs/prefer-single-boolean-return': 'error',
      'sonarjs/prefer-while': 'error',
      '@stylistic/indent': ['error', 2, { SwitchCase: 0 }],
      '@stylistic/linebreak-style': ['error', 'unix'],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/no-trailing-spaces': 'error',
      '@stylistic/comma-dangle': ['error', 'never'],
      'arrow-body-style': ['error', 'as-needed'],
      '@stylistic/eol-last': 'error',
      '@stylistic/space-before-function-paren': ['error', 'always'],
      '@stylistic/jsx-quotes': ['error', 'prefer-single'],
      '@stylistic/lines-between-class-members': ['error', 'always'],
      '@stylistic/multiline-ternary': ['error', 'always-multiline'],
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-useless-constructor': 'error',
      'no-var': 'error',
      '@stylistic/space-before-blocks': 'error',
      'prefer-template': 'error',
      '@stylistic/keyword-spacing': ['error', { before: true, after: true }],
      '@stylistic/no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1, maxBOF: 0 }],
      // Includes the old newline-before-return rule, avoiding duplicate diagnostics.
      '@stylistic/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] }
      ],
      '@stylistic/operator-linebreak': ['error', 'after', { overrides: { '?': 'before', ':': 'before' } }],
      'require-yield': 'off'
    }
  },
  {
    files: ['**/*.d.ts'],
    rules: { '@stylistic/lines-between-class-members': 'off' }
  }
]
