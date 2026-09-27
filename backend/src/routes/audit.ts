import { Router } from 'express';
import { query } from '../config/database';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

// GET /audit - retrieve audit trail with role filtering
router.get('/', async (req, res, next) => {
  try {
    const user = req.user!;
    const { resourceId, action } = req.query as { resourceId?: string; action?: string };

    let q = `
      SELECT a.*, u.full_name as actor_name, u.role as actor_role, u.email as actor_email
      FROM audit_logs a
      LEFT JOIN users u ON a.actor_id = u.id
    `;
    const conditions: string[] = [];
    const params: any[] = [];

    // RBAC filtering
    if (user.role === 'claimant') {
      // Claimants can only see audit records for claims they own
      conditions.push(`a.resource_id IN (SELECT id FROM claims WHERE claimant_id = $${params.length + 1})`);
      params.push(user.id);
    } else if (user.role === 'officer') {
      // Officers can only see audit records for claims assigned to them or their own user actions
      conditions.push(`(a.resource_id IN (SELECT id FROM claims WHERE assigned_officer_id = $${params.length + 1}) OR a.actor_id = $${params.length + 1})`);
      params.push(user.id);
    }
    // Supervisors see all audit logs

    if (resourceId) {
      conditions.push(`a.resource_id = $${params.length + 1}`);
      params.push(resourceId);
    }

    if (action) {
      conditions.push(`a.action = $${params.length + 1}`);
      params.push(action);
    }

    if (conditions.length > 0) {
      q += ' WHERE ' + conditions.join(' AND ');
    }

    q += ' ORDER BY a.created_at DESC LIMIT 100';

    const result = await query(q, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

// GET /audit/claim/:id - retrieve audit trail for a specific claim
router.get('/claim/:id', async (req, res, next) => {
  try {
    const user = req.user!;
    const claimId = req.params.id;

    // Verify access to the claim
    const claimRes = await query('SELECT claimant_id, assigned_officer_id FROM claims WHERE id = $1', [claimId]);
    const claim = claimRes.rows[0];
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    if (user.role === 'claimant' && claim.claimant_id !== user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    if (user.role === 'officer' && claim.assigned_officer_id !== user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const auditRes = await query(`
      SELECT a.*, u.full_name as actor_name, u.role as actor_role, u.email as actor_email
      FROM audit_logs a
      LEFT JOIN users u ON a.actor_id = u.id
      WHERE a.resource_id = $1
      ORDER BY a.created_at DESC
    `, [claimId]);

    res.json({ success: true, data: auditRes.rows });
  } catch (error) {
    next(error);
  }
});

export default router;
