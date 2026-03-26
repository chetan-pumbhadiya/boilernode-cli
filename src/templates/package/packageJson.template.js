/** @format */

"use strict";

function packageJsonTemplate(cfg) {
  const isTS = cfg.language === "typescript";
  const name = cfg.projectName.toLowerCase().replace(/[^a-z0-9-]/g, "-");

  const scripts = isTS
    ? {
        dev: "ts-node-dev --respawn --transpile-only src/server.ts",
        build: "tsc",
        start: "node dist/server.js",
        lint: "eslint src --ext .ts",
        ...(cfg.database === "drizzle" && {
          "db:push": "drizzle-kit push",
          "db:studio": "drizzle-kit studio",
          "db:generate": "drizzle-kit generate",
        }),
        ...(cfg.database === "prisma" && {
          "db:push": "prisma migrate dev",
          "db:studio": "prisma studio",
          "db:generate": "prisma generate",
        }),
      }
    : {
        dev: "node --watch src/server.js",
        start: "node src/server.js",
        lint: "eslint src",
        ...(cfg.database === "drizzle" && {
          "db:push": "drizzle-kit push",
          "db:studio": "drizzle-kit studio",
          "db:generate": "drizzle-kit generate",
        }),
        ...(cfg.database === "prisma" && {
          "db:push": "prisma migrate dev",
          "db:studio": "prisma studio",
          "db:generate": "prisma generate",
        }),
      };

  const pkg = {
    name,
    version: "1.0.0",
    description: `${cfg.projectName} — Express backend`,
    ...(isTS ? {} : { type: "module" }),
    main: isTS ? "dist/server.js" : "src/server.js",
    scripts,
    keywords: [],
    author: "Boilernode CLI by CP",
    license: "MIT",
    dependencies: {},
    devDependencies: {},
    engines: { node: ">=18.0.0" },
  };

  return JSON.stringify(pkg, null, 2);
}

module.exports = { packageJsonTemplate };
