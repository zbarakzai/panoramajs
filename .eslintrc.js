module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
  ],
  settings: {
    react: {
      version: '18.0',
    },
  },
  ignorePatterns: ['node_modules', 'dist'],
  rules: {
    'no-process-env': 'off',
    'func-style': 'off',
    'no-negated-condition': 'off',
    'no-warning-comments': 'off',
    'consistent-return': 'off',
    'lines-around-comment': [
      'error',
      {
        beforeBlockComment: false,
        allowBlockStart: false,
      },
    ],

    'react/no-array-index-key': 'off',
    'react/no-unsafe': ['error', {checkAliases: true}],
    '@typescript-eslint/array-type': ['error', {default: 'array'}],
    '@typescript-eslint/naming-convention': 'off',
    'jsx-a11y/no-autofocus': 'off',
    'jsx-a11y/anchor-has-content': 'off',
    'jsx-a11y/control-has-associated-label': 'off',
    'jsx-a11y/role-supports-aria-props': 'off',
    'jsx-a11y/mouse-events-have-key-events': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-noninteractive-element-interactions': 'off',
    'jsx-a11y/no-noninteractive-element-to-interactive-role': 'off',
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-this-alias': 'off',
  },
};
