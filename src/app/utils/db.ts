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
}

const DEFAULT_FARMERS: Farmer[] = [
  {
    id: 1,
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
    ]
  },
  {
    id: 2,
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
    ]
  },
  {
    id: 3,
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
    ]
  },
  {
    id: 4,
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
    ]
  }
];

const LOCAL_STORAGE_KEY = "raithu_raksha_farmers";

function initializeDB() {
  if (typeof window === "undefined") return;
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_FARMERS));
  }
}

export function getFarmers(): Farmer[] {
  initializeDB();
  if (typeof window === "undefined") return DEFAULT_FARMERS;
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  return stored ? JSON.parse(stored) : DEFAULT_FARMERS;
}

export function getFarmerById(id: number): Farmer | undefined {
  const farmers = getFarmers();
  return farmers.find(f => f.id === id);
}

export function addFarmer(farmerData: Omit<Farmer, "id" | "raised" | "gallery" | "timeline">): Farmer {
  initializeDB();
  const farmers = getFarmers();
  
  // Calculate next ID
  const nextId = farmers.reduce((max, f) => (f.id > max ? f.id : max), 0) + 1;
  
  // Add fallback gallery and timeline
  const newFarmer: Farmer = {
    ...farmerData,
    id: nextId,
    raised: 0,
    gallery: [
      "https://images.unsplash.com/photo-1666545743813-e692fb2b2430?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcnklMjBmYXJtJTIwbGFuZCUyMGluZGlhfGVufDF8fHx8MTc4MTU0NzI4OHww&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1681226298721-88cdb4096e5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBhZ3JpY3VsdHVyZSUyMGZpZWxkc3xlbnwxfHx8fDE3ODE1NDcyODh8MA&ixlib=rb-4.1.0&q=80&w=1080"
    ],
    timeline: [
      { title: "Report Submitted", description: "Farmer reported on platform via website form.", date: "Today", status: "completed" },
      { title: "Verification Pending", description: "Verification team scheduled for field visit.", date: "Tomorrow", status: "active" },
      { title: "Fundraising", description: "Funding starts post-verification.", date: "TBD", status: "pending" }
    ]
  };
  
  farmers.push(newFarmer);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(farmers));
  return newFarmer;
}

export function donateToFarmer(id: number, amount: number): Farmer | undefined {
  initializeDB();
  const farmers = getFarmers();
  const farmerIndex = farmers.findIndex(f => f.id === id);
  if (farmerIndex === -1) return undefined;
  
  const farmer = farmers[farmerIndex];
  farmer.raised = Math.min(farmer.goal, farmer.raised + amount);
  
  // If fully funded, update timeline status
  if (farmer.raised >= farmer.goal) {
    const activeIndex = farmer.timeline.findIndex(t => t.status === "active");
    if (activeIndex !== -1) {
      farmer.timeline[activeIndex].status = "completed";
    }
    const fundraisingIndex = farmer.timeline.findIndex(t => t.title === "Fundraising");
    if (fundraisingIndex !== -1) {
      farmer.timeline[fundraisingIndex].title = "Fully Funded";
      farmer.timeline[fundraisingIndex].description = "Recovery funds fully secured. Implementation beginning.";
      farmer.timeline[fundraisingIndex].status = "completed";
    }
  }
  
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(farmers));
  return farmer;
}
