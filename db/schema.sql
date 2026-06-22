-- ReLoop Database Schema

-- Users & Institutions
CREATE TABLE institutions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100),
  state VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'dept_head', 'buyer', 'recycler')),
  institution_id INTEGER REFERENCES institutions(id),
  department VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Oil Exchange
CREATE TABLE oil_listings (
  id SERIAL PRIMARY KEY,
  listing_code VARCHAR(20) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  oil_type VARCHAR(100) NOT NULL,
  quantity_liters NUMERIC(10,2) NOT NULL,
  grade VARCHAR(10) NOT NULL CHECK (grade IN ('A', 'B', 'C')),
  ai_price_min NUMERIC(10,2),
  ai_price_max NUMERIC(10,2),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'matched', 'completed', 'cancelled')),
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE oil_bids (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER REFERENCES oil_listings(id),
  buyer_id INTEGER REFERENCES users(id),
  bid_price NUMERIC(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Pickups
CREATE TABLE pickups (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  listing_id INTEGER REFERENCES oil_listings(id),
  pickup_type VARCHAR(20) NOT NULL CHECK (pickup_type IN ('oil', 'ewaste', 'both')),
  quantity VARCHAR(50),
  scheduled_date DATE NOT NULL,
  time_slot VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'requested' CHECK (status IN ('requested', 'scheduled', 'confirmed', 'collected', 'cancelled')),
  driver_name VARCHAR(100),
  location TEXT DEFAULT 'Symbiosis University, Indore',
  certificate_url TEXT,
  revenue NUMERIC(10,2),
  buyer_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- E-Waste
CREATE TABLE ewaste_listings (
  id SERIAL PRIMARY KEY,
  listing_code VARCHAR(20) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  item_name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('laptop', 'mobile', 'monitor', 'battery', 'accessories', 'other')),
  brand VARCHAR(100),
  condition VARCHAR(20) NOT NULL CHECK (condition IN ('working', 'repairable', 'dead', 'mixed')),
  ai_triage VARCHAR(20) CHECK (ai_triage IN ('resell', 'repair', 'recycle', 'donate')),
  ai_price_min NUMERIC(10,2),
  ai_price_max NUMERIC(10,2),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'listed', 'matched', 'completed', 'cancelled')),
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Rainwater
CREATE TABLE buildings (
  id SERIAL PRIMARY KEY,
  institution_id INTEGER REFERENCES institutions(id),
  name VARCHAR(255) NOT NULL,
  catchment_area_m2 NUMERIC(10,2) NOT NULL,
  runoff_coefficient NUMERIC(4,3) NOT NULL DEFAULT 0.85,
  has_harvesting_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE rainfall_records (
  id SERIAL PRIMARY KEY,
  building_id INTEGER REFERENCES buildings(id),
  recorded_month DATE NOT NULL,
  rainfall_mm NUMERIC(8,2),
  harvested_liters NUMERIC(10,2),
  forecast_liters NUMERIC(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Compliance Docs
CREATE TABLE compliance_docs (
  id SERIAL PRIMARY KEY,
  doc_code VARCHAR(20) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  pickup_id INTEGER REFERENCES pickups(id),
  doc_type VARCHAR(50) NOT NULL CHECK (doc_type IN ('fssai', 'cpcb', 'ewaste_auth', 'esg_report')),
  doc_name VARCHAR(255) NOT NULL,
  issued_date DATE NOT NULL,
  expires_date DATE,
  quantity VARCHAR(50),
  buyer_name VARCHAR(100),
  status VARCHAR(20) DEFAULT 'valid' CHECK (status IN ('valid', 'expired', 'pending')),
  file_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Impact / Reports
CREATE TABLE impact_records (
  id SERIAL PRIMARY KEY,
  institution_id INTEGER REFERENCES institutions(id),
  recorded_month DATE NOT NULL,
  oil_collected_liters NUMERIC(10,2) DEFAULT 0,
  ewaste_items INTEGER DEFAULT 0,
  water_saved_liters NUMERIC(10,2) DEFAULT 0,
  co2_saved_tons NUMERIC(8,3) DEFAULT 0,
  revenue_oil NUMERIC(12,2) DEFAULT 0,
  revenue_ewaste NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
