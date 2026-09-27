const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../database/claimdesk.sqlite');

const schema = `
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'claimant',
  full_name TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

CREATE TABLE policies_mock (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  policy_number TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  holder_name TEXT NOT NULL,
  coverage_amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  is_active INTEGER NOT NULL DEFAULT 1,
  vehicle_category TEXT DEFAULT 'car',
  vehicle_make TEXT,
  vehicle_model TEXT,
  vehicle_year INTEGER,
  vehicle_reg_number TEXT,
  chassis_number TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_policies_number ON policies_mock (policy_number);
CREATE INDEX IF NOT EXISTS idx_policies_type ON policies_mock (type);

CREATE TABLE claim_number_seq (
  id INTEGER PRIMARY KEY AUTOINCREMENT
);

CREATE TABLE claims (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  claim_number TEXT UNIQUE,
  claimant_id TEXT NOT NULL REFERENCES users(id),
  policy_id TEXT NOT NULL REFERENCES policies_mock(id),
  assigned_officer_id TEXT REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  incident_date TEXT NOT NULL,
  claim_amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'submitted',
  incident_type TEXT,
  vehicle_category TEXT DEFAULT 'car',
  vehicle_make TEXT,
  vehicle_model TEXT,
  vehicle_year INTEGER,
  vehicle_reg_number TEXT,
  chassis_number TEXT,
  damage_description TEXT,
  treatment_type TEXT,
  hospital_name TEXT,
  diagnosis TEXT,
  treating_doctor TEXT,
  admission_date TEXT,
  discharge_date TEXT,
  injury_severity TEXT NOT NULL DEFAULT 'None',
  document_paths TEXT NOT NULL DEFAULT '[]',
  priority_label TEXT,
  priority_score REAL,
  priority_reason TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_claims_claimant ON claims (claimant_id);
CREATE INDEX IF NOT EXISTS idx_claims_officer ON claims (assigned_officer_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims (status);
CREATE INDEX IF NOT EXISTS idx_claims_priority ON claims (priority_label);

CREATE TRIGGER IF NOT EXISTS trg_claims_claim_number
AFTER INSERT ON claims
FOR EACH ROW
WHEN NEW.claim_number IS NULL
BEGIN
  INSERT INTO claim_number_seq (id) VALUES (NULL);
  UPDATE claims SET claim_number = 'AV-CLAIM-' || strftime('%Y%m%d', 'now') || '-' || printf('%04d', (SELECT MAX(id) FROM claim_number_seq))
  WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_claims_updated_at
AFTER UPDATE ON claims
FOR EACH ROW
BEGIN
  UPDATE claims SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TABLE claim_events (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  claim_id TEXT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  actor_id TEXT NOT NULL REFERENCES users(id),
  previous_status TEXT,
  new_status TEXT NOT NULL,
  reason TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_claim_events_claim ON claim_events (claim_id);

CREATE TABLE officer_notes (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  claim_id TEXT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_officer_notes_claim ON officer_notes (claim_id);

CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  actor_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  metadata TEXT NOT NULL DEFAULT '{}',
  ip_address TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs (actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs (resource_id);
`;

const seed = `
-- Demo Users (Password: Demo1234!)
INSERT INTO users (id, email, password_hash, role, full_name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'alice@demo.com', '$2a$10$wI5f3yI/7oQ4uOEKp4w3a.1X0s1s9Jp/d1.K/oF3Q5G6.y0G.30a.', 'claimant', 'Alice Brown'),
  ('22222222-2222-2222-2222-222222222222', 'bob@demo.com', '$2a$10$wI5f3yI/7oQ4uOEKp4w3a.1X0s1s9Jp/d1.K/oF3Q5G6.y0G.30a.', 'officer', 'Bob Martinez'),
  ('33333333-3333-3333-3333-333333333333', 'carol@demo.com', '$2a$10$wI5f3yI/7oQ4uOEKp4w3a.1X0s1s9Jp/d1.K/oF3Q5G6.y0G.30a.', 'officer', 'Carol Singh'),
  ('44444444-4444-4444-4444-444444444444', 'dave@demo.com', '$2a$10$wI5f3yI/7oQ4uOEKp4w3a.1X0s1s9Jp/d1.K/oF3Q5G6.y0G.30a.', 'supervisor', 'Dave Thompson');

-- Policies (Automobile Car, Automobile Bike, Health)
INSERT INTO policies_mock (id, policy_number, type, holder_name, coverage_amount, currency, is_active, vehicle_category, vehicle_make, vehicle_model, vehicle_year, vehicle_reg_number, chassis_number) VALUES
  ('aaaa0001-0000-0000-0000-000000000001', 'AV-AUTO-00101', 'automobile', 'Alice Brown', 50000.00, 'USD', 1, 'car', 'Toyota', 'Camry', 2022, 'KA-01-AB-1234', 'AVTY984723948201'),
  ('aaaa0002-0000-0000-0000-000000000002', 'AV-AUTO-00102', 'automobile', 'Nexon Logistics Ltd.', 75000.00, 'USD', 1, 'car', 'Ford', 'Transit', 2023, 'MH-02-CD-5678', 'AVFD839201948572'),
  ('aaaa0003-0000-0000-0000-000000000003', 'AV-AUTO-00103', 'automobile', 'Alice Brown', 25000.00, 'USD', 1, 'bike', 'Yamaha', 'YZF-R3', 2023, 'DL-03-EF-9012', 'AVYM482910385721'),
  ('aaaa0004-0000-0000-0000-000000000004', 'AV-AUTO-00104', 'automobile', 'Alice Brown', 18000.00, 'USD', 1, 'bike', 'Royal Enfield', 'Classic 350', 2022, 'KA-05-GH-3456', 'AVRE739201847582'),
  ('hhhh0001-0000-0000-0000-000000000001', 'AV-HLTH-00201', 'health', 'Alice Brown', 100000.00, 'USD', 1, 'car', NULL, NULL, NULL, NULL, NULL);

-- Seed Sample Claims
INSERT INTO claims (
  id, claimant_id, policy_id, assigned_officer_id,
  title, description, incident_date, claim_amount, currency, status,
  incident_type, vehicle_category, vehicle_make, vehicle_model, vehicle_year, vehicle_reg_number, chassis_number, damage_description,
  injury_severity, document_paths, priority_label, priority_score, priority_reason, claim_number
) VALUES (
  'cccc0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'aaaa0001-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222',
  'Front-end collision on NH-48 highway', 'Significant front-end damage to Toyota Camry.', '2026-09-20', 18500.00, 'USD', 'submitted',
  'Collision', 'car', 'Toyota', 'Camry', 2022, 'KA-01-AB-1234', 'AVTY984723948201', 'Front bumper destroyed, radiator leak.',
  'Minor', '[]', 'priority', 0.8731, '[{"feature":"claim_amount","impact":"+0.25"},{"feature":"injury_severity","impact":"+0.10"}]', 'AV-CLAIM-20260920-0001'
);

INSERT INTO claim_events (claim_id, actor_id, new_status, reason) VALUES
  ('cccc0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'submitted', 'Initial claim submission by policyholder');
`;

async function run() {
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await db.exec('PRAGMA foreign_keys = ON;');
  await db.exec(schema);
  await db.exec(seed);
  console.log('✅ SQLite database created and seeded successfully with full schema.');
}

if (require.main === module) {
  run().catch(console.error);
}

module.exports = { run };
