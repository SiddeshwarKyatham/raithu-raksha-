import pg from 'pg';
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("ERROR: DATABASE_URL environment variable is not defined!");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log("Starting database schema migration...");

    // 1. Add farmer_phone column
    console.log("Adding 'farmer_phone' column to 'farmers' table...");
    await client.query(`
      ALTER TABLE farmers 
      ADD COLUMN IF NOT EXISTS farmer_phone VARCHAR(20)
    `);

    // 2. Add requested_amount column
    console.log("Adding 'requested_amount' column to 'farmers' table...");
    await client.query(`
      ALTER TABLE farmers 
      ADD COLUMN IF NOT EXISTS requested_amount INT DEFAULT 0
    `);

    // 3. Add video_proof column
    console.log("Adding 'video_proof' column to 'farmers' table...");
    await client.query(`
      ALTER TABLE farmers 
      ADD COLUMN IF NOT EXISTS video_proof TEXT
    `);

    // 4. Add image_proofs column
    console.log("Adding 'image_proofs' column to 'farmers' table...");
    await client.query(`
      ALTER TABLE farmers 
      ADD COLUMN IF NOT EXISTS image_proofs JSONB DEFAULT '[]'::jsonb
    `);

    // 5. Backfill requested_amount with goal for existing cases
    console.log("Backfilling 'requested_amount' with 'goal' for existing rows...");
    await client.query(`
      UPDATE farmers 
      SET requested_amount = goal 
      WHERE requested_amount = 0 OR requested_amount IS NULL
    `);

    console.log("Database migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
