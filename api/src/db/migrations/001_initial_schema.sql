-- ============================================================
-- VOYAGO — Migration initiale
-- Schéma complet de la base de données
-- ============================================================

-- Extension PostGIS pour la géolocalisation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- ─── ENUM Types ─────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('passenger', 'company_admin', 'driver', 'super_admin');
CREATE TYPE company_status AS ENUM ('pending', 'active', 'suspended');
CREATE TYPE bus_type AS ENUM ('standard', 'vip', 'climatise', 'minibus');
CREATE TYPE bus_status AS ENUM ('active', 'maintenance', 'inactive');
CREATE TYPE seat_type AS ENUM ('standard', 'vip');
CREATE TYPE seat_status AS ENUM ('available', 'reserved', 'locked');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE payment_method AS ENUM ('tmoney', 'flooz', 'cash');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- ─── TABLE : users ──────────────────────────────────────────
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'passenger',
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TABLE : companies ──────────────────────────────────────
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) UNIQUE NOT NULL,
  logo_url TEXT,
  banner_url TEXT,
  theme_color VARCHAR(7) DEFAULT '#50C9CE',
  slogan VARCHAR(200),
  description TEXT,
  phone VARCHAR(20),
  email VARCHAR(150),
  address TEXT,
  city VARCHAR(100),
  status company_status NOT NULL DEFAULT 'pending',
  certified BOOLEAN NOT NULL DEFAULT false,
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TABLE : company_gallery ────────────────────────────────
CREATE TABLE company_gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption VARCHAR(200),
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TABLE : buses ──────────────────────────────────────────
CREATE TABLE buses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  plate_number VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100),
  type bus_type NOT NULL DEFAULT 'standard',
  capacity INT NOT NULL CHECK (capacity > 0),
  status bus_status NOT NULL DEFAULT 'active',
  photo_url TEXT,
  amenities TEXT[], -- ex: ['wifi', 'climatisation', 'prises_usb']
  manufacture_year INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TABLE : seats ──────────────────────────────────────────
CREATE TABLE seats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bus_id UUID NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
  seat_number INT NOT NULL,
  type seat_type NOT NULL DEFAULT 'standard',
  row_pos INT NOT NULL,
  col_pos INT NOT NULL,
  UNIQUE(bus_id, seat_number)
);

-- ─── TABLE : drivers ────────────────────────────────────────
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  license_number VARCHAR(50) UNIQUE NOT NULL,
  license_expiry DATE NOT NULL,
  experience_years INT NOT NULL DEFAULT 0,
  photo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TABLE : stations ───────────────────────────────────────
CREATE TABLE stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  city VARCHAR(100) NOT NULL,
  address TEXT,
  location GEOGRAPHY(POINT, 4326), -- PostGIS
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TABLE : routes ─────────────────────────────────────────
CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  departure_station_id UUID NOT NULL REFERENCES stations(id),
  arrival_station_id UUID NOT NULL REFERENCES stations(id),
  distance_km DECIMAL(8,2),
  duration_min INT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (departure_station_id != arrival_station_id)
);

-- ─── TABLE : schedules ──────────────────────────────────────
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  bus_id UUID NOT NULL REFERENCES buses(id),
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  departure_time TIMESTAMPTZ NOT NULL,
  arrival_time TIMESTAMPTZ,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  available_seats INT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled', -- scheduled, boarding, in_progress, completed, cancelled
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TABLE : bookings ───────────────────────────────────────
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE RESTRICT,
  seat_id UUID NOT NULL REFERENCES seats(id),
  seat_number INT NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  qr_code TEXT UNIQUE,
  total_price DECIMAL(10,2) NOT NULL,
  passenger_name VARCHAR(100),
  passenger_phone VARCHAR(20),
  locked_until TIMESTAMPTZ, -- Verrouillage temporaire (10min)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(schedule_id, seat_id)
);

-- ─── TABLE : payments ───────────────────────────────────────
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  amount DECIMAL(10,2) NOT NULL,
  method payment_method NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  phone_number VARCHAR(20),
  reference VARCHAR(100) UNIQUE,
  gateway_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TABLE : reviews ────────────────────────────────────────
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, booking_id)
);

-- ─── TABLE : gps_positions ──────────────────────────────────
CREATE TABLE gps_positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  speed DECIMAL(5,2), -- km/h
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── INDEX pour les performances ────────────────────────────
CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_buses_company ON buses(company_id);
CREATE INDEX idx_schedules_route ON schedules(route_id);
CREATE INDEX idx_schedules_departure ON schedules(departure_time);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_schedule ON bookings(schedule_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_stations_location ON stations USING GIST(location);
CREATE INDEX idx_gps_positions_schedule ON gps_positions(schedule_id);
CREATE INDEX idx_gps_positions_time ON gps_positions(recorded_at DESC);

-- ─── Fonction : mise à jour automatique de updated_at ───────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers updated_at
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_buses_updated_at BEFORE UPDATE ON buses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_schedules_updated_at BEFORE UPDATE ON schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Données de test : Stations du Togo ─────────────────────
INSERT INTO stations (name, city, address, location) VALUES
  ('Gare de Lomé', 'Lomé', 'Boulevard du 13 Janvier, Lomé', ST_GeogFromText('SRID=4326;POINT(1.2136 6.1375)')),
  ('Gare d''Atakpamé', 'Atakpamé', 'Centre-ville, Atakpamé', ST_GeogFromText('SRID=4326;POINT(1.1273 7.5338)')),
  ('Gare de Sokodé', 'Sokodé', 'Rue principale, Sokodé', ST_GeogFromText('SRID=4326;POINT(1.1356 8.9833)')),
  ('Gare de Kara', 'Kara', 'Avenue de l''Indépendance, Kara', ST_GeogFromText('SRID=4326;POINT(1.1864 9.5511)')),
  ('Gare de Kpalimé', 'Kpalimé', 'Centre de Kpalimé', ST_GeogFromText('SRID=4326;POINT(0.6260 6.8999)')),
  ('Gare de Tsévié', 'Tsévié', 'Route nationale, Tsévié', ST_GeogFromText('SRID=4326;POINT(1.2179 6.4249)')),
  ('Gare de Dapaong', 'Dapaong', 'Centre-ville, Dapaong', ST_GeogFromText('SRID=4326;POINT(0.2085 10.8628)'));
