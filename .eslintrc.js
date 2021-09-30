module.exports = {
  "root": true,
  "parser": "@typescript-eslint/parser",
  "plugins": [
    "@typescript-eslint",
    "prettier"
  ],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "no-console": 0,       // Means ignore
    "prettier/prettier": 2, // Means error
    "@typescript-eslint/no-unused-vars": [
      "warn", { 
        "argsIgnorePattern": "^_", 
        "ignoreRestSiblings": true 
      }
    ],
  }
}
