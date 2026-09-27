import { Request, Response, NextFunction } from 'express';

export const requireRole = (allowedRoles: Array<'claimant' | 'officer' | 'supervisor'>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized', message: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Forbidden', message: 'Insufficient role permissions' });
    }

    next();
  };
};
