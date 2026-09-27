import { Router } from 'express';
import { query } from '../config/database';

const router = Router();

router.get('/', async (req, res) => {
  try {
    await query('SELECT 1');
    res.json({ success: true, status: 'ok', message: 'Backend is healthy' });
  } catch (error) {
    res.status(503).json({ success: false, status: 'error', message: 'Database connection failed' });
  }
});

export default router;
