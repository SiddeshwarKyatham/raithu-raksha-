import { v2 as cloudinary } from 'cloudinary';
import pg from 'pg';
const { Pool } = pg;

// 1. Validate environment variables
const dbUrl = process.env.DATABASE_URL;
const cloudinaryUrl = process.env.CLOUDINARY_URL;

if (!dbUrl) {
  console.error("ERROR: DATABASE_URL is not set.");
  process.exit(1);
}

if (!cloudinaryUrl) {
  console.error("ERROR: CLOUDINARY_URL is not set.");
  process.exit(1);
}

console.log("Environment variables verified.");

// 2. Configure Cloudinary
cloudinary.config({
  cloudinary_api_url: cloudinaryUrl
});

// 3. Define a tiny 1x1 transparent PNG base64 string
const mockBase64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

async function runTest() {
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // A. Upload image to Cloudinary with compression & optimization
    console.log("Uploading optimized mock base64 image to Cloudinary (Folder: rithu-raksha/test_uploads)...");
    const uploadResult = await cloudinary.uploader.upload(mockBase64Image, {
      resource_type: 'image',
      folder: 'rithu-raksha/test_uploads',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto:good' }
      ]
    });

    const imageUrl = uploadResult.secure_url;
    console.log("Upload successful!");
    console.log("Cloudinary URL:", imageUrl);
    console.log("Public ID:", uploadResult.public_id);
    console.log("Stored Format:", uploadResult.format);
    console.log("File Size (bytes):", uploadResult.bytes);

    // B. Insert into DB
    console.log("Connecting to database...");
    const client = await pool.connect();
    
    try {
      console.log("Inserting test farmer profile...");
      const insertQuery = `
        INSERT INTO farmers (
          name, age, district, village, crop, disaster, goal, raised, 
          land_area, damage, image, story, breakdown, gallery, timeline, 
          verified, farmer_phone, requested_amount, video_proof, image_proofs, location_link
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        RETURNING *
      `;
      
      const values = [
        "Cloudinary Compression Test Farmer",
        45,
        "Warangal",
        "Test Village",
        "Cotton",
        "Pest Attack (50% Damage)",
        50000,
        0,
        "2.5 Acres",
        "50%",
        imageUrl,
        "Verification test case for Cloudinary image compression and optimization.",
        JSON.stringify([]),
        JSON.stringify([imageUrl]),
        JSON.stringify([]),
        false,
        "9999999999",
        50000,
        null,
        JSON.stringify([imageUrl]),
        "https://maps.google.com/?q=Test"
      ];

      const res = await client.query(insertQuery, values);
      const insertedFarmer = res.rows[0];
      console.log("Farmer profile inserted with ID:", insertedFarmer.id);

      // C. Query and Verify
      console.log("Querying inserted farmer to verify stored values...");
      const selectRes = await client.query("SELECT * FROM farmers WHERE id = $1", [insertedFarmer.id]);
      
      if (selectRes.rows.length === 0) {
        throw new Error("Failed to retrieve the inserted farmer!");
      }
      
      const retrieved = selectRes.rows[0];
      console.log("Retrieved Farmer Name:", retrieved.name);
      console.log("Retrieved Image URL:", retrieved.image);

      // Assertions
      if (retrieved.image !== imageUrl) {
        throw new Error(`Verification FAILED: Stored image URL does not match uploaded URL`);
      }

      console.log("\n>>> SUCCESS: Image uploading and database storage verification passed! <<<");
      console.log("NOTE: Cleanup disabled. The test image and database record have been left intact.");
      console.log(`Cloudinary folder path: rithu-raksha/test_uploads`);
      console.log(`To delete this database row later, use: DELETE FROM farmers WHERE id = ${insertedFarmer.id};\n`);

    } catch (err) {
      console.error("Test steps execution failed:", err);
      throw err;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error("Integration test failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runTest();
