/** @format */

"use strict";

function rateLimiterTemplate(cfg) {
  const isTS = cfg.language === "typescript";

  if (isTS) {
    return `import rateLimit from 'express-rate-limit';
import { env } from '../config/env.config';
import { sendError } from '../utils/response.util';

export const rateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, 'Too many requests, please try again later.', 429);
  },
});
`;
  }

  return `import rateLimit from 'express-rate-limit';
import { env } from '../config/env.config.js';
import { sendError } from '../utils/response.util.js';

export const rateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, 'Too many requests, please try again later.', 429);
  },
});
`;
}

module.exports = { rateLimiterTemplate };
