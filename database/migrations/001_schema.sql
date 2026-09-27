-- =====================================================================
-- ClaimDesk — Database Schema
-- AV Insurance · Automobile & Health
-- Migration: 001_schema.sql
-- Executed automatically by PostgreSQL on first container start
-- =====================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────
-- ENUM TYPES
-- ─────────────────────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('claimant', 'officer', 'supervisor');

CREATE TYPE policy_type AS ENUM ('automobile', 'health');

CREATE TYPE claim_status AS ENUM (
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'closed'
);

CREATE TYPE injury_severity_level AS ENUM ('None', 'Minor', 'Major');

CREATE TYPE priority_label AS ENUM ('priority', 'non_priority');

-- ─────────────────────────────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT        UNIQUE NOT NULL,
  password_hash TEXT        NOT NULL,
  role          user_role   NOT NULL DEFAULT 'claimant',
  full_name     TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role  ON users (role);

-- ─────────────────────────────────────────────────────────────────────
-- POLICIES (Mock / Reference Data)
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE policies_mock (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_number    TEXT        UNIQUE NOT NULL,  -- AV-AUTO-00101 | AV-HLTH-00201
  type             policy_type NOT NULL,
  holder_name      TEXT        NOT NULL,
  coverage_amount  NUMERIC(15,2) NOT NULL CHECK (coverage_amount > 0),
  currency         TEXT        NOT NULL DEFAULT 'USD',
  is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_policies_number ON policies_mock (policy_number);
CREATE INDEX idx_policies_type   ON policies_mock (type);

-- ─────────────────────────────────────────────────────────────────────
-- CLAIMS
-- ─────────────────────────────────────────────────────────────────────

CREATE SEQUENCE IF NOT EXISTS claim_number_seq START 1;

CREATE TABLE claims (
  id                   UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_number         TEXT              UNIQUE,             -- AV-CLAIM-YYYYMMDD-NNNN (auto-generated)

  -- Ownership & Assignment
  claimant_id          UUID              NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  policy_id            UUID              NOT NULL REFERENCES policies_mock(id) ON DELETE RESTRICT,
  assigned_officer_id  UUID              REFERENCES users(id) ON DELETE SET NULL,

  -- Core fields (both types)
  title                TEXT              NOT NULL,
  description          TEXT,
  incident_date        DATE              NOT NULL,
  claim_amount         NUMERIC(15,2)     NOT NULL CHECK (claim_amount > 0),
  currency             TEXT              NOT NULL DEFAULT 'USD',
  status               claim_status      NOT NULL DEFAULT 'submitted',

  -- ── Automobile-specific ──────────────────────────────────────────
  -- incident_type: Collision | Theft | Fire | Vandalism | Flood | Hit & Run
  incident_type        TEXT,
  vehicle_make         TEXT,
  vehicle_model        TEXT,
  vehicle_year         INTEGER           CHECK (vehicle_year IS NULL OR (vehicle_year >= 1900 AND vehicle_year <= 2100)),
  vehicle_reg_number   TEXT,
  damage_description   TEXT,

  -- ── Health-specific ──────────────────────────────────────────────
  -- treatment_type: Hospitalization | Surgery | Emergency | Outpatient | Pharmacy
  treatment_type       TEXT,
  hospital_name        TEXT,
  diagnosis            TEXT,
  treating_doctor      TEXT,
  admission_date       DATE,
  discharge_date       DATE,

  -- ── Shared ───────────────────────────────────────────────────────
  injury_severity      injury_severity_level NOT NULL DEFAULT 'None',

  -- File attachments stored as JSON array:
  -- [{ "path": "...", "originalName": "...", "mimeType": "...", "sizeBytes": 0 }]
  document_paths       JSONB             NOT NULL DEFAULT '[]',

  -- ML Priority Scoring
  priority_label       priority_label,
  priority_score       NUMERIC(5,4)      CHECK (priority_score IS NULL OR (priority_score >= 0 AND priority_score <= 1)),
  priority_reason      JSONB,            -- [{ "feature": "...", "impact": "..." }]

  created_at           TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

-- Indexes on claims
CREATE INDEX idx_claims_claimant_id      ON claims (claimant_id);
CREATE INDEX idx_claims_officer_id       ON claims (assigned_officer_id);
CREATE INDEX idx_claims_status           ON claims (status);
CREATE INDEX idx_claims_priority_label   ON claims (priority_label);
CREATE INDEX idx_claims_created_at       ON claims (created_at DESC);
CREATE INDEX idx_claims_policy_id        ON claims (policy_id);

-- ─────────────────────────────────────────────────────────────────────
-- CLAIM EVENTS  (status change history / timeline)
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE claim_events (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id        UUID         NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  actor_id        UUID         NOT NULL REFERENCES users(id)  ON DELETE RESTRICT,
  previous_status claim_status,
  new_status      claim_status NOT NULL,
  reason          TEXT,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_claim_events_claim_id   ON claim_events (claim_id);
CREATE INDEX idx_claim_events_created_at ON claim_events (created_at ASC);

-- ─────────────────────────────────────────────────────────────────────
-- OFFICER NOTES  (internal — not visible to claimants)
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE officer_notes (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id   UUID        NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  author_id  UUID        NOT NULL REFERENCES users(id)  ON DELETE RESTRICT,
  content    TEXT        NOT NULL CHECK (LENGTH(TRIM(content)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_officer_notes_claim_id ON officer_notes (claim_id);

-- ─────────────────────────────────────────────────────────────────────
-- AUDIT LOGS
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE audit_logs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id      UUID        REFERENCES users(id) ON DELETE SET NULL,
  action        TEXT        NOT NULL,   -- e.g. claim_created, status_changed, login
  resource_type TEXT        NOT NULL,   -- e.g. claim, user, note
  resource_id   TEXT,
  metadata      JSONB       NOT NULL DEFAULT '{}',
  ip_address    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_actor_id   ON audit_logs (actor_id);
CREATE INDEX idx_audit_logs_action     ON audit_logs (action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at DESC);

-- ─────────────────────────────────────────────────────────────────────
-- TRIGGERS
-- ─────────────────────────────────────────────────────────────────────

-- updated_at auto-update
CREATE OR REPLACE FUNCTION fn_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TRIGGER trg_claims_updated_at
  BEFORE UPDATE ON claims
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

-- Auto-generate claim_number on INSERT
CREATE OR REPLACE FUNCTION fn_generate_claim_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.claim_number IS NULL THEN
    NEW.claim_number = 'AV-CLAIM-' ||
      TO_CHAR(NOW() AT TIME ZONE 'UTC', 'YYYYMMDD') || '-' ||
      LPAD(nextval('claim_number_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_claims_claim_number
  BEFORE INSERT ON claims
  FOR EACH ROW EXECUTE FUNCTION fn_generate_claim_number();
