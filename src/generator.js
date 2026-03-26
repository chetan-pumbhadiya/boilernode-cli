/** @format */

"use strict";

const path = require("path");
const fs = require("fs-extra");
const ora = require("ora");
const chalk = require("chalk");
const { execSync } = require("child_process");
const https = require("https");

// ── Template imports ─────────────────────────────────────────────────────────
const { appTemplate } = require("./templates/core/app.template");
const { serverTemplate } = require("./templates/core/server.template");
const {
  envTemplate,
  envExampleTemplate,
} = require("./templates/core/env.template");
const {
  envConfigTemplate,
} = require("./templates/core/env-config.template");
const { loggerTemplate } = require("./templates/core/logger.template");
const { corsTemplate } = require("./templates/core/cors.template");
const {
  rateLimiterTemplate,
} = require("./templates/core/rateLimiter.template");
const {
  errorHandlerTemplate,
} = require("./templates/core/errorHandler.template");
const { validateTemplate } = require("./templates/core/validate.template");
const { responseTemplate } = require("./templates/core/response.template");
const { gitignoreTemplate } = require("./templates/core/gitignore.template");
const { prettierTemplate } = require("./templates/core/prettier.template");
const { mongooseTemplate } = require("./templates/db/mongoose.template");
const { drizzleTemplate } = require("./templates/db/drizzle.template");
const { prismaTemplate } = require("./templates/db/prisma.template");
const { jwtAuthTemplate } = require("./templates/auth/jwt.template");
const { todoTemplate } = require("./templates/todo/todo.template");
const { s3Template } = require("./templates/upload/s3.template");
const {
  cloudinaryTemplate,
} = require("./templates/upload/cloudinary.template");
const {
  nodemailerTemplate,
} = require("./templates/email/nodemailer.template");
const { sendgridTemplate } = require("./templates/email/sendgrid.template");
const { swaggerTemplate } = require("./templates/docs/swagger.template");
const { socketTemplate } = require("./templates/realtime/socket.template");
const { redisTemplate } = require("./templates/redis/redis.template");
const {
  packageJsonTemplate,
} = require("./templates/package/packageJson.template");
const { tsconfigTemplate } = require("./templates/ts/tsconfig.template");
const { buildDeps } = require("./utils/depBuilder");

// ── Helpers ──────────────────────────────────────────────────────────────────
function ext(cfg) {
  return cfg.language === "typescript" ? "ts" : "js";
}

function write(filePath, content) {
  if (content === null || content === undefined) return;
  fs.ensureDirSync(path.dirname(filePath));
  fs.writeFileSync(filePath, content, "utf-8");
}

/**
 * Fetches the latest version of a package from the npm registry.
 * Handles scoped packages (e.g. @aws-sdk/client-s3) correctly.
 */
function getLatestVersion(pkg) {
  return new Promise((resolve) => {
    // Encode scoped package names: @aws-sdk/client-s3 → @aws-sdk%2Fclient-s3
    const encoded = pkg.startsWith("@")
      ? "@" + pkg.slice(1).replace("/", "%2F")
      : pkg;
    const url = `https://registry.npmjs.org/${encoded}/latest`;

    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            resolve(json.version || "latest");
          } catch {
            resolve("latest");
          }
        });
      })
      .on("error", () => resolve("latest"));
  });
}

