import { Request, Response, NextFunction } from 'express';
import Boom from '@hapi/boom';

/**
 * Centralized Express Error Handling Middleware
 * Normalizes non-Boom errors to 500 Internal Server Error
 * and formats standardized JSON error responses.
 */
export const errorHandler = (
  err: Error | Boom.Boom,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // If the error is not a Boom error, wrap it into a 500 Internal Server Error Boom object
  const boomError: Boom.Boom = Boom.isBoom(err) 
    ? err 
    : Boom.boomify(err);

  const { statusCode, payload } = boomError.output;
  res.status(statusCode).json({
    ...payload,
    details: (boomError as unknown as { detail?: string }).detail,
  });
};