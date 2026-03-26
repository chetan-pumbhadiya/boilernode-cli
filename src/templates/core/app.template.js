/** @format */

"use strict";

/**
 * Generates src/app.ts or src/app.js
 */
function appTemplate(cfg) {
  const isTS = cfg.language === "typescript";
  const hasSwagger = cfg.apiDocs === "swagger";
  const isMVC = cfg.architecture === "mvc";
  const x = isTS ? "" : ".js"; // file extension suffix for ESM imports

  // ── Shared header imports (everything except route imports) ───────────────
  const headerImports = isTS
    ? [
        `import express, { Application, Request, Response, NextFunction } from 'express';`,
        `import cors from 'cors';`,
        `import helmet from 'helmet';`,
        `import morgan from 'morgan';`,
        `import { rateLimiter } from './middlewares/rateLimiter.middleware';`,
        `import { errorHandler } from './middlewares/errorHandler.middleware';`,
        `import { corsOptions } from './config/cors.config';`,
        `import { logger } from './config/logger.config';`,
        hasSwagger
          ? `import swaggerUi from 'swagger-ui-express';\nimport { swaggerSpec } from './config/swagger.config';`
          : "",
      ]
    : [
        `import express from 'express';`,
        `import cors from 'cors';`,
        `import helmet from 'helmet';`,
        `import morgan from 'morgan';`,
        `import { rateLimiter } from './middlewares/rateLimiter.middleware${x}';`,
        `import { errorHandler } from './middlewares/errorHandler.middleware${x}';`,
        `import { corsOptions } from './config/cors.config${x}';`,
        `import { logger } from './config/logger.config${x}';`,
        hasSwagger
          ? `import swaggerUi from 'swagger-ui-express';\nimport { swaggerSpec } from './config/swagger.config${x}';`
          : "",
      ];

  // ── Route imports (MVC vs Mono) ───────────────────────────────────────────
  const routeImports = isTS
    ? isMVC
      ? [
          `// ── Routes ──`,
          cfg.auth !== "none"
            ? `import authRoutes from './modules/auth/auth.route';`
            : "",
          `import todoRoutes from './modules/todo/todo.route';`,
        ]
      : [
          `// ── Routes ──`,
          cfg.auth !== "none"
            ? `import authRoutes from './routes/auth.route';`
            : "",
          `import todoRoutes from './routes/todo.route';`,
        ]
    : isMVC
      ? [
          `// ── Routes ──`,
          cfg.auth !== "none"
            ? `import authRoutes from './modules/auth/auth.route${x}';`
            : "",
          `import todoRoutes from './modules/todo/todo.route${x}';`,
        ]
      : [
          `// ── Routes ──`,
          cfg.auth !== "none"
            ? `import authRoutes from './routes/auth.route${x}';`
            : "",
          `import todoRoutes from './routes/todo.route${x}';`,
        ];

  const allImports = [...headerImports, ...routeImports]
    .filter(Boolean)
    .join("\n");

  return `${allImports}

${isTS ? "const app: Application = express();" : "const app = express();"}

// ── Security & Parsing ──
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: { write: (msg${isTS ? ": string" : ""}) => logger.info(msg.trim()) } }));

// ── Rate Limiter ──
app.use(rateLimiter);

${
  hasSwagger
    ? `// ── API Docs ──
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
`
    : ""
}
// ── Health Check ──
app.get('/health', (_req${isTS ? ": Request" : ""}, res${isTS ? ": Response" : ""}) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ──
${cfg.auth !== "none" ? "app.use('/api/v1/auth', authRoutes);" : ""}
app.use('/api/v1/todos', todoRoutes);

// ── 404 Handler ──
app.use((_req${isTS ? ": Request" : ""}, res${isTS ? ": Response" : ""}) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global Error Handler ──
app.use(errorHandler);

${isTS ? "export default app;" : "export default app;"}
`;
}

module.exports = { appTemplate };
