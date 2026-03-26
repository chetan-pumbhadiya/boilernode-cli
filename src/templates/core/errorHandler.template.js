/** @format */

"use strict";

function errorHandlerTemplate(cfg) {
  const isTS = cfg.language === "typescript";

  if (isTS) {
    return `import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.config';
import { sendError } from '../utils/response.util';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const message = isAppError ? err.message : 'Internal Server Error';

  logger.error({
    message: err.message,
    stack: err.stack,
    statusCode,
  });

  sendError(res, message, statusCode);
}
`;
  }

  return `import { logger } from '../config/logger.config.js';
import { sendError } from '../utils/response.util.js';

export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(err, _req, res, _next) {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const message = isAppError ? err.message : 'Internal Server Error';

  logger.error({
    message: err.message,
    stack: err.stack,
    statusCode,
  });

  sendError(res, message, statusCode);
}
`;
}

module.exports = { errorHandlerTemplate };
