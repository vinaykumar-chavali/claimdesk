import { Router } from 'express';
import { query } from '../config/database';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { updateStatusSchema } from '../validators/claims';
import { logAudit } from '../services/auditService';
import { canTransition } from '../config/stateMachine';

const router = Router({ mergeParams: true });
router.use(requireAuth);

router.patch('/', requireRole(['officer', 'supervisor']), async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const user = req.user!;
    const data = updateStatusSchema.parse(req.body);

    const claimRes = await query('SELECT status, assigned_officer_id FROM claims WHERE id = $1', [claimId]);
    const claim = claimRes.rows[0];

    if (!claim) return res.status(404).json({ success: false, message: 'Claim not found' });

    if (user.role === 'officer' && claim.assigned_officer_id !== user.id) {
      return res.status(403).json({ success: false, message: 'Not assigned to this claim' });
    }

    if (!canTransition(claim.status, data.status, user.role)) {
      return res.status(400).json({ success: false, message: `Cannot transition from ${claim.status} to ${data.status}` });
    }

    const updateRes = await query(
      `UPDATE claims SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [data.status, claimId]
    );

    await query(
      `INSERT INTO claim_events (claim_id, actor_id, previous_status, new_status, reason)
       VALUES ($1, $2, $3, $4, $5)`,
      [claimId, user.id, claim.status, data.status, data.reason || null]
    );

    logAudit(user.id, 'status_changed', 'claim', claimId, { 
      previous: claim.status, 
      new: data.status,
      reason: data.reason
    }, req.ip);

    if (user.role === 'supervisor') {
      logAudit(user.id, 'supervisor_action', 'claim', claimId, { action: 'override_status' }, req.ip);
    }

    res.json({ success: true, data: updateRes.rows[0] });
  } catch (error) {
    next(error);
  }
});

export default router;
