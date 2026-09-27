import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { upload } from '../middleware/upload';
import { createClaimSchema, updateClaimSchema } from '../validators/claims';
import { logAudit } from '../services/auditService';
import { analyzeClaimPriority } from '../services/mlService';
import fs from 'fs';
import path from 'path';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const user = req.user!;
    let q = `
      SELECT c.*, p.policy_number, p.type as policy_type, p.holder_name,
             p.vehicle_category as policy_vehicle_category, p.chassis_number as policy_chassis_number
      FROM claims c
      JOIN policies_mock p ON c.policy_id = p.id
    `;
    const params: any[] = [];

    if (user.role === 'claimant') {
      q += ' WHERE c.claimant_id = $1';
      params.push(user.id);
      q += ' ORDER BY c.created_at DESC';
    } else if (user.role === 'officer') {
      q += ' WHERE c.assigned_officer_id = $1';
      params.push(user.id);
      q += " ORDER BY c.priority_label = 'priority' DESC, c.created_at ASC";
    } else {
      q += " ORDER BY c.priority_label = 'priority' DESC, c.created_at ASC";
    }

    const result = await query(q, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const user = req.user!;
    const claimId = req.params.id;

    const result = await query(`
      SELECT c.*, p.policy_number, p.type as policy_type, p.holder_name,
             p.vehicle_category as policy_vehicle_category, p.chassis_number as policy_chassis_number,
             u.full_name as claimant_name, u.email as claimant_email
      FROM claims c
      JOIN policies_mock p ON c.policy_id = p.id
      JOIN users u ON c.claimant_id = u.id
      WHERE c.id = $1
    `, [claimId]);

    const claim = result.rows[0];
    if (!claim) return res.status(404).json({ success: false, message: 'Claim not found' });

    if (user.role === 'claimant' && claim.claimant_id !== user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    if (user.role === 'officer' && claim.assigned_officer_id !== user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    res.json({ success: true, data: claim });
  } catch (error) {
    next(error);
  }
});

