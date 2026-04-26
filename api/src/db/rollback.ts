import { pool } from '../lib/prisma';

const rollbackStatements = `
DROP TABLE IF EXISTS gps_positions CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS routes CASCADE;
DROP TABLE IF EXISTS stations CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;
DROP TABLE IF EXISTS seats CASCADE;
DROP TABLE IF EXISTS buses CASCADE;
DROP TABLE IF EXISTS company_gallery CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS seat_status CASCADE;
DROP TYPE IF EXISTS seat_type CASCADE;
DROP TYPE IF EXISTS bus_status CASCADE;
DROP TYPE IF EXISTS bus_type CASCADE;
DROP TYPE IF EXISTS company_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP FUNCTION IF EXISTS update_updated_at CASCADE;
`;

const run = async () => {
  await pool.query(rollbackStatements);
  console.log('✅ Rollback effectué');
  await pool.end();
};

void run();
