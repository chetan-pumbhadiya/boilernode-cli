/** @format */

"use strict";

function responseTemplate(cfg) {
  const isTS = cfg.language === "typescript";

  if (isTS) {
    return `import { Response } from 'express';

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
  meta?: Record<string, unknown>;
}

export function sendSuccess<T>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = 200,
  meta?: Record<string, unknown>,
): void {
  const response: ApiResponse<T> = { success: true, message };
  if (data !== undefined) response.data = data;
  if (meta) response.meta = meta;
  res.status(statusCode).json(response);
}

export function sendCreated<T>(res: Response, message: string, data?: T): void {
  sendSuccess(res, message, data, 201);
}

export function sendError(res: Response, message: string, statusCode: number = 500, errors?: unknown): void {
  const response: ApiResponse = { success: false, message };
  if (errors !== undefined) response.errors = errors;
  res.status(statusCode).json(response);
}

export function sendPaginated<T>(
  res: Response,
  message: string,
  data: T[],
  total: number,
  page: number,
  limit: number,
): void {
  sendSuccess(res, message, data, 200, {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
`;
  }

  return `export function sendSuccess(res, message, data, statusCode = 200, meta) {
  const response = { success: true, message };
  if (data !== undefined) response.data = data;
  if (meta) response.meta = meta;
  res.status(statusCode).json(response);
}

export function sendCreated(res, message, data) {
  sendSuccess(res, message, data, 201);
}

export function sendError(res, message, statusCode = 500, errors) {
  const response = { success: false, message };
  if (errors !== undefined) response.errors = errors;
  res.status(statusCode).json(response);
}

export function sendPaginated(res, message, data, total, page, limit) {
  sendSuccess(res, message, data, 200, {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
`;
}

module.exports = { responseTemplate };
