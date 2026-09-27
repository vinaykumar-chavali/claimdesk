import { query } from '../config/database';

export const logAudit = (
  actorId: string | null,
  action: string,
  resourceType: string,
  resourceId: string | null = null,
  metadata: Record<string, any> = {},
  ipAddress: string | null = null
) => {
  // Fire and forget
  query(
    `INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, metadata, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [actorId, action, resourceType, resourceId, JSON.stringify(metadata), ipAddress]
  ).catch((err) => {
    console.error('Audit log insertion failed:', err);
  });
};
