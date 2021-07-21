// initially from: https://github.com/microsoft/TypeScript-Node-Starter/blob/master/.eslintrc
// articles:
//  - https://code.visualstudio.com/api/advanced-topics/tslint-eslint-migration
//  - https://eslint.org/docs/user-guide/configuring
//  - https://thomlom.dev/setup-eslint-prettier-react/
//  - https://egghead.io/lessons/eslint-avoid-common-javascript-errors-with-eslint
//  - https://www.freecodecamp.org/news/integrating-prettier-with-eslint-and-stylelint-99e74fede33f/

module.exports = {
  env: {
    browser: true,
  },
  parser: "@typescript-eslint/parser",
  extends: ["plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module", // https://github.com/AtomLinter/linter-eslint/issues/462
  },
  rules: {
    semi: ["error", "always"],
    quotes: ["error", "double"],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-inferrable-types": [
      "warn",
      {
        ignoreParameters: true,
      },
    ],
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/ban-ts-ignore": "off",
    "@typescript-eslint/camelcase": "off",
    "@typescript-eslint/no-empty-function": "off",
  },
  globals: {
    log: "readonly",
  },
};
