import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { registerSchema, loginSchema } from '../validators/auth';
import { env } from '../config/env';
import { logAudit } from '../services/auditService';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/me', requireAuth, async (req, res) => {
  res.json({ success: true, data: req.user });
});

router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await query('SELECT id FROM users WHERE email = $1', [data.email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'UserExists', message: 'Email already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(data.password, salt);
    const userId = uuidv4();

    await query(
      `INSERT INTO users (id, email, password_hash, role, full_name)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, data.email, hash, data.role, data.full_name]
    );

    const payload = { id: userId, email: data.email, role: data.role as any, full_name: data.full_name };
    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '24h' });

    logAudit(userId, 'register', 'user', userId, { role: data.role }, req.ip);

    res.status(201).json({ success: true, data: { token, user: payload } });
  } catch (error) {
    logAudit(null, 'auth_failure', 'system', null, { reason: 'register_failed' }, req.ip);
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    const result = await query('SELECT * FROM users WHERE email = $1', [data.email]);
    const user = result.rows[0];

    if (!user) {
      logAudit(null, 'auth_failure', 'system', null, { reason: 'user_not_found', email: data.email }, req.ip);
      return res.status(401).json({ success: false, error: 'Unauthorized', message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(data.password, user.password_hash);
    if (!isMatch) {
      logAudit(user.id, 'auth_failure', 'user', user.id, { reason: 'invalid_password' }, req.ip);
      return res.status(401).json({ success: false, error: 'Unauthorized', message: 'Invalid credentials' });
    }

    const payload = { id: user.id, email: user.email, role: user.role, full_name: user.full_name };
    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '24h' });

    logAudit(user.id, 'login', 'user', user.id, {}, req.ip);

    res.json({ success: true, data: { token, user: payload } });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

export default router;
