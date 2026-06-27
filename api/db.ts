import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("WARNING: DATABASE_URL environment variable is not defined!");
}

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

const DEFAULT_FARMERS = [
  {
    name: "Ramesh Kumar",
    age: 45,
    district: "Warangal",
    village: "Parvathagiri",
    crop: "Cotton",
    disaster: "Pest Attack (Pink Bollworm)",
    goal: 40000,
    raised: 25000,
    landArea: "3.5 Acres",
    damage: "80%",
    image: "https://images.unsplash.com/photo-1608876537010-ac56d8731614?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBmYXJtZXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3ODE1NDcyODd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    story: "Ramesh has been farming cotton on his 3.5-acre ancestral land for the past two decades. This year, despite taking all precautionary measures, a severe pink bollworm infestation devastated his crop right before the harvest season. He had taken a private loan to cover the initial input costs, and now with 80% of the yield destroyed, he has no means to repay the debt or prepare for the next season. He lives with his wife, who also works on the farm, and two children who are currently in middle school. The family is entirely dependent on this single crop for their annual livelihood.",
    breakdown: [
      { item: "High-Quality Seeds", cost: 12000 },
      { item: "Pest-resistant Fertilizers", cost: 15000 },
      { item: "Initial Labor & Land Prep", cost: 13000 }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1666545743813-e692fb2b2430?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcnklMjBmYXJtJTIwbGFuZCUyMGluZGlhfGVufDF8fHx8MTc4MTU0NzI4OHww&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1681226298721-88cdb4096e5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBhZ3JpY3VsdHVyZSUyMGZpZWxkc3xlbnwxfHx8fDE3ODE1NDcyODh8MA&ixlib=rb-4.1.0&q=80&w=1080"
    ],
    timeline: [
      { title: "Report Submitted", description: "Farmer reached out via WhatsApp with photos.", date: "12 Oct", status: "completed" },
      { title: "Verified by NGO", description: "Field team visited the farm and verified the 80% damage.", date: "14 Oct", status: "completed" },
      { title: "Fundraising", description: "Currently raising funds for recovery.", date: "Ongoing", status: "active" }
    ],
    verified: true
  },
  {
    name: "Laxmi Bai",
    age: 52,
    district: "Nalgonda",
    village: "Choutuppal",
    crop: "Paddy",
    disaster: "Severe Drought",
    goal: 60000,
    raised: 10000,
    landArea: "4.0 Acres",
    damage: "90%",
    image: "https://images.unsplash.com/photo-1666545743813-e692fb2b2430?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcnklMjBmYXJtJTIwbGFuZCUyMGluZGlhfGVufDF8fHx8MTc4MTU0NzI4OHww&ixlib=rb-4.1.0&q=80&w=1080",
    story: "Laxmi Bai is a resilient paddy farmer in Nalgonda. The failure of the monsoon and depletion of groundwater dried up her borewell early in the season, leading to complete crop failure. She needs support to drill a deeper borewell and install a solar-powered micro-irrigation system to revive her farm for the next crop cycle. She is the sole breadwinner for her family, including her elderly mother and disabled sister.",
    breakdown: [
      { item: "Borewell Repair & Deepening", cost: 25000 },
      { item: "Micro-irrigation Drip Kit", cost: 20000 },
      { item: "Paddy Seeds & Organic Manure", cost: 15000 }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1608876537010-ac56d8731614?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBmYXJtZXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3ODE1NDcyODd8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1681226298721-88cdb4096e5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBhZ3JpY3VsdHVyZSUyMGZpZWxkc3xlbnwxfHx8fDE3ODE1NDcyODh8MA&ixlib=rb-4.1.0&q=80&w=1080"
    ],
    timeline: [
      { title: "Report Submitted", description: "Laxmi submitted crop damage proof through village coordinator.", date: "15 Oct", status: "completed" },
      { title: "Verified by NGO", description: "Borewell inspection completed by field coordinator.", date: "18 Oct", status: "completed" },
      { title: "Fundraising", description: "Currently raising funds for recovery.", date: "Ongoing", status: "active" }
    ],
    verified: true
  },
  {
    name: "Srinivas Reddy",
    age: 38,
    district: "Khammam",
    village: "Wyra",
    crop: "Chilli",
    disaster: "Floods",
    goal: 50000,
    raised: 45000,
    landArea: "2.5 Acres",
    damage: "75%",
    image: "https://images.unsplash.com/photo-1780342286779-1032160016be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB2aWxsYWdlJTIwY29tbXVuaXR5fGVufDF8fHx8MTc4MTU0NzI4OHww&ixlib=rb-4.1.0&q=80&w=1080",
    story: "Srinivas Reddy's chilli fields in Khammam were flooded during the unprecedented heavy rainfall. The standing crop, ready for harvest, was completely submerged and rotted. The flood has also caused severe soil erosion, requiring significant soil replenishment and labor before any planting can occur. Srinivas has two children whose school fees are due, and this loss has put him in a dire financial crisis.",
    breakdown: [
      { item: "Soil Replenishment & Land Prep", cost: 15000 },
      { item: "Hybrid Chilli Saplings", cost: 18000 },
      { item: "Organic Fertilizers & Biopesticides", cost: 17000 }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1681226298721-88cdb4096e5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBhZ3JpY3VsdHVyZSUyMGZpZWxkc3xlbnwxfHx8fDE3ODE1NDcyODh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1666545743813-e692fb2b2430?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcnklMjBmYXJtJTIwbGFuZCUyMGluZGlhfGVufDF8fHx8MTc4MTU0NzI4OHww&ixlib=rb-4.1.0&q=80&w=1080"
    ],
    timeline: [
      { title: "Report Submitted", description: "Reported damage with geo-tagged photos of flooded fields.", date: "10 Oct", status: "completed" },
      { title: "Verified by NGO", description: "Physical assessment of soil erosion done by agricultural expert.", date: "12 Oct", status: "completed" },
      { title: "Fundraising", description: "Currently raising funds for recovery.", date: "Ongoing", status: "active" }
    ],
    verified: true
  },
  {
    name: "Venkataiah",
    age: 60,
    district: "Mahabubnagar",
    village: "Jadcherla",
    crop: "Maize",
    disaster: "Crop Failure (Heatwave)",
    goal: 30000,
    raised: 5000,
    landArea: "3.0 Acres",
    damage: "70%",
    image: "https://images.unsplash.com/photo-1681226298721-88cdb4096e5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBhZ3JpY3VsdHVyZSUyMGZpZWxkc3xlbnwxfHx8fDE3ODE1NDcyODh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    story: "Venkataiah is an elderly farmer in Mahabubnagar who has been cultivating maize. This summer's intense heatwave and lack of irrigation facilities caused the crop to wither before maturity. Venkataiah requires financial support to clear the dry crops, prepare the soil, and purchase heat-tolerant maize seeds for the upcoming season to recover his losses.",
    breakdown: [
      { item: "Clearing & Soil Prep", cost: 8000 },
      { item: "Heat-tolerant Maize Seeds", cost: 10000 },
      { item: "Organic Fertilizer", cost: 12000 }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1666545743813-e692fb2b2430?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcnklMjBmYXJtJTIwbGFuZCUyMGluZGlhfGVufDF8fHx8MTc4MTU0NzI4OHww&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1608876537010-ac56d8731614?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBmYXJtZXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3ODE1NDcyODd8MA&ixlib=rb-4.1.0&q=80&w=1080"
    ],
    timeline: [
      { title: "Report Submitted", description: "Reported with photos of parched fields.", date: "18 Oct", status: "completed" },
      { title: "Verified by NGO", description: "Heat damage verified by district representative.", date: "21 Oct", status: "completed" },
      { title: "Fundraising", description: "Currently raising funds for recovery.", date: "Ongoing", status: "active" }
    ],
    verified: true
  }
];

