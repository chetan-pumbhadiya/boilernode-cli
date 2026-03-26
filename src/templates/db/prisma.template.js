/** @format */

"use strict";

function prismaTemplate(cfg) {
  const isTS = cfg.language === "typescript";

  const dbConfig = isTS
    ? `import { PrismaClient } from '@prisma/client';
import { logger } from './logger.config';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' },
    ],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export async function connectDB(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('✅ PostgreSQL (Prisma) connected successfully');
  } catch (error) {
    logger.error('❌ Prisma connection failed:', error);
    process.exit(1);
  }
}
`
    : `import { PrismaClient } from '@prisma/client';
import { logger } from './logger.config.js';

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export async function connectDB() {
  try {
    await prisma.$connect();
    logger.info('✅ PostgreSQL (Prisma) connected successfully');
  } catch (error) {
    logger.error('❌ Prisma connection failed:', error);
    process.exit(1);
  }
}
`;

  const prismaSchema = `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id              String    @id @default(uuid())
  name            String
  email           String    @unique
  password        String
  isEmailVerified Boolean   @default(false)
  refreshToken    String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  todos           Todo[]

  @@map("users")
}

model Todo {
  id          String   @id @default(uuid())
  userId      String
  title       String
  description String?
  isCompleted Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("todos")
}
`;

  return { dbConfig, prismaSchema };
}

module.exports = { prismaTemplate };
