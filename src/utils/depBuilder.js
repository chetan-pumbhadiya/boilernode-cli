/** @format */

"use strict";

/**
 * Builds the dependency lists for the generated project
 * based on user-selected options.
 */
function buildDeps(cfg) {
  const isTS = cfg.language === "typescript";

  const deps = [
    "express",
    "cors",
    "helmet",
    "morgan",
    "winston",
    "dotenv",
    "express-rate-limit",
    "bcryptjs",
  ];

  const devDeps = ["prettier"];

  // TypeScript
  if (isTS) {
    devDeps.push(
      "typescript",
      "ts-node",
      "ts-node-dev",
      "@types/node",
      "@types/express",
      "@types/cors",
      "@types/morgan",
      "@types/bcryptjs",
    );
  } else {
    // JS ESM — node --watch is built-in (Node 18+), no nodemon needed
    // eslint with flat config for ESM
    devDeps.push("eslint");
  }

  // Database
  if (cfg.database === "mongoose") {
    deps.push("mongoose");
  } else if (cfg.database === "drizzle") {
    deps.push("drizzle-orm", "pg");
    devDeps.push("drizzle-kit");
    if (isTS) devDeps.push("@types/pg");
  } else if (cfg.database === "prisma") {
    deps.push("@prisma/client");
    devDeps.push("prisma");
  }

  // Auth
  if (cfg.auth === "jwt" || cfg.auth === "jwt-refresh") {
    deps.push("jsonwebtoken");
    if (isTS) devDeps.push("@types/jsonwebtoken");
  }

  // File Upload
  if (cfg.fileUpload) {
    deps.push("multer");
    if (isTS) devDeps.push("@types/multer");

    if (cfg.storageProvider === "s3") {
      deps.push("@aws-sdk/client-s3", "multer-s3");
      if (isTS) devDeps.push("@types/multer-s3");
    } else if (cfg.storageProvider === "cloudinary") {
      deps.push("cloudinary", "multer-storage-cloudinary");
    }
  }

  // Swagger
  if (cfg.apiDocs === "swagger") {
    deps.push("swagger-jsdoc", "swagger-ui-express");
    if (isTS) devDeps.push("@types/swagger-jsdoc", "@types/swagger-ui-express");
  }

  // Realtime
  if (cfg.realtimeSupport === "socketio") {
    deps.push("socket.io");
  }

  // Redis
  if (cfg.redisSupport) {
    deps.push("ioredis");
  }

  // Validation
  if (cfg.validation === "zod") {
    deps.push("zod");
  } else if (cfg.validation === "joi") {
    deps.push("joi");
    // @types/joi is obsolete — Joi ships its own types since v17
  }

  // Email
  if (cfg.emailService === "nodemailer") {
    deps.push("nodemailer");
    if (isTS) devDeps.push("@types/nodemailer");
  } else if (cfg.emailService === "sendgrid") {
    deps.push("@sendgrid/mail");
  }

  return { dependencies: deps, devDependencies: devDeps };
}

module.exports = { buildDeps };