async function generate(cfg) {
  const targetDir = path.resolve(process.cwd(), cfg.projectName);
  const e = ext(cfg);
  const isTS = cfg.language === "typescript";
  const isMVC = cfg.architecture === "mvc";

  console.log("\n" + chalk.cyan(`📁 Creating project in ${targetDir}\n`));

  const spinner = ora("Scaffolding project files...").start();

  try {
    fs.ensureDirSync(targetDir);

    // ── Path helper ──────────────────────────────────────────────────────────
    function src(...parts) {
      return path.join(targetDir, "src", ...parts);
    }

    // ── Core files ───────────────────────────────────────────────────────────
    write(path.join(targetDir, ".env"), envTemplate(cfg));
    write(path.join(targetDir, ".env.example"), envExampleTemplate(cfg));
    write(path.join(targetDir, ".gitignore"), gitignoreTemplate());
    write(path.join(targetDir, ".prettierrc"), prettierTemplate());
    write(path.join(targetDir, "package.json"), packageJsonTemplate(cfg));
    if (isTS) {
      write(path.join(targetDir, "tsconfig.json"), tsconfigTemplate());
    }

    write(src(`app.${e}`), appTemplate(cfg));
    write(src(`server.${e}`), serverTemplate(cfg));

    // ── Config ───────────────────────────────────────────────────────────────
    write(src("config", `env.config.${e}`), envConfigTemplate(cfg));
    write(src("config", `logger.config.${e}`), loggerTemplate(cfg));
    write(src("config", `cors.config.${e}`), corsTemplate(cfg));

    // ── Middlewares ──────────────────────────────────────────────────────────
    write(
      src("middlewares", `rateLimiter.middleware.${e}`),
      rateLimiterTemplate(cfg),
    );
    write(
      src("middlewares", `errorHandler.middleware.${e}`),
      errorHandlerTemplate(cfg),
    );
    write(
      src("middlewares", `validate.middleware.${e}`),
      validateTemplate(cfg),
    );

    // ── Utils ────────────────────────────────────────────────────────────────
    write(src("utils", `response.util.${e}`), responseTemplate(cfg));

    // ── Database ─────────────────────────────────────────────────────────────
    if (cfg.database === "mongoose") {
      write(src("config", `db.config.${e}`), mongooseTemplate(cfg));
    } else if (cfg.database === "drizzle") {
      const drizzle = drizzleTemplate(cfg);
      write(src("config", `db.config.${e}`), drizzle.dbConfig);
      write(src("db", `schema.${e}`), drizzle.schema);
      // FIX: drizzle.config is always .ts for TS projects, plain .js for JS
      // (drizzle-kit reads it via tsx/node, not tsc, so use the source extension)
      write(
        path.join(targetDir, `drizzle.config.${e}`),
        drizzle.drizzleConfig,
      );
    } else if (cfg.database === "prisma") {
      const prismaResult = prismaTemplate(cfg);
      write(src("config", `db.config.${e}`), prismaResult.dbConfig);
      write(
        path.join(targetDir, "prisma", "schema.prisma"),
        prismaResult.prismaSchema,
      );
    }

    // ── Auth ─────────────────────────────────────────────────────────────────
    if (cfg.auth !== "none") {
      const auth = jwtAuthTemplate(cfg);
      write(
        src("middlewares", `auth.middleware.${e}`),
        auth.authMiddleware,
      );

      if (isMVC) {
        if (cfg.database === "mongoose") {
          write(src("modules", "auth", `user.model.${e}`), auth.userModel);
        }
        write(src("modules", "auth", `auth.service.${e}`), auth.authService);
        write(
          src("modules", "auth", `auth.controller.${e}`),
          auth.authController,
        );
        write(src("modules", "auth", `auth.route.${e}`), auth.authRoute);
        write(
          src("modules", "auth", `auth.validator.${e}`),
          auth.authValidator,
        );
      } else {
        if (cfg.database === "mongoose") {
          write(src("models", `user.model.${e}`), auth.userModel);
        }
        write(src("services", `auth.service.${e}`), auth.authService);
        write(
          src("controllers", `auth.controller.${e}`),
          auth.authController,
        );
        write(src("routes", `auth.route.${e}`), auth.authRoute);
        write(src("validators", `auth.validator.${e}`), auth.authValidator);
      }
    }

    // ── Todo ─────────────────────────────────────────────────────────────────
    const todo = todoTemplate(cfg);

    if (isMVC) {
      if (cfg.database === "mongoose" && todo.todoModel) {
        write(src("modules", "todo", `todo.model.${e}`), todo.todoModel);
      }
      write(src("modules", "todo", `todo.service.${e}`), todo.todoService);
      write(
        src("modules", "todo", `todo.validator.${e}`),
        todo.todoValidator,
      );
      write(
        src("modules", "todo", `todo.controller.${e}`),
        todo.todoController,
      );
      write(src("modules", "todo", `todo.route.${e}`), todo.todoRoute);
    } else {
      if (cfg.database === "mongoose" && todo.todoModel) {
        write(src("models", `todo.model.${e}`), todo.todoModel);
      }
      write(src("services", `todo.service.${e}`), todo.todoService);
      write(src("validators", `todo.validator.${e}`), todo.todoValidator);
      write(
        src("controllers", `todo.controller.${e}`),
        todo.todoController,
      );
      write(src("routes", `todo.route.${e}`), todo.todoRoute);
    }

    // ── File Upload ──────────────────────────────────────────────────────────
    if (cfg.fileUpload) {
      if (cfg.storageProvider === "s3") {
        const s3 = s3Template(cfg);
        write(src("config", `s3.config.${e}`), s3.config);
        write(src("middlewares", `upload.middleware.${e}`), s3.middleware);
      } else if (cfg.storageProvider === "cloudinary") {
        const cld = cloudinaryTemplate(cfg);
        write(src("config", `cloudinary.config.${e}`), cld.config);
        write(src("middlewares", `upload.middleware.${e}`), cld.middleware);
      }
    }

    // ── Email ────────────────────────────────────────────────────────────────
    if (cfg.emailService === "nodemailer") {
      write(src("utils", `email.util.${e}`), nodemailerTemplate(cfg));
    } else if (cfg.emailService === "sendgrid") {
      write(src("utils", `email.util.${e}`), sendgridTemplate(cfg));
    }

    // ── API Docs ─────────────────────────────────────────────────────────────
    if (cfg.apiDocs === "swagger") {
      write(src("config", `swagger.config.${e}`), swaggerTemplate(cfg));
    }

    // ── Realtime ─────────────────────────────────────────────────────────────
    if (cfg.realtimeSupport === "socketio") {
      write(src("config", `socket.config.${e}`), socketTemplate(cfg));
    }

    // ── Redis ────────────────────────────────────────────────────────────────
    if (cfg.redisSupport) {
      write(src("config", `redis.config.${e}`), redisTemplate(cfg));
    }

    // ── logs dir placeholder ─────────────────────────────────────────────────
    fs.ensureDirSync(path.join(targetDir, "logs"));
    write(path.join(targetDir, "logs", ".gitkeep"), "");

    spinner.succeed(chalk.green("✅ Project files created successfully!"));

    // ── Resolve latest package versions ─────────────────────────────────────
    const versionSpinner = ora(
      "Resolving latest package versions...",
    ).start();
    const { dependencies, devDependencies } = buildDeps(cfg);

    try {
      const [resolvedDeps, resolvedDevDeps] = await Promise.all([
        Promise.all(
          dependencies.map(async (d) => [d, await getLatestVersion(d)]),
        ),
        Promise.all(
          devDependencies.map(async (d) => [d, await getLatestVersion(d)]),
        ),
      ]);

      const pkgPath = path.join(targetDir, "package.json");
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

      pkg.dependencies = Object.fromEntries(
        resolvedDeps.map(([d, v]) => [d, v === "latest" ? "latest" : `^${v}`]),
      );
      pkg.devDependencies = Object.fromEntries(
        resolvedDevDeps.map(([d, v]) => [
          d,
          v === "latest" ? "latest" : `^${v}`,
        ]),
      );

      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), "utf-8");
      versionSpinner.succeed(chalk.green("✅ Package versions resolved!"));
    } catch {
      versionSpinner.fail(
        chalk.yellow(
          "⚠️  Failed to resolve versions, using 'latest' fallback.",
        ),
      );
      const pkgPath = path.join(targetDir, "package.json");
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      pkg.dependencies = Object.fromEntries(
        dependencies.map((d) => [d, "latest"]),
      );
      pkg.devDependencies = Object.fromEntries(
        devDependencies.map((d) => [d, "latest"]),
      );
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), "utf-8");
    }

    // ── Install dependencies ─────────────────────────────────────────────────
    if (cfg.installDeps) {
      const installSpinner = ora(
        "Installing dependencies (this may take a minute)...",
      ).start();
      try {
        execSync("npm install", { cwd: targetDir, stdio: "ignore" });
        if (cfg.database === "prisma") {
          execSync("npx prisma generate", {
            cwd: targetDir,
            stdio: "ignore",
          });
        }
        installSpinner.succeed(chalk.green("✅ Dependencies installed!"));
      } catch {
        installSpinner.fail(
          chalk.yellow(
            "⚠️  Dependency installation failed. Run `npm install` manually.",
          ),
        );
      }
    }

    // ── Success message ──────────────────────────────────────────────────────
    const step = cfg.installDeps ? 2 : 3;

    console.log("\n" + chalk.bold.green("🎉 Your backend is ready!\n"));
    console.log(chalk.cyan("  Next steps:\n"));
    console.log(chalk.white(`  1.  cd ${cfg.projectName}`));

    if (!cfg.installDeps) {
      console.log(chalk.white("  2.  npm install"));
    }

    console.log(
      chalk.white(
        `  ${step}.  cp .env.example .env   ${chalk.gray("← fill in your values")}`,
      ),
    );

    if (cfg.database === "prisma") {
      console.log(
        chalk.white(
          `  ${step + 1}.  npx prisma migrate dev --name init`,
        ),
      );
      console.log(chalk.white(`  ${step + 2}.  npm run dev`));
    } else if (cfg.database === "drizzle") {
      console.log(
        chalk.white(`  ${step + 1}.  npm run db:push`),
      );
      console.log(chalk.white(`  ${step + 2}.  npm run dev`));
    } else {
      console.log(chalk.white(`  ${step + 1}.  npm run dev`));
    }

    if (cfg.apiDocs === "swagger") {
      console.log(
        chalk.gray("\n  📄 Swagger docs → http://localhost:5000/api-docs"),
      );
    }

    if (!isTS) {
      console.log(
        chalk.gray(
          "\n  ℹ️  Generated project uses ESM (import/export). Node ≥18 required.",
        ),
      );
    }

    console.log(chalk.gray("\n  Happy coding! 🚀\n"));
  } catch (error) {
    spinner.fail(chalk.red("❌ Generation failed!"));
    throw error;
  }
}

module.exports = { generate };