router.post('/', requireRole(['claimant']), upload.any(), async (req, res, next) => {
  try {
    const user = req.user!;
    
    // Parse numeric fields properly if coming from form-data
    const body = { ...req.body };
    if (body.claim_amount) body.claim_amount = Number(body.claim_amount);
    if (body.vehicle_year) body.vehicle_year = Number(body.vehicle_year);

    const data = createClaimSchema.parse(body);
    const claimId = uuidv4();
    
    // Generate AV-CLAIM-YYYYMMDD-XXXX format
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const claimNumber = `AV-CLAIM-${today}-${randNum}`;

    // Handle all uploaded files
    const uploadedFiles = (req.files as Express.Multer.File[]) || [];
    const documentPaths = uploadedFiles.map(file => ({
      path: `/uploads/${file.filename}`,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size
    }));

    // Find policy
    const policyRes = await query('SELECT * FROM policies_mock WHERE id = $1 OR policy_number = $1', [data.policy_id]);
    const policy = policyRes.rows[0];
    if (!policy || !policy.is_active) {
       return res.status(400).json({ success: false, message: 'Invalid or inactive policy' });
    }

    const policyType = data.policy_type || policy.type;
    const vehicleCat = data.vehicle_category || policy.vehicle_category || 'car';
    const chassisNum = data.chassis_number || policy.chassis_number || null;

    // Call ML service for priority analysis
    const mlResult = await analyzeClaimPriority({
      policy_type: policyType,
      incident_type: data.incident_type,
      treatment_type: data.treatment_type,
      injury_severity: data.injury_severity || 'None',
      claim_amount: data.claim_amount,
      coverage_amount: Number(policy.coverage_amount) || 50000,
      description: data.description || ''
    });

    const priorityLabel = mlResult?.priority_label || 'non_priority';
    const priorityScore = mlResult?.priority_score || 0;
    const priorityReason = mlResult?.priority_reason || [];

    // Assign to default officer (Bob Martinez) so officer dashboard picks it up immediately
    const defaultOfficerId = '22222222-2222-2222-2222-222222222222';

    const insertResult = await query(`
      INSERT INTO claims (
        id, claim_number, claimant_id, policy_id, assigned_officer_id, 
        title, description, incident_date, claim_amount, currency, 
        status, incident_type, vehicle_category, vehicle_make, vehicle_model, vehicle_year, 
        vehicle_reg_number, chassis_number, damage_description, treatment_type, hospital_name, diagnosis, 
        treating_doctor, admission_date, discharge_date, injury_severity, document_paths, 
        priority_label, priority_score, priority_reason
      ) VALUES (
        $1, $2, $3, $4, $5, 
        $6, $7, $8, $9, $10, 
        $11, $12, $13, $14, $15, $16, 
        $17, $18, $19, $20, $21, $22, 
        $23, $24, $25, $26, $27, 
        $28, $29, $30
      ) RETURNING *
    `, [
      claimId, claimNumber, user.id, policy.id, defaultOfficerId, 
      data.title, data.description || '', data.incident_date, data.claim_amount, data.currency || 'USD', 
      'submitted', data.incident_type || null, vehicleCat, data.vehicle_make || null, data.vehicle_model || null, data.vehicle_year || null, 
      data.vehicle_reg_number || null, chassisNum, data.damage_description || null, data.treatment_type || null, data.hospital_name || null, data.diagnosis || null, 
      data.treating_doctor || null, data.admission_date || null, data.discharge_date || null, data.injury_severity || 'None', JSON.stringify(documentPaths), 
      priorityLabel, priorityScore, JSON.stringify(priorityReason)
    ]);

    await query(`
      INSERT INTO claim_events (claim_id, actor_id, new_status, reason)
      VALUES ($1, $2, 'submitted', 'Claim submitted by claimant')
    `, [claimId, user.id]);

    logAudit(user.id, 'claim_created', 'claim', claimId, { claimNumber, priorityLabel }, req.ip);

    const returnedClaim = insertResult.rows[0] || {
      id: claimId,
      claim_number: claimNumber,
      claimant_id: user.id,
      policy_id: policy.id,
      assigned_officer_id: defaultOfficerId,
      title: data.title,
      description: data.description || '',
      incident_date: data.incident_date,
      claim_amount: data.claim_amount,
      currency: data.currency || 'USD',
      status: 'submitted',
      priority_label: priorityLabel,
      priority_score: priorityScore,
      priority_reason: priorityReason,
      document_paths: documentPaths,
      created_at: new Date().toISOString()
    };

    res.status(201).json({ success: true, data: returnedClaim });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', requireRole(['claimant']), async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const user = req.user!;
    
    const body = { ...req.body };
    if (body.claim_amount) body.claim_amount = Number(body.claim_amount);
    
    const data = updateClaimSchema.parse(body);

    const claimRes = await query('SELECT * FROM claims WHERE id = $1 AND claimant_id = $2', [claimId, user.id]);
    const claim = claimRes.rows[0];

    if (!claim) return res.status(404).json({ success: false, message: 'Claim not found or not owned by user' });
    if (claim.status !== 'submitted') {
      return res.status(400).json({ success: false, message: 'Can only edit submitted claims' });
    }

    const fields = Object.keys(data);
    if (fields.length === 0) return res.json({ success: true, data: claim });

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = Object.values(data);
    
    const updateRes = await query(
      `UPDATE claims SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, claimId]
    );

    logAudit(user.id, 'claim_updated', 'claim', claimId, { fieldsUpdated: fields }, req.ip);

    res.json({ success: true, data: updateRes.rows[0] });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', requireRole(['claimant']), async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const user = req.user!;

    const claimRes = await query('SELECT status FROM claims WHERE id = $1 AND claimant_id = $2', [claimId, user.id]);
    const claim = claimRes.rows[0];

    if (!claim) return res.status(404).json({ success: false, message: 'Claim not found' });
    if (claim.status !== 'submitted') {
      return res.status(400).json({ success: false, message: 'Can only delete submitted claims' });
    }

    await query('DELETE FROM claims WHERE id = $1', [claimId]);
    logAudit(user.id, 'claim_deleted', 'claim', claimId, {}, req.ip);

    res.json({ success: true, message: 'Claim deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