const DEFAULT_DONATIONS = [
  { farmerName: "Ramesh Kumar", donorName: "Aravind Kumar", amount: 5000, message: "Hope you recover soon, Ramesh! We are standing with you.", date: "2 hours ago" },
  { farmerName: "Ramesh Kumar", donorName: "Sneha Reddy", amount: 2000, message: "Supporting seed purchase for Warangal's cotton fields.", date: "5 hours ago" },
  { farmerName: "Laxmi Bai", donorName: "Vikram Sharma", amount: 10000, message: "For borewell repair. Direct farmer support is a great initiative.", date: "Yesterday" },
  { farmerName: "Srinivas Reddy", donorName: "Pranati G.", amount: 15000, message: "Soil replenishment is critical post-flood. Best wishes.", date: "2 days ago" }
];

export async function initDB() {
  const client = await pool.connect();
  try {
    // Create Farmers Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS farmers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        age INT NOT NULL,
        district VARCHAR(100) NOT NULL,
        village VARCHAR(100) NOT NULL,
        crop VARCHAR(100) NOT NULL,
        disaster VARCHAR(255) NOT NULL,
        goal INT NOT NULL,
        raised INT NOT NULL DEFAULT 0,
        land_area VARCHAR(50) NOT NULL,
        damage VARCHAR(50) NOT NULL,
        image TEXT NOT NULL,
        story TEXT NOT NULL,
        breakdown JSONB NOT NULL,
        gallery JSONB NOT NULL,
        timeline JSONB NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        farmer_phone VARCHAR(20),
        requested_amount INT DEFAULT 0,
        video_proof TEXT,
        image_proofs JSONB DEFAULT '[]'::jsonb,
        location_link TEXT,
        status VARCHAR(50) DEFAULT 'NGO Submitted',
        verification_token VARCHAR(255) UNIQUE,
        token_expiry TIMESTAMP,
        token_used BOOLEAN DEFAULT FALSE,
        bank_details JSONB DEFAULT '{}'::jsonb
      )
    `);

    // Run migrations to alter existing table if columns are missing
    await client.query(`
      ALTER TABLE farmers ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'NGO Submitted';
      ALTER TABLE farmers ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255) UNIQUE;
      ALTER TABLE farmers ADD COLUMN IF NOT EXISTS token_expiry TIMESTAMP;
      ALTER TABLE farmers ADD COLUMN IF NOT EXISTS token_used BOOLEAN DEFAULT FALSE;
      ALTER TABLE farmers ADD COLUMN IF NOT EXISTS bank_details JSONB DEFAULT '{}'::jsonb;
    `);

    // Create Donations Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS donations (
        id SERIAL PRIMARY KEY,
        farmer_id INT,
        farmer_name VARCHAR(100) NOT NULL,
        donor_name VARCHAR(100) NOT NULL,
        amount INT NOT NULL,
        message TEXT,
        date VARCHAR(100) NOT NULL
      )
    `);

    // Seed Farmers Table if empty
    const checkFarmers = await client.query('SELECT COUNT(*) FROM farmers');
    if (parseInt(checkFarmers.rows[0].count) === 0) {
      console.log("Seeding initial farmers into PostgreSQL...");
      for (const f of DEFAULT_FARMERS) {
        await client.query(`
          INSERT INTO farmers (name, age, district, village, crop, disaster, goal, raised, land_area, damage, image, story, breakdown, gallery, timeline, verified, farmer_phone, requested_amount, video_proof, image_proofs, location_link, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
        `, [
          f.name, f.age, f.district, f.village, f.crop, f.disaster, f.goal, f.raised, f.landArea, f.damage, f.image, f.story,
          JSON.stringify(f.breakdown), JSON.stringify(f.gallery), JSON.stringify(f.timeline), f.verified,
          "9876543210", f.goal, null, JSON.stringify([]), `https://maps.google.com/?q=${encodeURIComponent(f.village + ", " + f.district)}`,
          f.verified ? 'Fundraising' : 'NGO Submitted'
        ]);
      }
      
      // Fetch seeded farmers to link seed donations
      const farmersResult = await client.query('SELECT id, name FROM farmers');
      
      // Seed Donations Table if empty
      const checkDonations = await client.query('SELECT COUNT(*) FROM donations');
      if (parseInt(checkDonations.rows[0].count) === 0) {
        console.log("Seeding initial donations into PostgreSQL...");
        for (const d of DEFAULT_DONATIONS) {
          const matchedFarmer = farmersResult.rows.find(rf => rf.name === d.farmerName);
          const farmerId = matchedFarmer ? matchedFarmer.id : null;
          await client.query(`
            INSERT INTO donations (farmer_id, farmer_name, donor_name, amount, message, date)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [farmerId, d.farmerName, d.donorName, d.amount, d.message, d.date]);
        }
      }
    }
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  } finally {
    client.release();
  }
}
