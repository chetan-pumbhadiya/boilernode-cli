/** @format */

"use strict";

function serverTemplate(cfg) {
  const isTS = cfg.language === "typescript";
  const hasSocket = cfg.realtimeSupport === "socketio";
  const x = isTS ? "" : ".js";

  if (isTS) {
    return `import app from './app';
import { env } from './config/env.config';
import { logger } from './config/logger.config';
import { connectDB } from './config/db.config';
${hasSocket ? `\nimport { createServer } from 'http';\nimport { initSocket } from './config/socket.config';` : ""}

const PORT = env.PORT || 5000;

async function startServer(): Promise<void> {
  await connectDB();

${
  hasSocket
    ? `  const httpServer = createServer(app);
  initSocket(httpServer);

  httpServer.listen(PORT, () => {`
    : `  app.listen(PORT, () => {`
}
    logger.info(\`🚀 Server running on http://localhost:\${PORT}\`);
    logger.info(\`🌍 Environment: \${env.NODE_ENV}\`);
    ${cfg.apiDocs === "swagger" ? `logger.info(\`📄 Swagger docs: http://localhost:\${PORT}/api-docs\`);` : ""}
  });

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
  });

  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason: unknown) => {
    logger.error('Unhandled Rejection:', reason);
    process.exit(1);
  });
}

startServer();
`;
  }

  // JavaScript — ESM
  return `import app from './app${x}';
import { env } from './config/env.config${x}';
import { logger } from './config/logger.config${x}';
import { connectDB } from './config/db.config${x}';
${hasSocket ? `\nimport { createServer } from 'http';\nimport { initSocket } from './config/socket.config${x}';` : ""}

const PORT = env.PORT || 5000;

async function startServer() {
  await connectDB();

${
  hasSocket
    ? `  const httpServer = createServer(app);
  initSocket(httpServer);

  httpServer.listen(PORT, () => {`
    : `  app.listen(PORT, () => {`
}
    logger.info(\`🚀 Server running on http://localhost:\${PORT}\`);
    logger.info(\`🌍 Environment: \${env.NODE_ENV}\`);
    ${cfg.apiDocs === "swagger" ? `logger.info(\`📄 Swagger docs: http://localhost:\${PORT}/api-docs\`);` : ""}
  });

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
    process.exit(1);
  });
}

startServer();
`;
}

module.exports = { serverTemplate };
