/** @format */

"use strict";

function prettierTemplate() {
  return JSON.stringify(
    {
      semi: true,
      singleQuote: false,
      quoteProps: "as-needed",
      jsxSingleQuote: false,
      trailingComma: "all",
      bracketSpacing: true,
      bracketSameLine: false,
      arrowParens: "always",
      printWidth: 80,
      tabWidth: 2,
      useTabs: false,
      endOfLine: "lf",
    },
    null,
    2,
  );
}

module.exports = { prettierTemplate };
