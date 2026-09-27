-- =====================================================================
-- ClaimDesk — Seed Data
-- AV Insurance · Demo Users, Policies, Sample Claims
-- Migration: 002_seed.sql
-- Executed automatically after 001_schema.sql on first container start
-- =====================================================================
-- All demo passwords: Demo1234!
-- pgcrypto crypt() with bf/10 is compatible with Node.js bcryptjs
-- =====================================================================

-- ─────────────────────────────────────────────────────────────────────
-- DEMO USERS
-- ─────────────────────────────────────────────────────────────────────

INSERT INTO users (id, email, password_hash, role, full_name) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'alice@demo.com',
    crypt('Demo1234!', gen_salt('bf', 10)),
    'claimant',
    'Alice Brown'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'bob@demo.com',
    crypt('Demo1234!', gen_salt('bf', 10)),
    'officer',
    'Bob Martinez'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'carol@demo.com',
    crypt('Demo1234!', gen_salt('bf', 10)),
    'officer',
    'Carol Singh'
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'dave@demo.com',
    crypt('Demo1234!', gen_salt('bf', 10)),
    'supervisor',
    'Dave Thompson'
  );

-- ─────────────────────────────────────────────────────────────────────
-- MOCK POLICIES
-- ─────────────────────────────────────────────────────────────────────

INSERT INTO policies_mock (id, policy_number, type, holder_name, coverage_amount, currency, is_active) VALUES
  -- Automobile policies
  (
    'aaaa0001-0000-0000-0000-000000000001',
    'AV-AUTO-00101',
    'automobile',
    'Alice Brown',
    50000.00,
    'USD',
    true
  ),
  (
    'aaaa0002-0000-0000-0000-000000000002',
    'AV-AUTO-00102',
    'automobile',
    'Nexon Logistics Ltd.',
    75000.00,
    'USD',
    true
  ),
  (
    'aaaa0003-0000-0000-0000-000000000003',
    'AV-AUTO-00103',
    'automobile',
    'Metro Fleet Services',
    30000.00,
    'USD',
    true
  ),
  -- Health policies
  (
    'hhhh0001-0000-0000-0000-000000000001',
    'AV-HLTH-00201',
    'health',
    'Alice Brown',
    100000.00,
    'USD',
    true
  ),
  (
    'hhhh0002-0000-0000-0000-000000000002',
    'AV-HLTH-00202',
    'health',
    'Nexon Logistics Ltd.',
    250000.00,
    'USD',
    true
  ),
  (
    'hhhh0003-0000-0000-0000-000000000003',
    'AV-HLTH-00203',
    'health',
    'Metro Fleet Services',
    150000.00,
    'USD',
    false   -- Inactive policy (tests that inactive policies cannot be claimed)
  );

-- ─────────────────────────────────────────────────────────────────────
-- SAMPLE CLAIMS
-- Mix of statuses, both types, priority & non-priority
-- ─────────────────────────────────────────────────────────────────────

-- Claim 1: Automobile · Submitted · PRIORITY (high amount + collision)
INSERT INTO claims (
  id, claimant_id, policy_id, assigned_officer_id,
  title, description, incident_date, claim_amount, currency, status,
  incident_type, vehicle_make, vehicle_model, vehicle_year, vehicle_reg_number, damage_description,
  injury_severity, document_paths,
  priority_label, priority_score,
  priority_reason
) VALUES (
  'cccc0001-0000-0000-0000-000000000001',
  '11111111-1111-1111-1111-111111111111',
  'aaaa0001-0000-0000-0000-000000000001',
  '22222222-2222-2222-2222-222222222222',
  'Front-end collision on NH-48 highway',
  'Travelling southbound on NH-48 when a truck entered the lane unexpectedly. Significant front-end and hood damage. Airbags deployed.',
  '2026-09-20',
  18500.00, 'USD', 'submitted',
  'Collision', 'Toyota', 'Camry', 2022, 'KA-01-AB-1234',
  'Front bumper, hood, and radiator destroyed. Airbags deployed. Vehicle non-driveable.',
  'Minor',
  '[]',
  'priority', 0.8731,
  '[{"feature":"incident_type_Collision","impact":"+0.42"},{"feature":"claim_amount_scaled","impact":"+0.31"},{"feature":"injury_severity_Minor","impact":"+0.12"}]'
);

-- Claim 2: Health · Submitted · PRIORITY (surgery + major)
INSERT INTO claims (
  id, claimant_id, policy_id, assigned_officer_id,
  title, description, incident_date, claim_amount, currency, status,
  treatment_type, hospital_name, diagnosis, treating_doctor, admission_date, discharge_date,
  injury_severity, document_paths,
  priority_label, priority_score,
  priority_reason
) VALUES (
  'cccc0002-0000-0000-0000-000000000002',
  '11111111-1111-1111-1111-111111111111',
  'hhhh0001-0000-0000-0000-000000000001',
  '22222222-2222-2222-2222-222222222222',
  'Emergency spinal surgery — City General Hospital',
  'Patient admitted following workplace fall. MRI confirmed L4-L5 disc herniation with nerve compression. Emergency decompression surgery performed.',
  '2026-09-15',
  45200.00, 'USD', 'submitted',
  'Surgery', 'City General Hospital', 'L4-L5 Disc Herniation with Nerve Compression', 'Dr. Ramesh Sharma',
  '2026-09-15', '2026-09-22',
  'Major',
  '[]',
  'priority', 0.9214,
  '[{"feature":"treatment_type_Surgery","impact":"+0.48"},{"feature":"injury_severity_Major","impact":"+0.35"},{"feature":"claim_amount_scaled","impact":"+0.28"}]'
);

