import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation Error',
      details: err.errors.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message
      }))
    });
    return;
  }

  if (err.message && err.message.toLowerCase().includes('not found')) {
    res.status(404).json({
      error: 'Not Found',
      message: err.message
    });
    return;
  }

  if (
    err.message &&
    (err.message.includes('StudyGroup') || err.message.includes('GroupMessage'))
  ) {
    res.status(400).json({
      error: 'Domain Validation Error',
      message: err.message
    });
    return;
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Unexpected error occurred.'
  });
}
