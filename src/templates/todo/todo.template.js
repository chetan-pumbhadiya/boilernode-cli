/** @format */

"use strict";

function todoTemplate(cfg) {
  const isTS = cfg.language === "typescript";
  const hasMongoose = cfg.database === "mongoose";
  const hasPrisma = cfg.database === "prisma";
  const hasDrizzle = cfg.database === "drizzle";
  const useZod = cfg.validation === "zod";
  const useJoi = cfg.validation === "joi";
  const isMVC = cfg.architecture === "mvc";
  const hasAuth = cfg.auth !== "none";
  const hasSwagger = cfg.apiDocs === "swagger";

  // Extension suffix for relative imports (only JS ESM needs .js)
  const x = isTS ? "" : ".js";

  const prefix = isMVC ? "../../" : "../";
  const serviceImport = isMVC
    ? `./todo.service${x}`
    : `../services/todo.service${x}`;
  const controllerImport = isMVC
    ? `./todo.controller${x}`
    : `../controllers/todo.controller${x}`;
  const validatorImport = isMVC
    ? `./todo.validator${x}`
    : `../validators/todo.validator${x}`;
  const modelImport = isMVC
    ? `./todo.model${x}`
    : `../models/todo.model${x}`;

  // ─── Todo Model (Mongoose only) ──────────────────────────────────────────
  const todoModel = hasMongoose
    ? isTS
      ? `import mongoose, { Document, Schema } from 'mongoose';

export interface ITodo extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  isCompleted: boolean;
}

const todoSchema = new Schema<ITodo>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 255 },
    description: { type: String, trim: true },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Todo = mongoose.model<ITodo>('Todo', todoSchema);
`
      : `import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 255 },
    description: { type: String, trim: true },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Todo = mongoose.model('Todo', todoSchema);
`
    : null;

  // ─── Todo Service ────────────────────────────────────────────────────────
  const _dbImport = isTS
    ? hasMongoose
      ? `import { Todo } from '${modelImport}';`
      : hasPrisma
        ? `import { prisma } from '${prefix}config/db.config';`
        : `import { db } from '${prefix}config/db.config';\nimport { todos } from '${prefix}db/schema';\nimport { eq, and } from 'drizzle-orm';`
    : hasMongoose
      ? `import { Todo } from '${modelImport}';`
      : hasPrisma
        ? `import { prisma } from '${prefix}config/db.config${x}';`
        : `import { db } from '${prefix}config/db.config${x}';\nimport { todos } from '${prefix}db/schema${x}';\nimport { eq, and } from 'drizzle-orm';`;

  const _appErrImport = isTS
    ? `import { AppError } from '${prefix}middlewares/errorHandler.middleware';`
    : `import { AppError } from '${prefix}middlewares/errorHandler.middleware${x}';`;

  // createTodo
  const createLogic = hasMongoose
    ? `return Todo.create({ userId, title, description });`
    : hasPrisma
      ? `return prisma.todo.create({ data: { userId, title, description: description ?? null } });`
      : `const [todo] = await db.insert(todos).values({ userId, title, description: description ?? null }).returning();\n  return todo;`;

  // getTodos
  const getListLogic = hasMongoose
    ? `const [items, total] = await Promise.all([\n    Todo.find({ userId }).skip(skip).limit(limit).sort({ createdAt: -1 }),\n    Todo.countDocuments({ userId }),\n  ]);\n  return { items, total };`
    : hasPrisma
      ? `const [items, total] = await Promise.all([\n    prisma.todo.findMany({ where: { userId }, skip, take: limit, orderBy: { createdAt: 'desc' } }),\n    prisma.todo.count({ where: { userId } }),\n  ]);\n  return { items, total };`
      : `const items = await db.select().from(todos).where(eq(todos.userId, userId)).limit(limit).offset(skip);\n  const [{ count }] = await db.select({ count: db.fn ? db.fn.count() : todos.id }).from(todos).where(eq(todos.userId, userId));\n  return { items, total: Number(count ?? items.length) };`;

  // getById
  const getByIdLogic = hasMongoose
    ? `const todo = await Todo.findOne({ _id: id, userId });`
    : hasPrisma
      ? `const todo = await prisma.todo.findFirst({ where: { id, userId } });`
      : `const [todo] = await db.select().from(todos).where(and(eq(todos.id, id), eq(todos.userId, userId)));`;

  // updateTodo
  const updateLogic = hasMongoose
    ? `const todo = await Todo.findOneAndUpdate({ _id: id, userId }, data, { new: true, runValidators: true });\n  if (!todo) throw new AppError('Todo not found', 404);\n  return todo;`
    : hasPrisma
      ? `await getTodoById(id, userId);\n  return prisma.todo.update({ where: { id }, data });`
      : `await getTodoById(id, userId);\n  const [updated] = await db.update(todos).set({ ...data, updatedAt: new Date() }).where(and(eq(todos.id, id), eq(todos.userId, userId))).returning();\n  return updated;`;

  // deleteTodo
  const deleteLogic = hasMongoose
    ? `const todo = await Todo.findOneAndDelete({ _id: id, userId });\n  if (!todo) throw new AppError('Todo not found', 404);`
    : hasPrisma
      ? `await getTodoById(id, userId);\n  await prisma.todo.delete({ where: { id } });`
      : `await getTodoById(id, userId);\n  await db.delete(todos).where(and(eq(todos.id, id), eq(todos.userId, userId)));`;

  const todoService = isTS
    ? `${_dbImport}
${_appErrImport}

export async function createTodo(userId: string, title: string, description?: string) {
  ${createLogic}
}

export async function getTodos(userId: string, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  ${getListLogic}
}

export async function getTodoById(id: string, userId: string) {
  ${getByIdLogic}
  if (!todo) throw new AppError('Todo not found', 404);
  return todo;
}

export async function updateTodo(
  id: string,
  userId: string,
  data: Partial<{ title: string; description: string; isCompleted: boolean }>,
) {
  ${updateLogic}
}

export async function deleteTodo(id: string, userId: string) {
  ${deleteLogic}
}
`
    : `${_dbImport}
${_appErrImport}

export async function createTodo(userId, title, description) {
  ${createLogic}
}

export async function getTodos(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  ${getListLogic}
}

export async function getTodoById(id, userId) {
  ${getByIdLogic}
  if (!todo) throw new AppError('Todo not found', 404);
  return todo;
}

export async function updateTodo(id, userId, data) {
  ${updateLogic}
}

export async function deleteTodo(id, userId) {
  ${deleteLogic}
}
`;

  // ─── Todo Validator ──────────────────────────────────────────────────────
  let todoValidator = "";
  if (useZod) {
    todoValidator = isTS
      ? `import { z } from 'zod';

export const createTodoSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
  }),
});

export const updateTodoSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).optional(),
    isCompleted: z.boolean().optional(),
  }),
  params: z.object({ id: z.string().min(1) }),
});
`
      : `import { z } from 'zod';

export const createTodoSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
  }),
});

export const updateTodoSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).optional(),
    isCompleted: z.boolean().optional(),
  }),
  params: z.object({ id: z.string().min(1) }),
});
`;
  } else if (useJoi) {
    todoValidator = isTS
      ? `import Joi from 'joi';

export const createTodoSchema = Joi.object({
  body: Joi.object({
    title: Joi.string().min(1).max(255).required(),
    description: Joi.string().max(1000).optional(),
  }),
});

export const updateTodoSchema = Joi.object({
  body: Joi.object({
    title: Joi.string().min(1).max(255).optional(),
    description: Joi.string().max(1000).optional(),
    isCompleted: Joi.boolean().optional(),
  }),
  params: Joi.object({ id: Joi.string().required() }),
});
`
      : `import Joi from 'joi';

export const createTodoSchema = Joi.object({
  body: Joi.object({
    title: Joi.string().min(1).max(255).required(),
    description: Joi.string().max(1000).optional(),
  }),
});

export const updateTodoSchema = Joi.object({
  body: Joi.object({
    title: Joi.string().min(1).max(255).optional(),
    description: Joi.string().max(1000).optional(),
    isCompleted: Joi.boolean().optional(),
  }),
  params: Joi.object({ id: Joi.string().required() }),
});
`;
  } else {
    todoValidator = isTS
      ? `// No validation library selected — add your own validation logic here
export const createTodoSchema = null;
export const updateTodoSchema = null;
`
      : `// No validation library selected — add your own validation logic here
export const createTodoSchema = null;
export const updateTodoSchema = null;
`;
  }

  // ─── Todo Controller ─────────────────────────────────────────────────────
  // FIX: when auth is "none", use req.body.userId instead of req.user.userId
  const getUserId = (source) => {
    if (hasAuth) return `req.user${isTS ? "!" : ""}.userId`;
    if (source === "body") return `req.body.userId || 'anonymous'`;
    return `(req.query.userId || 'anonymous')`;
  };

  const todoController = isTS
    ? `import { ${hasAuth ? "Response" : "Request, Response"}, NextFunction } from 'express';
${hasAuth ? `import { AuthRequest } from '${prefix}middlewares/auth.middleware';\n` : ""}import { createTodo, getTodos, getTodoById, updateTodo, deleteTodo } from '${serviceImport}';
import { sendSuccess, sendCreated, sendPaginated } from '${prefix}utils/response.util';

type Req = ${hasAuth ? "AuthRequest" : "Request"};

export async function create(req: Req, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, description } = req.body as { title: string; description?: string };
    const userId = ${getUserId("body")};
    const todo = await createTodo(userId, title, description);
    sendCreated(res, 'Todo created successfully', todo);
  } catch (e) { next(e); }
}

export async function getAll(req: Req, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = ${getUserId("query")};
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const { items, total } = await getTodos(userId, page, limit);
    sendPaginated(res, 'Todos fetched', items, total, page, limit);
  } catch (e) { next(e); }
}

export async function getOne(req: Req, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = ${getUserId("query")};
    const todo = await getTodoById(req.params.id, userId);
    sendSuccess(res, 'Todo fetched', todo);
  } catch (e) { next(e); }
}

export async function update(req: Req, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = ${getUserId("body")};
    const data = req.body as Partial<{ title: string; description: string; isCompleted: boolean }>;
    const todo = await updateTodo(req.params.id, userId, data);
    sendSuccess(res, 'Todo updated', todo);
  } catch (e) { next(e); }
}

export async function remove(req: Req, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = ${getUserId("query")};
    await deleteTodo(req.params.id, userId);
    sendSuccess(res, 'Todo deleted');
  } catch (e) { next(e); }
}
`
    : `import { createTodo, getTodos, getTodoById, updateTodo, deleteTodo } from '${serviceImport}';
import { sendSuccess, sendCreated, sendPaginated } from '${prefix}utils/response.util${x}';

export async function create(req, res, next) {
  try {
    const userId = ${getUserId("body")};
    const todo = await createTodo(userId, req.body.title, req.body.description);
    sendCreated(res, 'Todo created successfully', todo);
  } catch (e) { next(e); }
}

export async function getAll(req, res, next) {
  try {
    const userId = ${getUserId("query")};
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { items, total } = await getTodos(userId, page, limit);
    sendPaginated(res, 'Todos fetched', items, total, page, limit);
  } catch (e) { next(e); }
}

export async function getOne(req, res, next) {
  try {
    const userId = ${getUserId("query")};
    sendSuccess(res, 'Todo fetched', await getTodoById(req.params.id, userId));
  } catch (e) { next(e); }
}

export async function update(req, res, next) {
  try {
    const userId = ${getUserId("body")};
    sendSuccess(res, 'Todo updated', await updateTodo(req.params.id, userId, req.body));
  } catch (e) { next(e); }
}

export async function remove(req, res, next) {
  try {
    const userId = ${getUserId("query")};
    await deleteTodo(req.params.id, userId);
    sendSuccess(res, 'Todo deleted');
  } catch (e) { next(e); }
}
`;

  // ─── Todo Route ──────────────────────────────────────────────────────────
  const hasValidation = useZod || useJoi;

  const todoRoute = isTS
    ? `import { Router } from 'express';
import { create, getAll, getOne, update, remove } from '${controllerImport}';
${hasAuth ? `import { authenticate } from '${prefix}middlewares/auth.middleware';\n` : ""}${hasValidation ? `import { validate } from '${prefix}middlewares/validate.middleware';\nimport { createTodoSchema, updateTodoSchema } from '${validatorImport}';\n` : ""}
const router = Router();
${hasAuth ? "\nrouter.use(authenticate);\n" : ""}
${hasSwagger ? `/**
 * @swagger
 * /api/v1/todos:
 *   post:
 *     summary: Create a new todo
 *     tags: [Todos]
 */
` : ''}router.post('/', ${hasValidation ? "validate(createTodoSchema), " : ""}create);

${hasSwagger ? `/**
 * @swagger
 * /api/v1/todos:
 *   get:
 *     summary: Get all todos
 *     tags: [Todos]
 */
` : ''}router.get('/', getAll);

${hasSwagger ? `/**
 * @swagger
 * /api/v1/todos/{id}:
 *   get:
 *     summary: Get a todo by ID
 *     tags: [Todos]
 */
` : ''}router.get('/:id', getOne);

${hasSwagger ? `/**
 * @swagger
 * /api/v1/todos/{id}:
 *   put:
 *     summary: Update a todo by ID
 *     tags: [Todos]
 */
` : ''}router.put('/:id', ${hasValidation ? "validate(updateTodoSchema), " : ""}update);

${hasSwagger ? `/**
 * @swagger
 * /api/v1/todos/{id}:
 *   delete:
 *     summary: Delete a todo by ID
 *     tags: [Todos]
 */
` : ''}router.delete('/:id', remove);

export default router;
`
    : `import { Router } from 'express';
import { create, getAll, getOne, update, remove } from '${controllerImport}';
${hasAuth ? `import { authenticate } from '${prefix}middlewares/auth.middleware${x}';\n` : ""}${hasValidation ? `import { validate } from '${prefix}middlewares/validate.middleware${x}';\nimport { createTodoSchema, updateTodoSchema } from '${validatorImport}';\n` : ""}
const router = Router();
${hasAuth ? "\nrouter.use(authenticate);\n" : ""}
router.post('/', ${hasValidation ? "validate(createTodoSchema), " : ""}create);
router.get('/', getAll);
router.get('/:id', getOne);
router.put('/:id', ${hasValidation ? "validate(updateTodoSchema), " : ""}update);
router.delete('/:id', remove);

export default router;
`;

  return { todoModel, todoService, todoValidator, todoController, todoRoute };
}

module.exports = { todoTemplate };
