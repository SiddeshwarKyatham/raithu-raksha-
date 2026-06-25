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
    console.log("Starting database schema migration to add location_link...");

    // Add location_link column
    console.log("Adding 'location_link' column to 'farmers' table...");
    await client.query(`
      ALTER TABLE farmers 
      ADD COLUMN IF NOT EXISTS location_link TEXT
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
