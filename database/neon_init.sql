-- =====================================================================
-- ClaimDesk — PostgreSQL Production Database Setup (Neon.tech / Supabase)
-- AV Insurance · Automobile & Health Claims
-- Single-file idempotent migration & seed script
-- =====================================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM Types (wrapped safely)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('claimant', 'officer', 'supervisor');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE policy_type AS ENUM ('automobile', 'health');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE claim_status AS ENUM ('submitted', 'under_review', 'approved', 'rejected', 'closed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE injury_severity_level AS ENUM ('None', 'Minor', 'Major');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE priority_label AS ENUM ('priority', 'non_priority');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Users Table
CREATE TABLE IF NOT EXISTS users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT        UNIQUE NOT NULL,
  password_hash TEXT        NOT NULL,
  role          user_role   NOT NULL DEFAULT 'claimant',
  full_name     TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users (role);

-- 4. Policies Table
CREATE TABLE IF NOT EXISTS policies_mock (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_number       TEXT        UNIQUE NOT NULL,
  type                policy_type NOT NULL,
  holder_name         TEXT        NOT NULL,
  coverage_amount     NUMERIC(15,2) NOT NULL CHECK (coverage_amount > 0),
  currency            TEXT        NOT NULL DEFAULT 'USD',
  is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
  vehicle_category    TEXT        DEFAULT 'car',
  vehicle_make        TEXT,
  vehicle_model       TEXT,
  vehicle_year        INTEGER,
  vehicle_reg_number  TEXT,
  chassis_number      TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_policies_number ON policies_mock (policy_number);
CREATE INDEX IF NOT EXISTS idx_policies_type   ON policies_mock (type);

-- 5. Claims Table
CREATE SEQUENCE IF NOT EXISTS claim_number_seq START 1;

CREATE TABLE IF NOT EXISTS claims (
  id                   UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_number         TEXT              UNIQUE,
  claimant_id          UUID              NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  policy_id            UUID              NOT NULL REFERENCES policies_mock(id) ON DELETE RESTRICT,
  assigned_officer_id  UUID              REFERENCES users(id) ON DELETE SET NULL,
  title                TEXT              NOT NULL,
  description          TEXT,
  incident_date        DATE              NOT NULL,
  claim_amount         NUMERIC(15,2)     NOT NULL CHECK (claim_amount > 0),
  currency             TEXT              NOT NULL DEFAULT 'USD',
  status               claim_status      NOT NULL DEFAULT 'submitted',
  
  -- Automobile specific
  incident_type        TEXT,
  vehicle_category     TEXT              DEFAULT 'car',
  vehicle_make         TEXT,
  vehicle_model        TEXT,
  vehicle_year         INTEGER           CHECK (vehicle_year IS NULL OR (vehicle_year >= 1900 AND vehicle_year <= 2100)),
  vehicle_reg_number   TEXT,
  chassis_number       TEXT,
  damage_description   TEXT,

  -- Health specific
  treatment_type       TEXT,
  hospital_name        TEXT,
  diagnosis            TEXT,
  treating_doctor      TEXT,
  admission_date       DATE,
  discharge_date       DATE,

  -- Shared fields
  injury_severity      injury_severity_level NOT NULL DEFAULT 'None',
  document_paths       JSONB             NOT NULL DEFAULT '[]',

  -- ML Priority Scoring
  priority_label       priority_label,
  priority_score       NUMERIC(5,4)      CHECK (priority_score IS NULL OR (priority_score >= 0 AND priority_score <= 1)),
  priority_reason      JSONB,

  created_at           TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_claims_claimant_id      ON claims (claimant_id);
CREATE INDEX IF NOT EXISTS idx_claims_officer_id       ON claims (assigned_officer_id);
CREATE INDEX IF NOT EXISTS idx_claims_status           ON claims (status);
CREATE INDEX IF NOT EXISTS idx_claims_priority_label   ON claims (priority_label);
CREATE INDEX IF NOT EXISTS idx_claims_created_at       ON claims (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_claims_policy_id        ON claims (policy_id);

-- 6. Claim Events Table
CREATE TABLE IF NOT EXISTS claim_events (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id        UUID         NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  actor_id        UUID         NOT NULL REFERENCES users(id)  ON DELETE RESTRICT,
  previous_status claim_status,
  new_status      claim_status NOT NULL,
  reason          TEXT,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_claim_events_claim_id   ON claim_events (claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_events_created_at ON claim_events (created_at ASC);

-- 7. Officer Notes Table
CREATE TABLE IF NOT EXISTS officer_notes (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id   UUID        NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  author_id  UUID        NOT NULL REFERENCES users(id)  ON DELETE RESTRICT,
  content    TEXT        NOT NULL CHECK (LENGTH(TRIM(content)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_officer_notes_claim_id ON officer_notes (claim_id);

-- 8. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id      UUID        REFERENCES users(id) ON DELETE SET NULL,
  action        TEXT        NOT NULL,
  resource_type TEXT        NOT NULL,
  resource_id   TEXT,
  metadata      JSONB       NOT NULL DEFAULT '{}',
  ip_address    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id   ON audit_logs (actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action     ON audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at DESC);

-- 9. Triggers
CREATE OR REPLACE FUNCTION fn_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

DROP TRIGGER IF EXISTS trg_claims_updated_at ON claims;
CREATE TRIGGER trg_claims_updated_at
  BEFORE UPDATE ON claims
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

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

DROP TRIGGER IF EXISTS trg_claims_claim_number ON claims;
CREATE TRIGGER trg_claims_claim_number
  BEFORE INSERT ON claims
  FOR EACH ROW EXECUTE FUNCTION fn_generate_claim_number();

-- 10. Seed Core Users (Password: Demo1234!)
INSERT INTO users (id, email, password_hash, role, full_name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'alice@demo.com', crypt('Demo1234!', gen_salt('bf', 10)), 'claimant', 'Alice Brown'),
  ('22222222-2222-2222-2222-222222222222', 'bob@demo.com', crypt('Demo1234!', gen_salt('bf', 10)), 'officer', 'Bob Martinez'),
  ('33333333-3333-3333-3333-333333333333', 'carol@demo.com', crypt('Demo1234!', gen_salt('bf', 10)), 'officer', 'Carol Singh'),
  ('44444444-4444-4444-4444-444444444444', 'dave@demo.com', crypt('Demo1234!', gen_salt('bf', 10)), 'supervisor', 'Dave Thompson')
ON CONFLICT (email) DO NOTHING;

-- 11. Seed Core Policies
INSERT INTO policies_mock (id, policy_number, type, holder_name, coverage_amount, currency, is_active, vehicle_category, vehicle_make, vehicle_model, vehicle_year, vehicle_reg_number, chassis_number) VALUES
  ('aaaa0001-0000-0000-0000-000000000001', 'AV-AUTO-00101', 'automobile', 'Alice Brown', 50000.00, 'USD', true, 'car', 'Toyota', 'Camry Sedan', 2022, 'KA-01-AB-1234', 'JT2BF22K1W0010199'),
  ('aaaa0002-0000-0000-0000-000000000002', 'AV-AUTO-00102', 'automobile', 'Bob Martinez', 40000.00, 'USD', true, 'car', 'Honda', 'Civic', 2021, 'MH-02-CD-5678', '1HGCR2F83MA0010288'),
  ('aaaa0003-0000-0000-0000-000000000003', 'AV-AUTO-00103', 'automobile', 'Carol Singh', 25000.00, 'USD', true, 'bike', 'Yamaha', 'YZF-R3 Sport', 2023, 'DL-03-EF-9012', 'JYARN39E2PA0010377'),
  ('aaaa0004-0000-0000-0000-000000000004', 'AV-AUTO-00104', 'automobile', 'Dave Thompson', 20000.00, 'USD', true, 'bike', 'Royal Enfield', 'Classic 350', 2022, 'KA-05-GH-3456', 'ME3U3S5F9NA0010466'),
  ('bbbb0001-0000-0000-0000-000000000001', 'AV-HLTH-00201', 'health', 'Alice Brown', 100000.00, 'USD', true, NULL, NULL, NULL, NULL, NULL, NULL),
  ('bbbb0002-0000-0000-0000-000000000002', 'AV-HLTH-00202', 'health', 'Bob Martinez', 75000.00, 'USD', true, NULL, NULL, NULL, NULL, NULL, NULL),
  ('bbbb0003-0000-0000-0000-000000000003', 'AV-HLTH-00203', 'health', 'Carol Singh', 150000.00, 'USD', true, NULL, NULL, NULL, NULL, NULL, NULL),
  ('bbbb0004-0000-0000-0000-000000000004', 'AV-HLTH-00204', 'health', 'Dave Thompson', 50000.00, 'USD', false, NULL, NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (policy_number) DO NOTHING;
