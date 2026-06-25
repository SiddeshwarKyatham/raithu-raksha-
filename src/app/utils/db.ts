export interface RequirementBreakdown {
  item: string;
  cost: number;
}

export interface TimelineItem {
  title: string;
  description: string;
  date: string;
  status: "completed" | "active" | "pending";
}

export interface Farmer {
  id: number;
  name: string;
  age: number;
  district: string;
  village: string;
  crop: string;
  disaster: string;
  goal: number;
  raised: number;
  landArea: string;
  damage: string;
  image: string;
  story: string;
  breakdown: RequirementBreakdown[];
  gallery: string[];
  timeline: TimelineItem[];
  verified: boolean;
  farmerPhone?: string;
  requestedAmount?: number;
  videoProof?: string;
  imageProofs?: string[];
  locationLink?: string;
}

export interface Donation {
  id: number;
  farmerId: number;
  farmerName: string;
  donorName: string;
  amount: number;
  message: string;
  date: string;
}

export async function getFarmers(): Promise<Farmer[]> {
  const res = await fetch('/api/farmers');
  if (!res.ok) throw new Error("Failed to fetch farmers");
  return res.json();
}

export async function getFarmerById(id: number): Promise<Farmer | undefined> {
  const farmers = await getFarmers();
  return farmers.find(f => f.id === id);
}

export async function addFarmer(farmerData: Omit<Farmer, "id" | "raised" | "gallery" | "timeline" | "verified">): Promise<Farmer> {
  const res = await fetch('/api/farmers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(farmerData)
  });
  if (!res.ok) throw new Error("Failed to submit farmer report");
  return res.json();
}

export async function getDonations(): Promise<Donation[]> {
  const res = await fetch('/api/donations');
  if (!res.ok) throw new Error("Failed to fetch donations");
  return res.json();
}

export async function donateToFarmer(id: number, amount: number, donorName?: string, message?: string): Promise<Farmer> {
  const res = await fetch('/api/donate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ farmerId: id, donorName, amount, message })
  });
  if (!res.ok) throw new Error("Failed to process donation");
  return res.json();
}

export async function verifyFarmer(id: number, approvedGoal: number, story: string, breakdown?: RequirementBreakdown[]): Promise<Farmer> {
  const res = await fetch(`/api/verify?id=${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approvedGoal, story, breakdown })
  });
  if (!res.ok) throw new Error("Failed to verify farmer");
  return res.json();
}

export async function deleteFarmer(id: number): Promise<void> {
  const res = await fetch(`/api/verify?id=${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error("Failed to delete case");
}

export async function updateFarmerDetails(id: number, fields: Partial<Farmer>): Promise<Farmer> {
  const res = await fetch(`/api/verify?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields)
  });
  if (!res.ok) throw new Error("Failed to update farmer details");
  return res.json();
}

export async function uploadToCloudinary(base64Data: string, resourceType: 'image' | 'video'): Promise<string> {
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file: base64Data, resourceType })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to upload to Cloudinary");
  }
  const data = await res.json();
  return data.secure_url;
}

export function getOptimizedImageUrl(url: string, width = 600): string {
  if (!url) return "";
  if (!url.includes("cloudinary.com")) return url;
  if (url.includes("/w_") || url.includes("q_auto")) return url;
  return url.replace("/image/upload/", `/image/upload/w_${width},q_auto,f_auto/`);
}

export function getOptimizedVideoUrl(url: string): string {
  if (!url) return "";
  if (!url.includes("cloudinary.com")) return url;
  if (url.includes("q_auto")) return url;
  return url.replace("/video/upload/", "/video/upload/q_auto,f_auto/");
}
