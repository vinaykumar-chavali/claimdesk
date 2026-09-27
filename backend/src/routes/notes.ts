import { Router } from 'express';
import { query } from '../config/database';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { noteSchema } from '../validators/notes';
import { logAudit } from '../services/auditService';
import '../types';

const router = Router({ mergeParams: true });
router.use(requireAuth);
router.use(requireRole(['officer', 'supervisor']));

router.get('/', async (req, res, next) => {
  try {
    const { id: claimId } = req.params as { id: string };
    const user = req.user!;

    if (user.role === 'officer') {
      const claimRes = await query('SELECT assigned_officer_id FROM claims WHERE id = $1', [claimId]);
      if (!claimRes.rows[0] || claimRes.rows[0].assigned_officer_id !== user.id) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
    }

    const notesRes = await query(`
      SELECT n.*, u.full_name as author_name 
      FROM officer_notes n
      JOIN users u ON n.author_id = u.id
      WHERE n.claim_id = $1
      ORDER BY n.created_at DESC
    `, [claimId]);

    res.json({ success: true, data: notesRes.rows });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { id: claimId } = req.params as { id: string };
    const user = req.user!;
    const data = noteSchema.parse(req.body);

    if (user.role === 'officer') {
      const claimRes = await query('SELECT assigned_officer_id FROM claims WHERE id = $1', [claimId]);
      if (!claimRes.rows[0] || claimRes.rows[0].assigned_officer_id !== user.id) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
    }

    const result = await query(`
      INSERT INTO officer_notes (claim_id, author_id, content)
      VALUES ($1, $2, $3) RETURNING *
    `, [claimId, user.id, data.content]);

    logAudit(user.id, 'note_created', 'claim', claimId, {}, req.ip);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

export default router;
