/** @format */

"use strict";

function redisTemplate(cfg) {
  const isTS = cfg.language === "typescript";

  if (isTS) {
    return `import Redis from 'ioredis';
import { env } from './env.config';
import { logger } from './logger.config';

export const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

redis.on('connect', () => logger.info('✅ Redis connected'));
redis.on('error', (err) => logger.error('❌ Redis error:', err));
`;
  }

  return `import Redis from 'ioredis';
import { env } from './env.config.js';
import { logger } from './logger.config.js';

export const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

redis.on('connect', () => logger.info('✅ Redis connected'));
redis.on('error', (err) => logger.error('❌ Redis error:', err));
`;
}

module.exports = { redisTemplate };
