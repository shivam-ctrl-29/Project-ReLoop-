-- Seed Data for ReLoop

-- Institution
INSERT INTO institutions (name, city, state) VALUES
  ('Symbiosis University of Applied Sciences', 'Indore', 'Madhya Pradesh');

-- Users (password: 'password123' hashed)
INSERT INTO users (name, email, password_hash, role, institution_id, department) VALUES
  ('Suraj Upadhyay', 'suraj@symbiosis.edu.in', '$2b$10$rJ4Kv8zQ9mL2nP6wX3yKuOQk1vL5Hm8JdN2sT7rY4eC0pW6bA9fGi', 'dept_head', 1, 'Hostel Mess'),
  ('Admin User', 'admin@symbiosis.edu.in', '$2b$10$rJ4Kv8zQ9mL2nP6wX3yKuOQk1vL5Hm8JdN2sT7rY4eC0pW6bA9fGi', 'admin', 1, 'Administration'),
  ('GreenFuel Buyer', 'buyer@greenfuel.in', '$2b$10$rJ4Kv8zQ9mL2nP6wX3yKuOQk1vL5Hm8JdN2sT7rY4eC0pW6bA9fGi', 'buyer', NULL, NULL);

-- Oil Listings
INSERT INTO oil_listings (listing_code, user_id, oil_type, quantity_liters, grade, ai_price_min, ai_price_max, status) VALUES
  ('OIL-001', 1, 'Cooking Oil (Refined)', 120, 'A', 28.00, 32.00, 'active'),
  ('OIL-002', 1, 'Palm Oil (Used)', 80, 'B', 18.00, 22.00, 'matched'),
  ('OIL-003', 1, 'Lubricant Oil', 45, 'C', 10.00, 14.00, 'pending'),
  ('OIL-004', 1, 'Mustard Oil (Used)', 200, 'A', 30.00, 35.00, 'active');

-- Pickups
INSERT INTO pickups (user_id, pickup_type, quantity, scheduled_date, time_slot, status, driver_name, revenue, buyer_name) VALUES
  (1, 'oil', '120 L', '2026-06-18', '9:00 AM – 11:00 AM', 'collected', 'Ramesh K.', 3600.00, 'GreenFuel Indore'),
  (1, 'oil', '80 L',  '2026-06-24', '9:00 AM – 11:00 AM', 'scheduled', 'Pending', NULL, 'BioDiesel Co.'),
  (1, 'oil', NULL,    '2026-06-30', '2:00 PM – 4:00 PM',  'requested', NULL, NULL, NULL),
  (1, 'oil', '85 L',  '2026-06-05', '9:00 AM – 11:00 AM', 'collected', 'Ramesh K.', 1870.00, 'BioDiesel Co.'),
  (1, 'oil', '200 L', '2026-05-20', '9:00 AM – 11:00 AM', 'collected', 'Suresh M.', 6000.00, 'GreenFuel Indore'),
  (1, 'ewaste', '8 items', '2026-06-12', '2:00 PM – 4:00 PM', 'collected', 'Tech Team', 22000.00, 'TechRecycle MP'),
  (1, 'ewaste', '3 items', '2026-05-28', '9:00 AM – 11:00 AM', 'collected', 'Tech Team', 8500.00, 'E-Cycle Hub'),
  (1, 'ewaste', '12 items', '2026-05-14', '2:00 PM – 4:00 PM', 'collected', 'Tech Team', 34000.00, 'TechRecycle MP');

-- E-Waste
INSERT INTO ewaste_listings (listing_code, user_id, item_name, category, brand, condition, ai_triage, ai_price_min, ai_price_max, status) VALUES
  ('EW-001', 1, 'Dell Laptop (2019)', 'laptop', 'Dell', 'working', 'resell', 8000, 10000, 'listed'),
  ('EW-002', 1, 'iPhone 11 (Cracked Screen)', 'mobile', 'Apple', 'repairable', 'repair', 5000, 6500, 'matched'),
  ('EW-003', 1, 'HP Monitor 22"', 'monitor', 'HP', 'working', 'resell', 3500, 4500, 'listed'),
  ('EW-004', 1, 'Lithium Battery Pack', 'battery', 'Generic', 'dead', 'recycle', 200, 400, 'pending'),
  ('EW-005', 1, 'USB Cables (x12)', 'accessories', 'Mixed', 'mixed', 'donate', 50, 150, 'listed');

-- Buildings
INSERT INTO buildings (institution_id, name, catchment_area_m2, runoff_coefficient, has_harvesting_system) VALUES
  (1, 'Main Academic Block', 2400, 0.85, TRUE),
  (1, 'Hostel Block A', 1800, 0.80, FALSE),
  (1, 'Sports Complex', 3200, 0.75, FALSE),
  (1, 'Admin Building', 900, 0.85, TRUE);

-- Rainfall Records (2026)
INSERT INTO rainfall_records (building_id, recorded_month, rainfall_mm, harvested_liters) VALUES
  (1, '2026-01-01', 8, 0), (1, '2026-02-01', 5, 0),
  (1, '2026-03-01', 18, 12000), (1, '2026-04-01', 35, 28000),
  (1, '2026-05-01', 82, 65000), (1, '2026-06-01', 120, 92000);

-- Compliance Docs
INSERT INTO compliance_docs (doc_code, user_id, doc_type, doc_name, issued_date, expires_date, quantity, buyer_name, status) VALUES
  ('CERT-001', 1, 'fssai', 'FSSAI Oil Disposal Certificate', '2026-06-18', '2027-06-18', '120 L', 'GreenFuel Indore', 'valid'),
  ('CERT-002', 1, 'fssai', 'FSSAI Oil Disposal Certificate', '2026-06-05', '2027-06-05', '85 L',  'BioDiesel Co.', 'valid'),
  ('CERT-003', 1, 'ewaste_auth', 'E-Waste Recycler Authorization', '2026-06-12', '2027-06-12', '8 items', 'TechRecycle MP', 'valid'),
  ('CERT-004', 1, 'cpcb', 'CPCB Recycling Certificate', '2026-05-28', '2027-05-28', '3 items', 'E-Cycle Hub', 'valid'),
  ('CERT-005', 1, 'fssai', 'FSSAI Oil Disposal Certificate', '2026-05-20', '2027-05-20', '200 L', 'GreenFuel Indore', 'valid');

-- Impact Records (2026)
INSERT INTO impact_records (institution_id, recorded_month, oil_collected_liters, ewaste_items, water_saved_liters, co2_saved_tons, revenue_oil, revenue_ewaste) VALUES
  (1, '2026-01-01', 280, 5,  4200, 1.2, 8400,  12000),
  (1, '2026-02-01', 320, 8,  5100, 1.5, 9600,  18000),
  (1, '2026-03-01', 290, 10, 4800, 1.3, 8700,  22000),
  (1, '2026-04-01', 410, 14, 6200, 1.8, 12300, 28000),
  (1, '2026-05-01', 485, 15, 8100, 2.1, 14550, 42500),
  (1, '2026-06-01', 340, 63, 9200, 2.4, 14200, 30500);
