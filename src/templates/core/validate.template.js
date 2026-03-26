/** @format */

"use strict";

function validateTemplate(cfg) {
  const isTS = cfg.language === "typescript";
  const useZod = cfg.validation === "zod";
  const useJoi = cfg.validation === "joi";

  if (useZod) {
    return isTS
      ? `import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';
import { sendError } from '../utils/response.util';

export const validate = (schema: ZodTypeAny) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        sendError(res, 'Validation failed', 422, error.issues);
        return;
      }
      next(error);
    }
  };
`
      : `import { ZodError } from 'zod';
import { sendError } from '../utils/response.util.js';

export const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      sendError(res, 'Validation failed', 422, error.issues);
      return;
    }
    next(error);
  }
};
`;
  }

  if (useJoi) {
    return isTS
      ? `import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { sendError } from '../utils/response.util';

export const validate = (schema: Joi.ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(
      { body: req.body, query: req.query, params: req.params },
      { abortEarly: false, allowUnknown: true },
    );
    if (error) {
      sendError(res, 'Validation failed', 422, error.details.map((d) => d.message));
      return;
    }
    next();
  };
`
      : `import { sendError } from '../utils/response.util.js';

export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(
    { body: req.body, query: req.query, params: req.params },
    { abortEarly: false, allowUnknown: true },
  );
  if (error) {
    sendError(res, 'Validation failed', 422, error.details.map((d) => d.message));
    return;
  }
  next();
};
`;
  }

  // No validation library
  return isTS
    ? `import { Request, Response, NextFunction } from 'express';
// No validation library selected — add your own validation logic here
export const validate = (_schema: any) => (_req: Request, _res: Response, next: NextFunction) => next();
`
    : `// No validation library selected — add your own validation logic here
export const validate = (_schema) => (_req, _res, next) => next();
`;
}

module.exports = { validateTemplate };
