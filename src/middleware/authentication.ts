import type { Request, Response, NextFunction } from 'express';
import { UNAUTHORIZED } from '../common/responseCodes.js';

const getAuthToken = (req: Request): string | undefined => {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  }
  return undefined;
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authToken = getAuthToken(req);

  if (!authToken) {
    return res.status(UNAUTHORIZED).send({ message: 'Unauthorized request' });
  }

  next();
};
