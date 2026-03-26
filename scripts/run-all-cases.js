#!/usr/bin/env node
/** @format */
"use strict";

/**
 * run-all-cases.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Programmatically invokes the boilernode-cli generator for all 25 test
 * cases without touching any interactive prompts.
 *
 * Output dir: <repo-root>/test-cases/<projectName>
 * Concurrency: 4 projects at a time
 *
 * Usage:  node scripts/run-all-cases.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

const path = require("path");
const fs = require("fs-extra");
const { generate } = require("../src/generator");

// ── Output directory ──────────────────────────────────────────────────────────
const OUTPUT_DIR = path.join(__dirname, "..", "test-cases");
fs.ensureDirSync(OUTPUT_DIR);

// ── 25 Test Configs ───────────────────────────────────────────────────────────
const cases = [
  {
    projectName: "case-01-minimal-ts-mongo",
    language: "typescript",
    architecture: "mvc",
    database: "mongoose",
    auth: "none",
    fileUpload: false,
    storageProvider: undefined,
    realtimeSupport: "none",
    apiDocs: "none",
    validation: "none",
    emailService: "none",
    redisSupport: false,
    installDeps: false,
  },
  {
    projectName: "case-02-full-mongo-ts",
    language: "typescript",
    architecture: "mvc",
    database: "mongoose",
    auth: "jwt-refresh",
    fileUpload: true,
    storageProvider: "s3",
    realtimeSupport: "socketio",
    apiDocs: "swagger",
    validation: "zod",
    emailService: "nodemailer",
    redisSupport: true,
    installDeps: false,
  },
  {
    projectName: "case-03-js-drizzle-basic",
    language: "javascript",
    architecture: "mono",
    database: "drizzle",
    auth: "jwt",
    fileUpload: false,
    storageProvider: undefined,
    realtimeSupport: "none",
    apiDocs: "swagger",
    validation: "joi",
    emailService: "sendgrid",
    redisSupport: false,
    installDeps: false,
  },
  {
    projectName: "case-04-prisma-no-auth",
    language: "typescript",
    architecture: "mono",
    database: "prisma",
    auth: "none",
    fileUpload: true,
    storageProvider: "cloudinary",
    realtimeSupport: "socketio",
    apiDocs: "none",
    validation: "zod",
    emailService: "none",
    redisSupport: true,
    installDeps: false,
  },
  {
    projectName: "case-05-js-mvc-mongo-lite",
    language: "javascript",
    architecture: "mvc",
    database: "mongoose",
    auth: "jwt",
    fileUpload: false,
    storageProvider: undefined,
    realtimeSupport: "socketio",
    apiDocs: "none",
    validation: "none",
    emailService: "nodemailer",
    redisSupport: false,
    installDeps: false,
  },
  {
    projectName: "case-06-ts-drizzle-full",
    language: "typescript",
    architecture: "mono",
    database: "drizzle",
    auth: "jwt-refresh",
    fileUpload: true,
    storageProvider: "s3",
    realtimeSupport: "socketio",
    apiDocs: "swagger",
    validation: "joi",
    emailService: "sendgrid",
    redisSupport: true,
    installDeps: false,
  },
  {
    projectName: "case-07-js-prisma-min",
    language: "javascript",
    architecture: "mvc",
    database: "prisma",
    auth: "none",
    fileUpload: false,
    storageProvider: undefined,
    realtimeSupport: "none",
    apiDocs: "none",
    validation: "none",
    emailService: "none",
    redisSupport: false,
    installDeps: false,
  },
  {
    projectName: "case-08-mongo-cloudinary",
    language: "typescript",
    architecture: "mvc",
    database: "mongoose",
    auth: "jwt",
    fileUpload: true,
    storageProvider: "cloudinary",
    realtimeSupport: "none",
    apiDocs: "swagger",
    validation: "zod",
    emailService: "sendgrid",
    redisSupport: false,
    installDeps: false,
  },
  {
    projectName: "case-09-drizzle-realtime",
    language: "javascript",
    architecture: "mono",
    database: "drizzle",
    auth: "jwt",
    fileUpload: false,
    storageProvider: undefined,
    realtimeSupport: "socketio",
    apiDocs: "swagger",
    validation: "joi",
    emailService: "none",
    redisSupport: true,
    installDeps: false,
  },
  {
    projectName: "case-10-prisma-s3-redis",
    language: "typescript",
    architecture: "mvc",
    database: "prisma",
    auth: "jwt-refresh",
    fileUpload: true,
    storageProvider: "s3",
    realtimeSupport: "none",
    apiDocs: "swagger",
    validation: "zod",
    emailService: "nodemailer",
    redisSupport: true,
    installDeps: false,
  },
  {
    projectName: "case-11-js-mongo-no-rt",
    language: "javascript",
    architecture: "mono",
    database: "mongoose",
    auth: "jwt-refresh",
    fileUpload: true,
    storageProvider: "s3",
    realtimeSupport: "none",
    apiDocs: "swagger",
    validation: "joi",
    emailService: "sendgrid",
    redisSupport: true,
    installDeps: false,
  },
  {
    projectName: "case-12-ts-drizzle-lite",
    language: "typescript",
    architecture: "mvc",
    database: "drizzle",
    auth: "jwt",
    fileUpload: false,
    storageProvider: undefined,
    realtimeSupport: "none",
    apiDocs: "none",
    validation: "zod",
    emailService: "none",
    redisSupport: false,
    installDeps: false,
  },
  {
    projectName: "case-13-prisma-cloudinary-socket",
    language: "javascript",
    architecture: "mvc",
    database: "prisma",
    auth: "jwt",
    fileUpload: true,
    storageProvider: "cloudinary",
    realtimeSupport: "socketio",
    apiDocs: "swagger",
    validation: "joi",
    emailService: "nodemailer",
    redisSupport: true,
    installDeps: false,
  },
  {
    projectName: "case-14-mongo-js-min",
    language: "javascript",
    architecture: "mvc",
    database: "mongoose",
    auth: "none",
    fileUpload: false,
    storageProvider: undefined,
    realtimeSupport: "none",
    apiDocs: "none",
    validation: "none",
    emailService: "none",
    redisSupport: false,
    installDeps: false,
  },
  {
    projectName: "case-15-ts-prisma-clean",
    language: "typescript",
    architecture: "mono",
    database: "prisma",
    auth: "jwt",
    fileUpload: false,
    storageProvider: undefined,
    realtimeSupport: "socketio",
    apiDocs: "swagger",
    validation: "zod",
    emailService: "sendgrid",
    redisSupport: false,
    installDeps: false,
  },
  {
    projectName: "case-16-mongo-all",
    language: "typescript",
    architecture: "mono",
    database: "mongoose",
    auth: "jwt-refresh",
    fileUpload: true,
    storageProvider: "cloudinary",
    realtimeSupport: "socketio",
    apiDocs: "swagger",
    validation: "joi",
    emailService: "sendgrid",
    redisSupport: true,
    installDeps: false,
  },
  {
    projectName: "case-17-drizzle-js-min",
    language: "javascript",
    architecture: "mono",
    database: "drizzle",
    auth: "none",
    fileUpload: false,
    storageProvider: undefined,
    realtimeSupport: "none",
    apiDocs: "none",
    validation: "none",
    emailService: "none",
    redisSupport: false,
    installDeps: false,
  },
  {
    projectName: "case-18-prisma-no-redis",
    language: "typescript",
    architecture: "mvc",
    database: "prisma",
    auth: "jwt-refresh",
    fileUpload: true,
    storageProvider: "s3",
    realtimeSupport: "socketio",
    apiDocs: "swagger",
    validation: "zod",
    emailService: "nodemailer",
    redisSupport: false,
    installDeps: false,
  },
  {
    projectName: "case-19-mongo-socket",
    language: "javascript",
    architecture: "mvc",
    database: "mongoose",
    auth: "jwt",
    fileUpload: false,
    storageProvider: undefined,
    realtimeSupport: "socketio",
    apiDocs: "none",
    validation: "joi",
    emailService: "none",
    redisSupport: true,
    installDeps: false,
  },
  {
    projectName: "case-20-drizzle-s3",
    language: "typescript",
    architecture: "mono",
    database: "drizzle",
    auth: "jwt",
    fileUpload: true,
    storageProvider: "s3",
    realtimeSupport: "none",
    apiDocs: "swagger",
    validation: "zod",
    emailService: "sendgrid",
    redisSupport: true,
    installDeps: false,
  },
  {
    projectName: "case-21-prisma-js-full",
    language: "javascript",
    architecture: "mono",
    database: "prisma",
    auth: "jwt-refresh",
    fileUpload: true,
    storageProvider: "cloudinary",
    realtimeSupport: "socketio",
    apiDocs: "swagger",
    validation: "joi",
    emailService: "sendgrid",
    redisSupport: true,
    installDeps: false,
  },
  {
    projectName: "case-22-mongo-ts-no-upload",
    language: "typescript",
    architecture: "mvc",
    database: "mongoose",
    auth: "jwt",
    fileUpload: false,
    storageProvider: undefined,
    realtimeSupport: "none",
    apiDocs: "swagger",
    validation: "zod",
    emailService: "nodemailer",
    redisSupport: true,
    installDeps: false,
  },
  {
    projectName: "case-23-drizzle-realtime-min",
    language: "javascript",
    architecture: "mvc",
    database: "drizzle",
    auth: "none",
    fileUpload: false,
    storageProvider: undefined,
    realtimeSupport: "socketio",
    apiDocs: "none",
    validation: "none",
    emailService: "none",
    redisSupport: false,
    installDeps: false,
  },
  {
    projectName: "case-24-prisma-cloudinary-no-email",
    language: "typescript",
    architecture: "mono",
    database: "prisma",
    auth: "jwt",
    fileUpload: true,
    storageProvider: "cloudinary",
    realtimeSupport: "none",
    apiDocs: "swagger",
    validation: "zod",
    emailService: "none",
    redisSupport: true,
    installDeps: false,
  },
  {
    projectName: "case-25-max-edge",
    language: "javascript",
    architecture: "mvc",
    database: "mongoose",
    auth: "none",
    fileUpload: true,
    storageProvider: "s3",
    realtimeSupport: "socketio",
    apiDocs: "swagger",
    validation: "joi",
    emailService: "sendgrid",
    redisSupport: false,
    installDeps: false,
  },
];

// ── Simple concurrency limiter ────────────────────────────────────────────────
function createLimiter(concurrency) {
  let active = 0;
  const queue = [];

  function next() {
    if (active >= concurrency || queue.length === 0) return;
    active++;
    const { fn, resolve, reject } = queue.shift();
    fn()
      .then(resolve)
      .catch(reject)
      .finally(() => {
        active--;
        next();
      });
  }

  return function limit(fn) {
    return new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject });
      next();
    });
  };
}

const chalk = require("chalk");

async function runAll() {
  const limit = createLimiter(4);
  const results = [];

  const startAll = Date.now();
  console.log(
    chalk.bold.cyan(
      `\n🚀  Launching ${cases.length} test cases (concurrency = 4)…\n`,
    ),
  );

  process.chdir(OUTPUT_DIR);

  const tasks = cases.map((cfg) =>
    limit(async () => {
      const start = Date.now();
      process.stdout.write(chalk.gray(`  ⏳ Starting  ${cfg.projectName}\n`));
      try {
        await generate({ ...cfg });
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        results.push({ name: cfg.projectName, ok: true, elapsed });
        process.stdout.write(
          chalk.green(`  ✅ Done      ${cfg.projectName}  (${elapsed}s)\n`),
        );
      } catch (err) {
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        results.push({
          name: cfg.projectName,
          ok: false,
          elapsed,
          err: err.message,
        });
        process.stdout.write(
          chalk.red(
            `  ❌ FAILED    ${cfg.projectName}  — ${err.message}\n`,
          ),
        );
      }
    }),
  );

  await Promise.all(tasks);

  const totalTime = ((Date.now() - startAll) / 1000).toFixed(1);

  console.log(
    chalk.bold.cyan(
      "\n─────────────────────────────────────────────────────────────────",
    ),
  );
  console.log(chalk.bold.white("  RESULTS SUMMARY"));
  console.log(
    chalk.bold.cyan(
      "─────────────────────────────────────────────────────────────────",
    ),
  );

  const passed = results.filter((r) => r.ok);
  const failed = results.filter((r) => !r.ok);

  results.forEach((r, i) => {
    const icon = r.ok ? chalk.green("✅") : chalk.red("❌");
    const num = chalk.gray(`${String(i + 1).padStart(2, " ")}.`);
    const name = r.ok ? chalk.white(r.name) : chalk.red(r.name);
    const time = chalk.gray(`${r.elapsed}s`);
    console.log(`  ${num} ${icon} ${name.padEnd(42)} ${time}`);
    if (!r.ok) console.log(chalk.red(`         └─ ${r.err}`));
  });

  console.log(
    chalk.bold.cyan(
      "\n─────────────────────────────────────────────────────────────────",
    ),
  );
  console.log(
    `  ${chalk.green.bold(`${passed.length} passed`)}  ${
      failed.length > 0 ? chalk.red.bold(`${failed.length} failed`) : ""
    }  ${chalk.gray(`total ${totalTime}s`)}`,
  );
  console.log(
    chalk.bold.cyan(
      "─────────────────────────────────────────────────────────────────\n",
    ),
  );

  if (failed.length > 0) process.exit(1);
}

runAll().catch((err) => {
  console.error(chalk.red("\n💥 Runner crashed:"), err);
  process.exit(1);
});
