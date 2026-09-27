import { Router } from 'express';
import { query } from '../config/database';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const search = req.query.search as string;
    let result;
    if (search && search.trim()) {
      result = await query(
        `SELECT * FROM policies_mock 
         WHERE UPPER(policy_number) LIKE UPPER($1) OR UPPER(holder_name) LIKE UPPER($1)
         ORDER BY created_at DESC`,
        [`%${search.trim()}%`]
      );
    } else {
      result = await query('SELECT * FROM policies_mock ORDER BY created_at DESC');
    }
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const idOrNumber = req.params.id;
    const result = await query(
      'SELECT * FROM policies_mock WHERE id = $1 OR UPPER(policy_number) = UPPER($1)',
      [idOrNumber]
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Policy not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

export default router;
