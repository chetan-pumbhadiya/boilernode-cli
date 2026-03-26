<!-- @format -->

<div align="center">

# ⚡ boilernode-cli

**Scaffold a production-ready Express backend in under 60 seconds.**

[![npm version](https://img.shields.io/npm/v/boilernode-cli.svg?style=flat-square&color=cb3837)](https://www.npmjs.com/package/boilernode-cli)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen?style=flat-square)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

```bash
npx boilernode-cli
```

> No install. No config files. Just answer a few prompts — your backend is ready.

</div>

---

## What is this?

`boilernode-cli` generates a fully-wired, production-grade Express backend tailored to your stack. Pick your language, database, auth, and optional features — it writes every file, resolves the latest package versions, and optionally runs `npm install` for you.

**TypeScript** projects generate `.ts` files with full type safety.  
**JavaScript** projects generate native **ESM** (`import`/`export`) — no CommonJS.

---

## Quick Start

```bash
npx boilernode-cli
```

Answer the prompts, then:

```bash
cd my-app
cp .env.example .env   # fill in your secrets
npm run dev            # server starts on http://localhost:5000
```

That's it.

---

## Interactive Prompts

The CLI walks you through these choices one-by-one:

| Prompt | Choices |
|---|---|
| **Project name** | any valid name |
| **Language** | TypeScript · JavaScript (ESM) |
| **Architecture** | MVC · Mono |
| **Database** | MongoDB (Mongoose) · PostgreSQL (Drizzle) · PostgreSQL (Prisma) |
| **Auth** | JWT · JWT + Refresh Token · None |
| **File Upload** | AWS S3 · Cloudinary · None |
| **Realtime** | Socket.io · None |
| **API Docs** | Swagger / OpenAPI 3.0 · None |
| **Validation** | Zod · Joi · None |
| **Email** | Nodemailer (SMTP) · SendGrid · None |
| **Redis** | Yes · No |
| **Install deps** | Yes · No |

---

## What Gets Generated

### Always included

Every project ships with a production-ready foundation:

```
✅ Express app        — Helmet · CORS · Morgan · body-parser
✅ Error handling     — Global handler + custom AppError class
✅ Rate limiter       — Configurable window & max via .env
✅ Logger             — Winston (colorized dev · JSON prod · rotating files)
✅ Env validation     — Fails fast on missing variables at startup
✅ CORS config        — Multi-origin support from CORS_ORIGIN env var
✅ Response helpers   — sendSuccess · sendCreated · sendError · sendPaginated
✅ Graceful shutdown  — SIGTERM · uncaughtException · unhandledRejection
✅ .env + .env.example — Pre-filled for your selected stack
✅ .gitignore · .prettierrc
```

### Auth (JWT / JWT + Refresh)

- `POST /api/v1/auth/register` — register + return token
- `POST /api/v1/auth/login` — login + return token
- `GET  /api/v1/auth/me` — get current user (authenticated)
- `authenticate` middleware for protecting routes
- Bcrypt password hashing, optional refresh token rotation

### Todo API (full CRUD — always included as a working example)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/todos` | Create |
| `GET` | `/api/v1/todos?page=1&limit=10` | Paginated list |
| `GET` | `/api/v1/todos/:id` | Get one |
| `PUT` | `/api/v1/todos/:id` | Update |
| `DELETE` | `/api/v1/todos/:id` | Delete |

---

## Project Structures

<details>
<summary><strong>MVC + TypeScript</strong> (click to expand)</summary>

```
my-app/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   ├── env.config.ts
│   │   ├── logger.config.ts
│   │   ├── cors.config.ts
│   │   ├── db.config.ts
│   │   ├── swagger.config.ts     (if Swagger)
│   │   ├── socket.config.ts      (if Socket.io)
│   │   └── redis.config.ts       (if Redis)
│   ├── middlewares/
│   │   ├── errorHandler.middleware.ts
│   │   ├── rateLimiter.middleware.ts
│   │   ├── auth.middleware.ts     (if Auth)
│   │   ├── validate.middleware.ts (if Zod/Joi)
│   │   └── upload.middleware.ts   (if File Upload)
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.route.ts
│   │   │   ├── auth.validator.ts
│   │   │   └── user.model.ts      (if Mongoose)
│   │   └── todo/
│   │       ├── todo.controller.ts
│   │       ├── todo.service.ts
│   │       ├── todo.route.ts
│   │       ├── todo.validator.ts
│   │       └── todo.model.ts      (if Mongoose)
│   ├── utils/
│   │   ├── response.util.ts
│   │   └── email.util.ts          (if Email)
│   └── db/
│       └── schema.ts              (if Drizzle)
├── prisma/
│   └── schema.prisma              (if Prisma)
├── logs/
├── .env / .env.example
├── .gitignore / .prettierrc
├── package.json
├── tsconfig.json
└── drizzle.config.ts              (if Drizzle)
```

</details>

<details>
<summary><strong>Mono + JavaScript (ESM)</strong> (click to expand)</summary>

```
my-app/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   ├── env.config.js
│   │   ├── logger.config.js
│   │   ├── cors.config.js
│   │   └── db.config.js
│   ├── middlewares/
│   │   ├── errorHandler.middleware.js
│   │   ├── rateLimiter.middleware.js
│   │   └── auth.middleware.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── todo.controller.js
│   ├── services/
│   │   ├── auth.service.js
│   │   └── todo.service.js
│   ├── routes/
│   │   ├── auth.route.js
│   │   └── todo.route.js
│   ├── validators/
│   │   ├── auth.validator.js
│   │   └── todo.validator.js
│   ├── models/
│   │   ├── user.model.js          (if Mongoose)
│   │   └── todo.model.js          (if Mongoose)
│   └── utils/
│       └── response.util.js
├── .env / .env.example
├── .gitignore / .prettierrc
└── package.json                   (includes "type": "module")
```

</details>

---

## After Scaffolding

```bash
cd my-app

# 1. Install dependencies (if you chose not to auto-install)
npm install

# 2. Set your environment variables
cp .env.example .env
# → open .env and fill in your DB connection, JWT secrets, etc.

# 3. Run migrations (if applicable)
npm run db:push          # Drizzle
npx prisma migrate dev   # Prisma
# MongoDB needs no migration

# 4. Start development
npm run dev
# → http://localhost:5000
# → http://localhost:5000/api-docs  (if Swagger selected)
```

---

## Database Setup Notes

### MongoDB (Mongoose)
Set `MONGODB_URI` in your `.env`. No migration step needed — collections are created automatically.

```env
MONGODB_URI=mongodb://localhost:27017/my-app
```

### PostgreSQL + Drizzle
```bash
# Push schema to DB
npm run db:push

# Open Drizzle Studio (visual DB browser)
npm run db:studio
```

### PostgreSQL + Prisma
```bash
# Run initial migration
npx prisma migrate dev --name init

# Open Prisma Studio (visual DB browser)
npm run db:studio
```

---

## Environment Variables

The generated `.env` is pre-filled with every variable your selected stack needs. Here's a sample for a full-featured project:

```env
# App
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/my-app
# or
DATABASE_URL=postgresql://postgres:password@localhost:5432/my-app

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret      # if jwt-refresh
JWT_REFRESH_EXPIRES_IN=30d

# File Upload
AWS_ACCESS_KEY_ID=...                        # if S3
CLOUDINARY_CLOUD_NAME=...                    # if Cloudinary

# Email
SMTP_HOST=smtp.gmail.com                     # if Nodemailer
SENDGRID_API_KEY=...                         # if SendGrid

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# CORS
CORS_ORIGIN=http://localhost:3000

# Redis
REDIS_HOST=127.0.0.1                         # if Redis
REDIS_PORT=6379
```

---

## Tech Stack

| Category | Package |
|---|---|
| Framework | Express.js |
| Security | Helmet · CORS · express-rate-limit |
| Logging | Winston · Morgan |
| Auth | jsonwebtoken · bcryptjs |
| MongoDB | Mongoose |
| PostgreSQL ORM | Drizzle ORM + node-postgres |
| PostgreSQL ORM | Prisma ORM |
| File Upload (S3) | @aws-sdk/client-s3 · multer-s3 |
| File Upload (Cloud) | Cloudinary · multer-storage-cloudinary |
| Email (SMTP) | Nodemailer |
| Email (API) | @sendgrid/mail |
| API Docs | swagger-jsdoc · swagger-ui-express |
| Realtime | Socket.io |
| Validation | Zod or Joi |
| Cache / Queue | ioredis |

---

## File Naming Convention

All generated files follow consistent suffixes:

| File type | Suffix |
|---|---|
| Controller | `.controller.ts` / `.controller.js` |
| Service | `.service.ts` / `.service.js` |
| Route | `.route.ts` / `.route.js` |
| Middleware | `.middleware.ts` / `.middleware.js` |
| Model (Mongoose) | `.model.ts` / `.model.js` |
| Schema (Drizzle) | `schema.ts` / `schema.js` |
| Validator | `.validator.ts` / `.validator.js` |
| Config | `.config.ts` / `.config.js` |
| Utility | `.util.ts` / `.util.js` |

---

## Notes

- **Node.js ≥ 18** is required
- JavaScript projects use native **ESM** (`"type": "module"`) — no CommonJS
- TypeScript projects compile to CommonJS via `tsc` and run with `ts-node-dev` in development
- The `dev` script for JavaScript uses Node's built-in `--watch` flag (no extra tools needed)
- Package versions are resolved to the **latest** release at generation time

---

## License

MIT © 2026