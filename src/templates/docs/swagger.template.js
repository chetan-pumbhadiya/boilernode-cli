/** @format */

"use strict";

function swaggerTemplate(cfg) {
  const isTS = cfg.language === "typescript";
  const ext = isTS ? "ts" : "js";

  if (isTS) {
    return `import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '${cfg.projectName} API',
      version: '1.0.0',
      description: 'Auto-generated API documentation',
      contact: { name: 'API Support' },
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Development Server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Todos', description: 'Todo management endpoints' },
    ],
  },
  apis: ['./src/**/*.route.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
`;
  }

  return `import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '${cfg.projectName} API',
      version: '1.0.0',
      description: 'Auto-generated API documentation',
      contact: { name: 'API Support' },
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Development Server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Todos', description: 'Todo management endpoints' },
    ],
  },
  apis: ['./src/**/*.route.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
`;
}

module.exports = { swaggerTemplate };
