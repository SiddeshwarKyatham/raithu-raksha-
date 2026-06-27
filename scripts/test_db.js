import pkg from 'pg';
const { Pool } = pkg;

const connectionString = 'postgresql://neondb_owner:npg_Ygxok8HSc5iV@ep-shy-cherry-atarcz8y.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function main() {
  try {
    // Update status to 'Fundraising' for verified farmers that have 'NGO Submitted' status
    const updateResult = await pool.query(
      "UPDATE farmers SET status = 'Fundraising' WHERE verified = true AND status = 'NGO Submitted'"
    );
    console.log(`Updated ${updateResult.rowCount} farmers status to 'Fundraising'.`);

    // Verify current farmers status
    const { rows } = await pool.query('SELECT id, name, verified, status FROM farmers');
    console.log("Farmers in database after update:");
    console.log(JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error("DB Query/Update error:", error);
  } finally {
    await pool.end();
  }
}

main();