-- Claim 3: Automobile · Under Review · non-priority
INSERT INTO claims (
  id, claimant_id, policy_id, assigned_officer_id,
  title, description, incident_date, claim_amount, currency, status,
  incident_type, vehicle_make, vehicle_model, vehicle_year, vehicle_reg_number, damage_description,
  injury_severity, document_paths,
  priority_label, priority_score,
  priority_reason
) VALUES (
  'cccc0003-0000-0000-0000-000000000003',
  '11111111-1111-1111-1111-111111111111',
  'aaaa0001-0000-0000-0000-000000000001',
  '33333333-3333-3333-3333-333333333333',
  'Parking lot vandalism — side mirror and door',
  'Vehicle found with scratched door panels and broken side mirror in parking lot overnight.',
  '2026-09-10',
  1850.00, 'USD', 'under_review',
  'Vandalism', 'Toyota', 'Camry', 2022, 'KA-01-AB-1234',
  'Driver-side door has deep key scratches along full length. Left side mirror broken.',
  'None',
  '[]',
  'non_priority', 0.1823,
  '[{"feature":"claim_amount_scaled","impact":"-0.38"},{"feature":"incident_type_Vandalism","impact":"-0.22"},{"feature":"injury_severity_None","impact":"-0.18"}]'
);

-- Claim 4: Health · Under Review · non-priority
INSERT INTO claims (
  id, claimant_id, policy_id, assigned_officer_id,
  title, description, incident_date, claim_amount, currency, status,
  treatment_type, hospital_name, diagnosis, treating_doctor, admission_date, discharge_date,
  injury_severity, document_paths,
  priority_label, priority_score,
  priority_reason
) VALUES (
  'cccc0004-0000-0000-0000-000000000004',
  '11111111-1111-1111-1111-111111111111',
  'hhhh0001-0000-0000-0000-000000000001',
  '33333333-3333-3333-3333-333333333333',
  'Outpatient physiotherapy sessions post ankle sprain',
  'Recurring physiotherapy visits for Grade II ankle sprain following sports injury. 8 sessions completed.',
  '2026-08-28',
  960.00, 'USD', 'under_review',
  'Outpatient', 'Sunrise Physiotherapy Clinic', 'Grade II Ankle Sprain', 'Dr. Priya Nair',
  NULL, NULL,
  'Minor',
  '[]',
  'non_priority', 0.2145,
  '[{"feature":"claim_amount_scaled","impact":"-0.42"},{"feature":"treatment_type_Outpatient","impact":"-0.28"},{"feature":"injury_severity_Minor","impact":"-0.09"}]'
);

-- Claim 5: Automobile · Approved
INSERT INTO claims (
  id, claimant_id, policy_id, assigned_officer_id,
  title, description, incident_date, claim_amount, currency, status,
  incident_type, vehicle_make, vehicle_model, vehicle_year, vehicle_reg_number, damage_description,
  injury_severity, document_paths,
  priority_label, priority_score,
  priority_reason
) VALUES (
  'cccc0005-0000-0000-0000-000000000005',
  '11111111-1111-1111-1111-111111111111',
  'aaaa0001-0000-0000-0000-000000000001',
  '22222222-2222-2222-2222-222222222222',
  'Vehicle theft — overnight from residential complex',
  'Vehicle stolen from locked residential parking complex between 11 PM and 6 AM. FIR filed with local police.',
  '2026-07-15',
  42000.00, 'USD', 'approved',
  'Theft', 'Toyota', 'Camry', 2022, 'KA-01-AB-1234',
  'Complete vehicle theft. Recovery unlikely per police report.',
  'None',
  '[]',
  'priority', 0.7654,
  '[{"feature":"incident_type_Theft","impact":"+0.44"},{"feature":"claim_amount_scaled","impact":"+0.28"},{"feature":"policy_type_automobile","impact":"+0.09"}]'
);

-- Claim 6: Health · Closed
INSERT INTO claims (
  id, claimant_id, policy_id, assigned_officer_id,
  title, description, incident_date, claim_amount, currency, status,
  treatment_type, hospital_name, diagnosis, treating_doctor, admission_date, discharge_date,
  injury_severity, document_paths,
  priority_label, priority_score,
  priority_reason
) VALUES (
  'cccc0006-0000-0000-0000-000000000006',
  '11111111-1111-1111-1111-111111111111',
  'hhhh0001-0000-0000-0000-000000000001',
  '22222222-2222-2222-2222-222222222222',
  'Hospitalization — viral fever and dehydration',
  'Patient admitted with high fever (104°F), dehydration, and vomiting. IV fluids and monitoring for 3 days.',
  '2026-06-05',
  4200.00, 'USD', 'closed',
  'Hospitalization', 'Metro Health Hospital', 'Acute Viral Fever with Dehydration', 'Dr. Arjun Patel',
  '2026-06-05', '2026-06-08',
  'None',
  '[]',
  'non_priority', 0.2890,
  '[{"feature":"claim_amount_scaled","impact":"-0.31"},{"feature":"treatment_type_Hospitalization","impact":"+0.18"},{"feature":"injury_severity_None","impact":"-0.22"}]'
);

