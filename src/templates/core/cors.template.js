/** @format */

"use strict";

function corsTemplate(cfg) {
  const isTS = cfg.language === "typescript";

  if (isTS) {
    return `import { CorsOptions } from 'cors';
import { env } from './env.config';

const allowedOrigins: string[] = env.CORS_ORIGIN.split(',').map((o) => o.trim());

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error(\`Origin '\${origin}' not allowed by CORS\`));
    }
  },
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200,
};
`;
  }

  return `import { env } from './env.config.js';

const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());

export const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error(\`Origin '\${origin}' not allowed by CORS\`));
    }
  },
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200,
};
`;
}

module.exports = { corsTemplate };
