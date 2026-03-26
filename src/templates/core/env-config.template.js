/** @format */

"use strict";

function envConfigTemplate(cfg) {
  const isTS = cfg.language === "typescript";
  const hasMongoose = cfg.database === "mongoose";
  const hasDrizzleOrPrisma =
    cfg.database === "drizzle" || cfg.database === "prisma";
  const hasS3 = cfg.storageProvider === "s3";
  const hasCloudinary = cfg.storageProvider === "cloudinary";
  const hasSendGrid = cfg.emailService === "sendgrid";
  const hasNodemailer = cfg.emailService === "nodemailer";
  const hasJwt = cfg.auth === "jwt" || cfg.auth === "jwt-refresh";
  const hasRefresh = cfg.auth === "jwt-refresh";

  if (isTS) {
    return `import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
${hasMongoose ? "  MONGODB_URI: string;\n" : ""}${hasDrizzleOrPrisma ? "  DATABASE_URL: string;\n" : ""}${hasJwt ? "  JWT_SECRET: string;\n  JWT_EXPIRES_IN: string;\n" : ""}${hasRefresh ? "  JWT_REFRESH_SECRET: string;\n  JWT_REFRESH_EXPIRES_IN: string;\n" : ""}${hasS3 ? "  AWS_ACCESS_KEY_ID: string;\n  AWS_SECRET_ACCESS_KEY: string;\n  AWS_REGION: string;\n  AWS_S3_BUCKET: string;\n" : ""}${hasCloudinary ? "  CLOUDINARY_CLOUD_NAME: string;\n  CLOUDINARY_API_KEY: string;\n  CLOUDINARY_API_SECRET: string;\n" : ""}${hasSendGrid ? "  SENDGRID_API_KEY: string;\n  SENDGRID_FROM_EMAIL: string;\n  SENDGRID_FROM_NAME: string;\n" : ""}${hasNodemailer ? "  SMTP_HOST: string;\n  SMTP_PORT: number;\n  SMTP_SECURE: boolean;\n  SMTP_USER: string;\n  SMTP_PASS: string;\n  SMTP_FROM_EMAIL: string;\n  SMTP_FROM_NAME: string;\n" : ""}${cfg.redisSupport ? "  REDIS_HOST: string;\n  REDIS_PORT: number;\n  REDIS_PASSWORD?: string;\n" : ""}  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX: number;
  CORS_ORIGIN: string;
  LOG_LEVEL: string;
}

function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(\`Missing required environment variable: \${key}\`);
  }
  return value;
}

export const env: EnvConfig = {
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  PORT: parseInt(getEnv('PORT', '5000'), 10),
${hasMongoose ? "  MONGODB_URI: getEnv('MONGODB_URI'),\n" : ""}${hasDrizzleOrPrisma ? "  DATABASE_URL: getEnv('DATABASE_URL'),\n" : ""}${hasJwt ? "  JWT_SECRET: getEnv('JWT_SECRET'),\n  JWT_EXPIRES_IN: getEnv('JWT_EXPIRES_IN', '7d'),\n" : ""}${hasRefresh ? "  JWT_REFRESH_SECRET: getEnv('JWT_REFRESH_SECRET'),\n  JWT_REFRESH_EXPIRES_IN: getEnv('JWT_REFRESH_EXPIRES_IN', '30d'),\n" : ""}${hasS3 ? "  AWS_ACCESS_KEY_ID: getEnv('AWS_ACCESS_KEY_ID'),\n  AWS_SECRET_ACCESS_KEY: getEnv('AWS_SECRET_ACCESS_KEY'),\n  AWS_REGION: getEnv('AWS_REGION', 'us-east-1'),\n  AWS_S3_BUCKET: getEnv('AWS_S3_BUCKET'),\n" : ""}${hasCloudinary ? "  CLOUDINARY_CLOUD_NAME: getEnv('CLOUDINARY_CLOUD_NAME'),\n  CLOUDINARY_API_KEY: getEnv('CLOUDINARY_API_KEY'),\n  CLOUDINARY_API_SECRET: getEnv('CLOUDINARY_API_SECRET'),\n" : ""}${hasSendGrid ? "  SENDGRID_API_KEY: getEnv('SENDGRID_API_KEY'),\n  SENDGRID_FROM_EMAIL: getEnv('SENDGRID_FROM_EMAIL'),\n  SENDGRID_FROM_NAME: getEnv('SENDGRID_FROM_NAME'),\n" : ""}${hasNodemailer ? "  SMTP_HOST: getEnv('SMTP_HOST'),\n  SMTP_PORT: parseInt(getEnv('SMTP_PORT', '587'), 10),\n  SMTP_SECURE: getEnv('SMTP_SECURE', 'false') === 'true',\n  SMTP_USER: getEnv('SMTP_USER'),\n  SMTP_PASS: getEnv('SMTP_PASS'),\n  SMTP_FROM_EMAIL: getEnv('SMTP_FROM_EMAIL'),\n  SMTP_FROM_NAME: getEnv('SMTP_FROM_NAME'),\n" : ""}${cfg.redisSupport ? "  REDIS_HOST: getEnv('REDIS_HOST', '127.0.0.1'),\n  REDIS_PORT: parseInt(getEnv('REDIS_PORT', '6379'), 10),\n  REDIS_PASSWORD: getEnv('REDIS_PASSWORD', ''),\n" : ""}  RATE_LIMIT_WINDOW_MS: parseInt(getEnv('RATE_LIMIT_WINDOW_MS', '900000'), 10),
  RATE_LIMIT_MAX: parseInt(getEnv('RATE_LIMIT_MAX', '100'), 10),
  CORS_ORIGIN: getEnv('CORS_ORIGIN', 'http://localhost:3000'),
  LOG_LEVEL: getEnv('LOG_LEVEL', 'info'),
};
`;
  }

  // JavaScript — ESM
  return `import dotenv from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(process.cwd(), '.env') });

function getEnv(key, fallback) {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(\`Missing required environment variable: \${key}\`);
  }
  return value;
}

export const env = {
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  PORT: parseInt(getEnv('PORT', '5000'), 10),
${hasMongoose ? "  MONGODB_URI: getEnv('MONGODB_URI'),\n" : ""}${hasDrizzleOrPrisma ? "  DATABASE_URL: getEnv('DATABASE_URL'),\n" : ""}${hasJwt ? "  JWT_SECRET: getEnv('JWT_SECRET'),\n  JWT_EXPIRES_IN: getEnv('JWT_EXPIRES_IN', '7d'),\n" : ""}${hasRefresh ? "  JWT_REFRESH_SECRET: getEnv('JWT_REFRESH_SECRET'),\n  JWT_REFRESH_EXPIRES_IN: getEnv('JWT_REFRESH_EXPIRES_IN', '30d'),\n" : ""}${hasS3 ? "  AWS_ACCESS_KEY_ID: getEnv('AWS_ACCESS_KEY_ID'),\n  AWS_SECRET_ACCESS_KEY: getEnv('AWS_SECRET_ACCESS_KEY'),\n  AWS_REGION: getEnv('AWS_REGION', 'us-east-1'),\n  AWS_S3_BUCKET: getEnv('AWS_S3_BUCKET'),\n" : ""}${hasCloudinary ? "  CLOUDINARY_CLOUD_NAME: getEnv('CLOUDINARY_CLOUD_NAME'),\n  CLOUDINARY_API_KEY: getEnv('CLOUDINARY_API_KEY'),\n  CLOUDINARY_API_SECRET: getEnv('CLOUDINARY_API_SECRET'),\n" : ""}${hasSendGrid ? "  SENDGRID_API_KEY: getEnv('SENDGRID_API_KEY'),\n  SENDGRID_FROM_EMAIL: getEnv('SENDGRID_FROM_EMAIL'),\n  SENDGRID_FROM_NAME: getEnv('SENDGRID_FROM_NAME'),\n" : ""}${hasNodemailer ? "  SMTP_HOST: getEnv('SMTP_HOST'),\n  SMTP_PORT: parseInt(getEnv('SMTP_PORT', '587'), 10),\n  SMTP_SECURE: getEnv('SMTP_SECURE', 'false') === 'true',\n  SMTP_USER: getEnv('SMTP_USER'),\n  SMTP_PASS: getEnv('SMTP_PASS'),\n  SMTP_FROM_EMAIL: getEnv('SMTP_FROM_EMAIL'),\n  SMTP_FROM_NAME: getEnv('SMTP_FROM_NAME'),\n" : ""}${cfg.redisSupport ? "  REDIS_HOST: getEnv('REDIS_HOST', '127.0.0.1'),\n  REDIS_PORT: parseInt(getEnv('REDIS_PORT', '6379'), 10),\n  REDIS_PASSWORD: getEnv('REDIS_PASSWORD', ''),\n" : ""}  RATE_LIMIT_WINDOW_MS: parseInt(getEnv('RATE_LIMIT_WINDOW_MS', '900000'), 10),
  RATE_LIMIT_MAX: parseInt(getEnv('RATE_LIMIT_MAX', '100'), 10),
  CORS_ORIGIN: getEnv('CORS_ORIGIN', 'http://localhost:3000'),
  LOG_LEVEL: getEnv('LOG_LEVEL', 'info'),
};
`;
}

module.exports = { envConfigTemplate };
