module.exports = {
  root: true,
  env: {
    node: true,
    'react-native/react-native': true,
  },
  extends: ['@react-native'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        endOfLine: 'auto',
      },
    ],
  },
};
