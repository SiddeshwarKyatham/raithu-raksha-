import { v2 as cloudinary } from 'cloudinary';

// Configure cloudinary using CLOUDINARY_URL or explicit keys if available
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_api_url: process.env.CLOUDINARY_URL
  });
} else {
  console.warn("WARNING: CLOUDINARY_URL is not set in environment variables!");
}

export default cloudinary;
