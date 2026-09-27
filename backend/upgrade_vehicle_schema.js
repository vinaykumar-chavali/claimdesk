const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../database/claimdesk.sqlite');

db.serialize(() => {
  // Add columns to policies_mock
  const policyCols = [
    "ALTER TABLE policies_mock ADD COLUMN vehicle_category TEXT DEFAULT 'car'",
    "ALTER TABLE policies_mock ADD COLUMN vehicle_make TEXT",
    "ALTER TABLE policies_mock ADD COLUMN vehicle_model TEXT",
    "ALTER TABLE policies_mock ADD COLUMN vehicle_year INTEGER",
    "ALTER TABLE policies_mock ADD COLUMN vehicle_reg_number TEXT",
    "ALTER TABLE policies_mock ADD COLUMN chassis_number TEXT"
  ];

  policyCols.forEach(sql => {
    db.run(sql, (err) => {
      // Ignore if column already exists
    });
  });

  // Add columns to claims
  const claimCols = [
    "ALTER TABLE claims ADD COLUMN vehicle_category TEXT DEFAULT 'car'",
    "ALTER TABLE claims ADD COLUMN chassis_number TEXT"
  ];

  claimCols.forEach(sql => {
    db.run(sql, (err) => {
      // Ignore if column already exists
    });
  });

  // Update policy 1 (Car)
  db.run(`
    UPDATE policies_mock 
    SET vehicle_category = 'car', 
        vehicle_make = 'Toyota', 
        vehicle_model = 'Camry', 
        vehicle_year = 2022, 
        vehicle_reg_number = 'KA-01-AB-1234', 
        chassis_number = 'AVTY984723948201'
    WHERE policy_number = 'AV-AUTO-00101'
  `);

  // Update policy 2 (Car)
  db.run(`
    UPDATE policies_mock 
    SET vehicle_category = 'car', 
        vehicle_make = 'Ford', 
        vehicle_model = 'Transit', 
        vehicle_year = 2023, 
        vehicle_reg_number = 'MH-02-CD-5678', 
        chassis_number = 'AVFD839201948572'
    WHERE policy_number = 'AV-AUTO-00102'
  `);

  // Insert or replace Bike policies
  db.run(`
    INSERT OR REPLACE INTO policies_mock (id, policy_number, type, holder_name, coverage_amount, currency, is_active, vehicle_category, vehicle_make, vehicle_model, vehicle_year, vehicle_reg_number, chassis_number)
    VALUES 
    ('aaaa0003-0000-0000-0000-000000000003', 'AV-AUTO-00103', 'automobile', 'Alice Brown', 25000.00, 'USD', 1, 'bike', 'Yamaha', 'YZF-R3', 2023, 'DL-03-EF-9012', 'AVYM482910385721'),
    ('aaaa0004-0000-0000-0000-000000000004', 'AV-AUTO-00104', 'automobile', 'Alice Brown', 18000.00, 'USD', 1, 'bike', 'Royal Enfield', 'Classic 350', 2022, 'KA-05-GH-3456', 'AVRE739201847582')
  `);

  db.all("SELECT policy_number, type, vehicle_category, vehicle_make, vehicle_model, vehicle_reg_number, chassis_number FROM policies_mock", (err, rows) => {
    if (err) console.error(err);
    else console.log('Updated policies:', rows);
  });
});
