import { z } from 'zod';

export const createClaimSchema = z.object({
  policy_id: z.string().min(1, "Policy is required"),
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional().default(''),
  incident_date: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid date" }),
  claim_amount: z.number().positive("Claim amount must be positive"),
  currency: z.string().length(3).default('USD'),
  
  // Conditionally required based on policy type
  policy_type: z.enum(['automobile', 'health']).optional(),
  
  // Automobile
  vehicle_category: z.enum(['car', 'bike']).optional(),
  incident_type: z.string().optional(),
  vehicle_make: z.string().optional(),
  vehicle_model: z.string().optional(),
  vehicle_year: z.number().int().optional(),
  vehicle_reg_number: z.string().optional(),
  chassis_number: z.string().optional(),
  damage_description: z.string().optional(),
  
  // Health
  treatment_type: z.string().optional(),
  hospital_name: z.string().optional(),
  diagnosis: z.string().optional(),
  treating_doctor: z.string().optional(),
  admission_date: z.string().optional(),
  discharge_date: z.string().optional(),
  injury_severity: z.enum(['None', 'Minor', 'Major']).optional().default('None')
});

export const updateClaimSchema = z.object({
  title: z.string().min(5).max(255).optional(),
  description: z.string().min(10).optional(),
  incident_date: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid date" }).optional(),
  claim_amount: z.number().positive().optional()
});

export const updateStatusSchema = z.object({
  status: z.enum(['submitted', 'under_review', 'approved', 'rejected', 'closed']),
  reason: z.string().optional()
});
