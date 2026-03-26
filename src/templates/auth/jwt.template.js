/** @format */

"use strict";

function jwtAuthTemplate(cfg) {
  const isTS = cfg.language === "typescript";
  const hasRefresh = cfg.auth === "jwt-refresh";
  const hasMongoose = cfg.database === "mongoose";
  const hasPrisma = cfg.database === "prisma";
  const hasDrizzle = cfg.database === "drizzle";
  const useZod = cfg.validation === "zod";
  const useJoi = cfg.validation === "joi";
  const isMVC = cfg.architecture === "mvc";
  const hasSwagger = cfg.apiDocs === "swagger";

  // Extension suffix for relative imports (only JS ESM needs .js)
  const x = isTS ? "" : ".js";

  const prefix = isMVC ? "../../" : "../";
  const serviceImport = isMVC
    ? `./auth.service${x}`
    : `../services/auth.service${x}`;
  const controllerImport = isMVC
    ? `./auth.controller${x}`
    : `../controllers/auth.controller${x}`;
  const validatorImport = isMVC
    ? `./auth.validator${x}`
    : `../validators/auth.validator${x}`;
  const modelImport = isMVC
    ? `./user.model${x}`
    : `../models/user.model${x}`;

  // ─── User Model (Mongoose) ───────────────────────────────────────────────
  const userModel = isTS
    ? `import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
  ${hasRefresh ? "refreshToken?: string;" : ""}
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    isEmailVerified: { type: Boolean, default: false },
    ${hasRefresh ? "refreshToken: { type: String, select: false }," : ""}
  },
  { timestamps: true },
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
`
    : `import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    isEmailVerified: { type: Boolean, default: false },
    ${hasRefresh ? "refreshToken: { type: String, select: false }," : ""}
  },
  { timestamps: true },
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
`;

  // ─── Auth Service ────────────────────────────────────────────────────────
  const _jwtImport = isTS ? `import jwt from 'jsonwebtoken';` : `import jwt from 'jsonwebtoken';`;
  const _envImport = isTS
    ? `import { env } from '${prefix}config/env.config';`
    : `import { env } from '${prefix}config/env.config${x}';`;
  const _appErrImport = isTS
    ? `import { AppError } from '${prefix}middlewares/errorHandler.middleware';`
    : `import { AppError } from '${prefix}middlewares/errorHandler.middleware${x}';`;

  const _userImport = isTS
    ? hasMongoose
      ? `import { User } from '${modelImport}';`
      : hasPrisma
        ? `import { prisma } from '${prefix}config/db.config';`
        : `import { db } from '${prefix}config/db.config';\nimport { users } from '${prefix}db/schema';`
    : hasMongoose
      ? `import { User } from '${modelImport}';`
      : hasPrisma
        ? `import { prisma } from '${prefix}config/db.config${x}';`
        : `import { db } from '${prefix}config/db.config${x}';\nimport { users } from '${prefix}db/schema${x}';`;

  const _bcryptImport = isTS
    ? !hasMongoose ? `import bcrypt from 'bcryptjs';\n` : ""
    : !hasMongoose ? `import bcrypt from 'bcryptjs';\n` : "";

  const _drizzleEq = hasDrizzle
    ? isTS
      ? `import { eq } from 'drizzle-orm';\n`
      : `import { eq } from 'drizzle-orm';\n`
    : "";

  // Register logic per DB
  const registerLogic = hasMongoose
    ? `const existing = await User.findOne({ email });
  if (existing) throw new AppError('Email already in use', 409);
  const user = await User.create({ name, email, password });
  const accessToken = generateAccessToken({ userId: user.id, email: user.email });
  ${hasRefresh ? `const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });\n  user.refreshToken = refreshToken;\n  await user.save();\n  return { user: { id: user.id, name: user.name, email: user.email }, accessToken, refreshToken };` : `return { user: { id: user.id, name: user.name, email: user.email }, accessToken };`}`
    : hasPrisma
      ? `const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError('Email already in use', 409);
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { name, email, password: hashedPassword } });
  const accessToken = generateAccessToken({ userId: user.id, email: user.email });
  ${hasRefresh ? `const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });\n  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });\n  return { user: { id: user.id, name: user.name, email: user.email }, accessToken, refreshToken };` : `return { user: { id: user.id, name: user.name, email: user.email }, accessToken };`}`
      : `const existing = (await db.select().from(users).where(eq(users.email, email)))[0];
  if (existing) throw new AppError('Email already in use', 409);
  const hashedPassword = await bcrypt.hash(password, 12);
  const [user] = await db.insert(users).values({ name, email, password: hashedPassword }).returning();
  const accessToken = generateAccessToken({ userId: user.id, email: user.email });
  ${hasRefresh ? `const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });\n  await db.update(users).set({ refreshToken }).where(eq(users.id, user.id));\n  return { user: { id: user.id, name: user.name, email: user.email }, accessToken, refreshToken };` : `return { user: { id: user.id, name: user.name, email: user.email }, accessToken };`}`;

  const loginLogic = hasMongoose
    ? `const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }
  const accessToken = generateAccessToken({ userId: user.id, email: user.email });
  ${hasRefresh ? `const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });\n  user.refreshToken = refreshToken;\n  await user.save();\n  return { user: { id: user.id, name: user.name, email: user.email }, accessToken, refreshToken };` : `return { user: { id: user.id, name: user.name, email: user.email }, accessToken };`}`
    : hasPrisma
      ? `const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid email or password', 401);
  }
  const accessToken = generateAccessToken({ userId: user.id, email: user.email });
  ${hasRefresh ? `const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });\n  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });\n  return { user: { id: user.id, name: user.name, email: user.email }, accessToken, refreshToken };` : `return { user: { id: user.id, name: user.name, email: user.email }, accessToken };`}`
      : `const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid email or password', 401);
  }
  const accessToken = generateAccessToken({ userId: user.id, email: user.email });
  ${hasRefresh ? `const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });\n  await db.update(users).set({ refreshToken }).where(eq(users.id, user.id));\n  return { user: { id: user.id, name: user.name, email: user.email }, accessToken, refreshToken };` : `return { user: { id: user.id, name: user.name, email: user.email }, accessToken };`}`;

  const authService = isTS
    ? `${_jwtImport}
${_bcryptImport}${_envImport}
${_appErrImport}
${_userImport}
${_drizzleEq}

interface TokenPayload {
  userId: string;
  email: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);
}

${
  hasRefresh
    ? `export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions);
}
`
    : ""
}

export async function registerUser(name: string, email: string, password: string) {
  ${registerLogic}
}

export async function loginUser(email: string, password: string) {
  ${loginLogic}
}
`
    : `${_jwtImport}
${_bcryptImport}${_envImport}
${_appErrImport}
${_userImport}
${_drizzleEq}

export function generateAccessToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

${
  hasRefresh
    ? `export function generateRefreshToken(payload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });
}
`
    : ""
}

export async function registerUser(name, email, password) {
  ${registerLogic}
}

export async function loginUser(email, password) {
  ${loginLogic}
}
`;

  // ─── Auth Middleware ─────────────────────────────────────────────────────
  const authMiddleware = isTS
    ? `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.config';
import { AppError } from './errorHandler.middleware';

export interface AuthRequest extends Request {
  user?: { userId: string; email: string };
}

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('Unauthorized: No token provided', 401));
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; email: string };
    req.user = decoded;
    next();
  } catch {
    next(new AppError('Unauthorized: Invalid or expired token', 401));
  }
}
`
    : `import jwt from 'jsonwebtoken';
import { env } from '../config/env.config.js';
import { AppError } from './errorHandler.middleware.js';

export function authenticate(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('Unauthorized: No token provided', 401));
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    next(new AppError('Unauthorized: Invalid or expired token', 401));
  }
}
`;

  // ─── Auth Controller ─────────────────────────────────────────────────────
  const authController = isTS
    ? `import { Response, NextFunction } from 'express';
import { AuthRequest } from '${prefix}middlewares/auth.middleware';
import { registerUser, loginUser } from '${serviceImport}';
import { sendSuccess, sendCreated } from '${prefix}utils/response.util';

export async function register(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password } = req.body as { name: string; email: string; password: string };
    const result = await registerUser(name, email, password);
    sendCreated(res, 'Registration successful', result);
  } catch (error) {
    next(error);
  }
}

export async function login(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const result = await loginUser(email, password);
    sendSuccess(res, 'Login successful', result);
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    sendSuccess(res, 'Profile fetched', req.user);
  } catch (error) {
    next(error);
  }
}
`
    : `import { registerUser, loginUser } from '${serviceImport}';
import { sendSuccess, sendCreated } from '${prefix}utils/response.util${x}';

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const result = await registerUser(name, email, password);
    sendCreated(res, 'Registration successful', result);
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    sendSuccess(res, 'Login successful', result);
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    sendSuccess(res, 'Profile fetched', req.user);
  } catch (error) {
    next(error);
  }
}
`;

  // ─── Auth Route ──────────────────────────────────────────────────────────
  const authRoute = isTS
    ? `import { Router } from 'express';
import { register, login, getMe } from '${controllerImport}';
import { authenticate } from '${prefix}middlewares/auth.middleware';
import { validate } from '${prefix}middlewares/validate.middleware';
import { registerSchema, loginSchema } from '${validatorImport}';

const router = Router();
${hasSwagger ? `
/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 */` : ''}
router.post('/register', validate(registerSchema), register);
${hasSwagger ? `
/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 */` : ''}
router.post('/login', validate(loginSchema), login);
${hasSwagger ? `
/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */` : ''}
router.get('/me', authenticate, getMe);

export default router;
`
    : `import { Router } from 'express';
import { register, login, getMe } from '${controllerImport}';
import { authenticate } from '${prefix}middlewares/auth.middleware${x}';
import { validate } from '${prefix}middlewares/validate.middleware${x}';
import { registerSchema, loginSchema } from '${validatorImport}';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', authenticate, getMe);

export default router;
`;

  // ─── Auth Validator ──────────────────────────────────────────────────────
  let authValidator = "";
  if (useZod) {
    authValidator = isTS
      ? `import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
`
      : `import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});
`;
  } else if (useJoi) {
    authValidator = isTS
      ? `import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
`
      : `import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
`;
  } else {
    authValidator = isTS
      ? `// No validation library selected — add your own validation logic here
export const registerSchema = null;
export const loginSchema = null;
`
      : `// No validation library selected — add your own validation logic here
export const registerSchema = null;
export const loginSchema = null;
`;
  }

  return {
    userModel,
    authService,
    authMiddleware,
    authController,
    authRoute,
    authValidator,
  };
}

module.exports = { jwtAuthTemplate };
