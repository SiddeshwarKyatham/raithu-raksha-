import pg from 'pg';
import { v2 as cloudinary } from 'cloudinary';
const { Pool } = pg;

const dbUrl = process.env.DATABASE_URL;
const cloudinaryUrl = process.env.CLOUDINARY_URL;

if (!dbUrl || !cloudinaryUrl) {
  console.error("ERROR: Make sure DATABASE_URL and CLOUDINARY_URL are defined.");
  process.exit(1);
}

cloudinary.config({
  cloudinary_api_url: cloudinaryUrl
});

const pool = new Pool({
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

async function migrateImages() {
  const client = await pool.connect();
  try {
    console.log("Fetching farmers from database...");
    const { rows: farmers } = await client.query("SELECT id, name, image, gallery, image_proofs FROM farmers ORDER BY id ASC");
    
    console.log(`Found ${farmers.length} farmers in database.`);
    
    for (const farmer of farmers) {
      console.log(`\n--------------------------------------------`);
      console.log(`Processing farmer: ${farmer.name} (ID: ${farmer.id})`);
      
      let updatedImage = farmer.image;
      let updatedGallery = Array.isArray(farmer.gallery) ? farmer.gallery : [];
      let galleryChanged = false;
      let mainImageChanged = false;

      // 1. Check and upload main image if it's not already on Cloudinary
      if (farmer.image && !farmer.image.includes("res.cloudinary.com")) {
        console.log(`Uploading main image to Cloudinary: ${farmer.image}`);
        try {
          const uploadResult = await cloudinary.uploader.upload(farmer.image, {
            resource_type: 'image',
            folder: 'rithu-raksha/farmers',
            transformation: [
              { width: 1200, height: 1200, crop: 'limit' },
              { quality: 'auto:good' }
            ]
          });
          updatedImage = uploadResult.secure_url;
          mainImageChanged = true;
          console.log(`-> Main image uploaded successfully! New URL: ${updatedImage}`);
        } catch (uploadErr) {
          console.error(`Failed to upload main image for ${farmer.name}:`, uploadErr.message);
        }
      } else {
        console.log("Main image is already hosted on Cloudinary or is empty. Skipping.");
      }

      // 2. Check and upload gallery images
      const newGallery = [];
      for (let i = 0; i < updatedGallery.length; i++) {
        const galImage = updatedGallery[i];
        if (galImage && !galImage.includes("res.cloudinary.com")) {
          console.log(`Uploading gallery image ${i + 1}/${updatedGallery.length}: ${galImage}`);
          try {
            const uploadResult = await cloudinary.uploader.upload(galImage, {
              resource_type: 'image',
              folder: 'rithu-raksha/farmers',
              transformation: [
                { width: 1200, height: 1200, crop: 'limit' },
                { quality: 'auto:good' }
              ]
            });
            newGallery.push(uploadResult.secure_url);
            galleryChanged = true;
            console.log(`-> Gallery image ${i + 1} uploaded successfully! New URL: ${uploadResult.secure_url}`);
          } catch (uploadErr) {
            console.error(`Failed to upload gallery image ${i + 1} for ${farmer.name}:`, uploadErr.message);
            newGallery.push(galImage); // Keep the old one as fallback if upload fails
          }
        } else {
          newGallery.push(galImage);
        }
      }
      updatedGallery = newGallery;

      // 3. Update database if anything changed
      if (mainImageChanged || galleryChanged) {
        console.log(`Updating database record for ${farmer.name}...`);
        
        // Also update image_proofs to match the new gallery/image if it was empty
        let updatedImageProofs = farmer.image_proofs;
        if (!updatedImageProofs || updatedImageProofs.length === 0 || (Array.isArray(updatedImageProofs) && updatedImageProofs.length === 0)) {
          updatedImageProofs = mainImageChanged ? [updatedImage] : [farmer.image];
        } else if (Array.isArray(updatedImageProofs)) {
          // Map external URLs in image_proofs if any
          updatedImageProofs = updatedImageProofs.map(proofUrl => {
            if (proofUrl === farmer.image && mainImageChanged) return updatedImage;
            return proofUrl;
          });
        }

        await client.query(
          `UPDATE farmers 
           SET image = $1, gallery = $2, image_proofs = $3 
           WHERE id = $4`,
          [updatedImage, JSON.stringify(updatedGallery), JSON.stringify(updatedImageProofs), farmer.id]
        );
        console.log(`-> Database updated successfully!`);
      } else {
        console.log(`No changes needed for ${farmer.name}.`);
      }
    }
    
    console.log("\n============================================");
    console.log("Migration complete!");
    console.log("============================================\n");
    
  } catch (error) {
    console.error("Migration script failed:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

migrateImages();
