import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation error';
    const details = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));
    
    logger.warn('Validation error:', { details, path: req.path });
    
    return res.status(statusCode).json({
      error: message,
      details,
    });
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    statusCode = 400;
    message = 'Database error';
    
    logger.error('Prisma error:', { error: err.message, path: req.path });
    
    return res.status(statusCode).json({
      error: message,
      message: err.message,
    });
  }

  // Log error
  if (statusCode >= 500) {
    logger.error('Server error:', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  } else {
    logger.warn('Client error:', {
      error: err.message,
      path: req.path,
      method: req.method,
    });
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
