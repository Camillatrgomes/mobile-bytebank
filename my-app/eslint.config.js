const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const reactHooks = require('eslint-plugin-react-hooks');

module.exports = defineConfig([
  expoConfig,
  {
    // Só as regras: o plugin react-hooks já é registrado pelo eslint-config-expo.
    rules: reactHooks.configs.flat['recommended-latest'].rules,
  },
  {
    ignores: ['dist/*', '.expo/'],
  },
]);
