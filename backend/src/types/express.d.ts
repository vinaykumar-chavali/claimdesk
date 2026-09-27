// Express global type augmentation — makes req.user available on all routes

import { UserPayload } from './index';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
