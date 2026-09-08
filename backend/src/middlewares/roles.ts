import { Request, Response, NextFunction } from 'express';

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !user.role || !allowedRoles.includes(user.role.name)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};
