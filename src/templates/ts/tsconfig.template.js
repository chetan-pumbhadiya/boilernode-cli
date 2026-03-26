/** @format */

"use strict";

function tsconfigTemplate() {
  return JSON.stringify(
    {
      compilerOptions: {
        target: "ES2020",
        module: "commonjs",
        lib: ["ES2020"],
        outDir: "./dist",
        rootDir: "./src",
        strict: true,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true,
        declaration: true,
        declarationMap: true,
        sourceMap: true,
        removeComments: true,
        noImplicitAny: true,
        noUnusedLocals: false,
        noUnusedParameters: false,
        noImplicitReturns: true,
        noFallthroughCasesInSwitch: true,
        moduleResolution: "node",
      },
      include: ["src/**/*"],
      exclude: ["node_modules", "dist"],
    },
    null,
    2,
  );
}

module.exports = { tsconfigTemplate };
