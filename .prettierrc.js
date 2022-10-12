module.exports = {
  printWidth: 80,
  tabWidth: 2,
  semi: true,
  bracketSameLine: true,
  singleQuote: true,
  trailingComma: 'all',
  overrides: [{ files: '.prettierrc', options: { parser: 'json' } }],
  plugins: ['prettier-plugin-packagejson', './scripts/prettier-plugin'],
};
