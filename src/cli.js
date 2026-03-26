/** @format */

"use strict";

const inquirer = require("inquirer");
const chalk = require("chalk");
const gradient = require("gradient-string");
const { generate } = require("./generator");
const { version } = require("../package.json");

async function run() {
  const BOX_WIDTH = 38;

  function centerText(text, width) {
    const len = text.length;
    if (len >= width) return text;

    const leftPadding = Math.floor((width - len) / 2);
    const rightPadding = width - len - leftPadding;

    return " ".repeat(leftPadding) + text + " ".repeat(rightPadding);
  }

  const content = `Boilernode CLI v${version}`;

  console.log(
    "\n" +
      gradient.pastel.multiline("╔" + "═".repeat(BOX_WIDTH) + "╗") +
      "\n" +
      gradient.pastel.multiline(`║${centerText(content, BOX_WIDTH)}║`) +
      "\n" +
      gradient.pastel.multiline("╚" + "═".repeat(BOX_WIDTH) + "╝") +
      "\n"
  );

  console.log(chalk.gray("  Production-ready Express backend scaffolder"));
  console.log(
    chalk.gray("  Usage: ") + chalk.cyan("npx boilernode-cli") + "\n"
  );

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "Project name:",
      default: "my-backend-app",
      validate: (v) => (v.trim() ? true : "Project name cannot be empty"),
    },
    {
      type: "list",
      name: "language",
      message: "Select language:",
      choices: [
        { name: "TypeScript  (recommended)", value: "typescript" },
        { name: "JavaScript  (ESM / ES Modules)", value: "javascript" },
      ],
    },
    {
      type: "list",
      name: "architecture",
      message: "Select architecture:",
      choices: [
        { name: "MVC  (modules/auth, modules/todo …)", value: "mvc" },
        { name: "Mono (controllers/, services/, routes/ …)", value: "mono" },
      ],
    },
    {
      type: "list",
      name: "database",
      message: "Select Database:",
      choices: [
        { name: "MongoDB   (Mongoose)", value: "mongoose" },
        { name: "PostgreSQL (DrizzleORM)", value: "drizzle" },
        { name: "PostgreSQL (PrismaORM)", value: "prisma" },
      ],
    },
    {
      type: "list",
      name: "auth",
      message: "Auth System:",
      choices: [
        { name: "JWT", value: "jwt" },
        { name: "JWT + Refresh Token", value: "jwt-refresh" },
        { name: "None", value: "none" },
      ],
    },
    {
      type: "confirm",
      name: "fileUpload",
      message: "Add File Upload Support?",
      default: false,
    },
    {
      type: "list",
      name: "storageProvider",
      message: "Select Storage Provider:",
      choices: [
        { name: "AWS S3", value: "s3" },
        { name: "Cloudinary", value: "cloudinary" },
      ],
      when: (a) => a.fileUpload,
    },
    {
      type: "list",
      name: "realtimeSupport",
      message: "Realtime Support:",
      choices: [
        { name: "Socket.io", value: "socketio" },
        { name: "None", value: "none" },
      ],
    },
    {
      type: "list",
      name: "apiDocs",
      message: "API Docs:",
      choices: [
        { name: "Swagger / OpenAPI", value: "swagger" },
        { name: "None", value: "none" },
      ],
    },
    {
      type: "list",
      name: "validation",
      message: "Validation Library:",
      choices: [
        { name: "Zod", value: "zod" },
        { name: "Joi", value: "joi" },
        { name: "None", value: "none" },
      ],
    },
    {
      type: "list",
      name: "emailService",
      message: "Email Service:",
      choices: [
        { name: "Nodemailer (SMTP)", value: "nodemailer" },
        { name: "SendGrid", value: "sendgrid" },
        { name: "None", value: "none" },
      ],
    },
    {
      type: "confirm",
      name: "redisSupport",
      message: "Add Redis Support?",
      default: false,
    },
    {
      type: "confirm",
      name: "installDeps",
      message: "Install dependencies automatically?",
      default: true,
    },
  ]);

  try {
    await generate(answers);
  } catch (error) {
    console.error(chalk.red("\n❌ Generation failed!"));
    console.error(chalk.gray(error.message));
    process.exit(1);
  }
}

module.exports = { run };