-- ─────────────────────────────────────────────────────────────────────
-- CLAIM EVENTS (history for sample claims)
-- ─────────────────────────────────────────────────────────────────────

-- Claim 3 (vandalism → under_review)
INSERT INTO claim_events (claim_id, actor_id, previous_status, new_status, reason, created_at) VALUES
  ('cccc0003-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333',
   'submitted', 'under_review', 'Claim documents verified. Starting review.', NOW() - INTERVAL '5 days');

-- Claim 4 (health outpatient → under_review)
INSERT INTO claim_events (claim_id, actor_id, previous_status, new_status, reason, created_at) VALUES
  ('cccc0004-0000-0000-0000-000000000004', '33333333-3333-3333-3333-333333333333',
   'submitted', 'under_review', 'Prescription and session receipts received. Under review.', NOW() - INTERVAL '3 days');

-- Claim 5 (theft → under_review → approved)
INSERT INTO claim_events (claim_id, actor_id, previous_status, new_status, reason, created_at) VALUES
  ('cccc0005-0000-0000-0000-000000000005', '22222222-2222-2222-2222-222222222222',
   'submitted', 'under_review', 'FIR copy and ownership documents received.', NOW() - INTERVAL '40 days'),
  ('cccc0005-0000-0000-0000-000000000005', '22222222-2222-2222-2222-222222222222',
   'under_review', 'approved', 'Police report confirmed. Vehicle unrecovered after 30 days. Claim approved.', NOW() - INTERVAL '10 days');

-- Claim 6 (health closed)
INSERT INTO claim_events (claim_id, actor_id, previous_status, new_status, reason, created_at) VALUES
  ('cccc0006-0000-0000-0000-000000000006', '22222222-2222-2222-2222-222222222222',
   'submitted', 'under_review', 'Hospital bills received. Under review.', NOW() - INTERVAL '80 days'),
  ('cccc0006-0000-0000-0000-000000000006', '22222222-2222-2222-2222-222222222222',
   'under_review', 'approved', 'Bills verified against policy. Approved.', NOW() - INTERVAL '75 days'),
  ('cccc0006-0000-0000-0000-000000000006', '44444444-4444-4444-4444-444444444444',
   'approved', 'closed', 'Settlement processed and paid. Claim closed.', NOW() - INTERVAL '70 days');

-- ─────────────────────────────────────────────────────────────────────
-- OFFICER NOTES (sample internal notes)
-- ─────────────────────────────────────────────────────────────────────

INSERT INTO officer_notes (claim_id, author_id, content, created_at) VALUES
  ('cccc0003-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333',
   'CCTV footage from parking lot requested from claimant. Will review once received.', NOW() - INTERVAL '5 days'),

  ('cccc0005-0000-0000-0000-000000000005', '22222222-2222-2222-2222-222222222222',
   'FIR number: KA0920260715001. Police confirmed theft. Vehicle not found after 30-day search window.', NOW() - INTERVAL '40 days'),

  ('cccc0006-0000-0000-0000-000000000006', '22222222-2222-2222-2222-222222222222',
   'All hospital bills verified. Total: $4,200. Within deductible limits. Approved for full settlement.', NOW() - INTERVAL '75 days');

-- ─────────────────────────────────────────────────────────────────────
-- AUDIT LOGS (sample entries)
-- ─────────────────────────────────────────────────────────────────────

INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, metadata, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'claim_created', 'claim', 'cccc0001-0000-0000-0000-000000000001',
   '{"claim_number":"AV-CLAIM-20260920-0001","policy_type":"automobile"}', NOW() - INTERVAL '7 days'),
  ('11111111-1111-1111-1111-111111111111', 'claim_created', 'claim', 'cccc0002-0000-0000-0000-000000000002',
   '{"claim_number":"AV-CLAIM-20260915-0002","policy_type":"health"}', NOW() - INTERVAL '12 days'),
  ('22222222-2222-2222-2222-222222222222', 'status_changed', 'claim', 'cccc0003-0000-0000-0000-000000000003',
   '{"from":"submitted","to":"under_review"}', NOW() - INTERVAL '5 days'),
  ('22222222-2222-2222-2222-222222222222', 'status_changed', 'claim', 'cccc0005-0000-0000-0000-000000000005',
   '{"from":"under_review","to":"approved"}', NOW() - INTERVAL '10 days'),
  ('44444444-4444-4444-4444-444444444444', 'status_changed', 'claim', 'cccc0006-0000-0000-0000-000000000006',
   '{"from":"approved","to":"closed","supervisor_action":true}', NOW() - INTERVAL '70 days');
