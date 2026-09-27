import { Router } from 'express';
import { query } from '../config/database';
import { requireAuth } from '../middleware/auth';
import '../types';

const router = Router({ mergeParams: true });
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const { id: claimId } = req.params as { id: string };
    const user = req.user!;

    const claimRes = await query('SELECT claimant_id, assigned_officer_id FROM claims WHERE id = $1', [claimId]);
    const claim = claimRes.rows[0];

    if (!claim) return res.status(404).json({ success: false, message: 'Claim not found' });

    if (user.role === 'claimant' && claim.claimant_id !== user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    if (user.role === 'officer' && claim.assigned_officer_id !== user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const eventsRes = await query(`
      SELECT e.*, u.full_name as actor_name
      FROM claim_events e
      JOIN users u ON e.actor_id = u.id
      WHERE e.claim_id = $1
      ORDER BY e.created_at DESC
    `, [claimId]);

    res.json({ success: true, data: eventsRes.rows });
  } catch (error) {
    next(error);
  }
});

export default router;
