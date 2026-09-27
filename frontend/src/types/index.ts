export interface User { 
  id: string; 
  email: string; 
  role: 'claimant' | 'officer' | 'supervisor'; 
  full_name: string; 
}

export interface Policy { 
  id: string; 
  policy_number: string; 
  type: 'automobile' | 'health'; 
  holder_name: string; 
  coverage_amount: number; 
  currency: string; 
  is_active: boolean; 
  vehicle_category?: 'car' | 'bike';
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  vehicle_reg_number?: string;
  chassis_number?: string;
}

export type ClaimStatus = 'submitted' | 'under_review' | 'approved' | 'rejected' | 'closed';
export type PriorityLabel = 'priority' | 'non_priority';

export interface DocumentAttachment { 
  path: string; 
  originalName: string; 
  mimeType: string; 
  sizeBytes: number; 
}

export interface Claim {
  id: string; 
  claim_number: string; 
  claimant_id: string; 
  policy_id: string;
  assigned_officer_id?: string; 
  title: string; 
  description?: string;
  incident_date: string; 
  claim_amount: number; 
  currency: string; 
  status: ClaimStatus;
  
  // automobile
  vehicle_category?: 'car' | 'bike';
  incident_type?: string; 
  vehicle_make?: string; 
  vehicle_model?: string;
  vehicle_year?: number; 
  vehicle_reg_number?: string; 
  chassis_number?: string;
  damage_description?: string;
  
  // health
  treatment_type?: string; 
  hospital_name?: string; 
  diagnosis?: string;
  treating_doctor?: string; 
  admission_date?: string; 
  discharge_date?: string;
  
  // shared
  injury_severity: string; 
  document_paths: DocumentAttachment[];
  priority_label?: PriorityLabel; 
  priority_score?: number; 
  priority_reason?: Array<{feature: string; impact: string}>;
  created_at: string; 
  updated_at: string;
  
  policy?: Policy;
}

export interface ClaimEvent { 
  id: string; 
  claim_id: string; 
  actor_id: string; 
  previous_status?: ClaimStatus; 
  new_status: ClaimStatus; 
  reason?: string; 
  created_at: string; 
  actor?: User; 
}

export interface OfficerNote { 
  id: string; 
  claim_id: string; 
  author_id: string; 
  content: string; 
  created_at: string; 
  author?: User; 
}

export interface AuditLog {
  id: string;
  actor_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  metadata?: any;
  ip_address?: string;
  created_at: string;
  actor_name?: string;
  actor_role?: string;
  actor_email?: string;
}
