/** @format */

"use strict";

function envTemplate(cfg) {
  const hasMongoose = cfg.database === "mongoose";
  const hasDrizzleOrPrisma =
    cfg.database === "drizzle" || cfg.database === "prisma";
  const hasS3 = cfg.storageProvider === "s3";
  const hasCloudinary = cfg.storageProvider === "cloudinary";
  const hasSendGrid = cfg.emailService === "sendgrid";
  const hasNodemailer = cfg.emailService === "nodemailer";
  const hasJwt = cfg.auth === "jwt" || cfg.auth === "jwt-refresh";
  const hasRefresh = cfg.auth === "jwt-refresh";

  const dbName = cfg.projectName.toLowerCase().replace(/[^a-z0-9]/g, "_");

  return `# Application
NODE_ENV=development
PORT=5000

# ${hasMongoose ? "MongoDB" : "PostgreSQL"}
${hasMongoose ? `MONGODB_URI=mongodb://localhost:27017/${dbName}` : ""}
${hasDrizzleOrPrisma ? `DATABASE_URL=postgresql://postgres:password@localhost:5432/${dbName}` : ""}

${
  hasJwt
    ? `# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
${hasRefresh ? "JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_in_production\nJWT_REFRESH_EXPIRES_IN=30d" : ""}`
    : ""
}

${
  hasS3
    ? `# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_bucket_name`
    : ""
}

${
  hasCloudinary
    ? `# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret`
    : ""
}

${
  hasSendGrid
    ? `# SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=${cfg.projectName}`
    : ""
}

${
  hasNodemailer
    ? `# Nodemailer (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_FROM_NAME=${cfg.projectName}`
    : ""
}

${
  cfg.redisSupport
    ? `# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=`
    : ""
}

# Rate Limiter
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
`;
}

function envExampleTemplate(cfg) {
  const hasMongoose = cfg.database === "mongoose";
  const hasDrizzleOrPrisma =
    cfg.database === "drizzle" || cfg.database === "prisma";

  let example = envTemplate(cfg).replace(/=.+/gm, "=");

  if (hasMongoose) {
    example = example.replace(
      /MONGODB_URI=/,
      "MONGODB_URI=mongodb://localhost:27017/your_database",
    );
  }

  if (hasDrizzleOrPrisma) {
    example = example.replace(
      /DATABASE_URL=/,
      "DATABASE_URL=postgresql://postgres:password@localhost:5432/your_database",
    );
  }

  return example;
}

module.exports = { envTemplate, envExampleTemplate };
