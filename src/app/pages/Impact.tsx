import { motion } from "motion/react";
import { Coins, HeartHandshake, MapPin, TrendingUp, Users, CheckCircle, ShieldCheck, Trophy, Sparkles } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { Link } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useState, useEffect } from "react";
import { getDonations, getFarmers } from "../utils/db";

export function Impact() {
  const [donations, setDonations] = useState<any[]>([]);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getDonations(), getFarmers()])
      .then(([donationsData, farmersData]) => {
        setDonations(donationsData);
        setFarmers(farmersData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading impact data:", err);
        setLoading(false);
      });
  }, []);
  
  // Calculate top donors (excluding Anonymous)
  const donorMap: Record<string, number> = {};
  donations.forEach(d => {
    if (d.donorName && d.donorName.toLowerCase() !== "anonymous supporter" && d.donorName.toLowerCase() !== "anonymous") {
      donorMap[d.donorName] = (donorMap[d.donorName] || 0) + d.amount;
    }
  });
  const topDonors = Object.entries(donorMap)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  // Dynamic statistics calculations
  const totalRaisedDb = farmers.reduce((acc, f) => acc + (f.raised || 0), 0);
  const totalDisbursedAmount = 1400000 + totalRaisedDb; // Baseline offline + online raised
  const totalRelief = `₹${totalDisbursedAmount.toLocaleString()}`;

  const fullySupportedDbCount = farmers.filter(f => f.verified && f.raised >= f.goal && f.goal > 0).length;
  const fullySupportedCount = 138 + fullySupportedDbCount; // Baseline offline + online supported

  const districtsDb = new Set(farmers.map(f => f.district.trim()));
  const districtsCount = districtsDb.size > 0 ? districtsDb.size : 6;

  const metrics = [
    {
      icon: <Coins className="w-6 h-6 text-primary" />,
      label: "Total Relief Disbursed",
      value: totalRelief,
      change: `+₹${totalRaisedDb.toLocaleString()} raised online`
    },
    {
      icon: <Users className="w-6 h-6 text-secondary" />,
      label: "Farmers Fully Supported",
      value: fullySupportedCount.toString(),
      change: "Active recovery plans"
    },
    {
      icon: <MapPin className="w-6 h-6 text-primary" />,
      label: "Districts Reached",
      value: districtsCount.toString(),
      change: "Telangana state coverage"
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-secondary" />,
      label: "Average Recovery Rate",
      value: "94%",
      change: "Livelihoods saved"
    }
  ];

  // Dynamic Crop Allocation Chart data
  const cropMap: Record<string, number> = {};
  // Pre-seed baseline crop funding to make charts populated initially
  const baselineCrops: Record<string, number> = {
    "Cotton": 580000,
    "Paddy": 420000,
    "Chilli": 310000,
    "Maize": 175000
  };
  
  farmers.forEach(f => {
    if (f.verified) {
      cropMap[f.crop] = (cropMap[f.crop] || 0) + (f.raised || 0);
    }
  });

  const cropData = Object.keys(baselineCrops).map((cropName) => {
    const dbValue = cropMap[cropName] || 0;
    return {
      name: cropName,
      value: baselineCrops[cropName] + dbValue
    };
  });

  // Dynamic Disaster categories chart data
  const disasterMap: Record<string, number> = {};
  farmers.forEach(f => {
    const baseDisaster = f.disaster.split(" (")[0].trim();
    disasterMap[baseDisaster] = (disasterMap[baseDisaster] || 0) + 1;
  });

  // Combine baseline distributions with current database entries
  const baselineDisasters: Record<string, number> = {
    "Pest Attack": 35,
    "Drought": 30,
    "Floods": 25,
    "Heatwave": 10
  };

  const totalDbDisasters = Object.values(disasterMap).reduce((sum, count) => sum + count, 0);
  
  const disasterData = Object.keys(baselineDisasters).map((dName) => {
    if (totalDbDisasters === 0) {
      return { name: dName, value: baselineDisasters[dName] };
    }
    const dbCount = disasterMap[dName] || 0;
    // Calculate weighted distribution
    const percentage = Math.round(((dbCount + (baselineDisasters[dName]/10)) / (totalDbDisasters + 10)) * 100);
    return { name: dName, value: percentage > 0 ? percentage : 5 };
  });

  const COLORS = ["#1b5e20", "#2e7d32", "#4caf50", "#81c784"];

  const successStories = [
    {
      name: "Raju",
      district: "Karimnagar",
      crop: "Cotton",
      disaster: "Pink Bollworm Pest Attack",
      amountRaised: "₹28,000",
      outcome: "Purchased biopesticides and organic seeds. Replaced lost yield with 85% normal crop growth in the following micro-cycle.",
      image: "https://images.unsplash.com/photo-1608876537010-ac56d8731614?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBmYXJtZXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3ODE1NDcyODd8MA&ixlib=rb-4.1.0&q=80&w=600"
    },
    {
      name: "Kavitha",
      district: "Siddipet",
      crop: "Paddy",
      disaster: "Drought",
      amountRaised: "₹45,000",
      outcome: "Installed solar micro-drip kit and completed borewell deepening. Successfully harvested 4 acres of paddy during the heatwave.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3b21hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc4MTU0NzI4OHww&ixlib=rb-4.1.0&q=80&w=600"
    }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-xl shadow-lg">
          <p className="font-semibold text-xs text-foreground">{payload[0].name}</p>
          <p className="text-primary font-bold text-sm mt-1">
            ₹{payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-xl shadow-lg">
          <p className="font-semibold text-xs text-foreground">{payload[0].name}</p>
          <p className="text-secondary font-bold text-sm mt-1">
            {payload[0].value}% of Funding
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Title Header */}
      <section className="py-16 border-b border-border bg-muted/20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl">
            <span className="bg-primary/10 border border-primary/20 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">
              Live Transparency Dashboard
            </span>
            <h1 className="text-4xl md:text-5xl font-poppins font-bold text-foreground mb-4">
              Real Impact, Verifiable Outcomes
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We track every single case timeline from fundraiser publish date to seed delivery and crop harvest. Here is the visual breakdown of our collective impact.
            </p>
          </div>
        </div>
      </section>

      {/* KPI Grid */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="bg-card border border-border rounded-3xl p-6 shadow-sm flex items-center gap-5 relative overflow-hidden"
              >
                <div className="p-4 bg-muted rounded-2xl border border-border/50 text-foreground">
                  {metric.icon}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{metric.label}</p>
                  <p className="text-3xl font-poppins font-bold text-foreground mt-1">{metric.value}</p>
                  <p className="text-[11px] text-primary/80 font-medium mt-1">{metric.change}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="py-24 bg-card border-b border-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-poppins font-bold text-foreground mb-4">Funds Distribution Analysis</h2>
            <p className="text-muted-foreground text-sm">Real-time charts illustrating how and where donor support is being allocated.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Crop Allocation (Bar Chart) */}
            <div className="border border-border bg-muted/20 p-6 sm:p-8 rounded-3xl flex flex-col gap-6">
              <div>
                <h3 className="font-poppins font-bold text-lg text-foreground">Funds Allocated by Crop Type</h3>
                <p className="text-xs text-muted-foreground mt-1">Direct contribution amounts in Indian Rupees (INR)</p>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cropData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {cropData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#1b5e20" : "#2e7d32"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Crisis Category (Pie Chart) */}
            <div className="border border-border bg-muted/20 p-6 sm:p-8 rounded-3xl flex flex-col gap-6">
              <div>
                <h3 className="font-poppins font-bold text-lg text-foreground">Disaster Relief Allocation</h3>
                <p className="text-xs text-muted-foreground mt-1">Breakdown by disaster category percentage</p>
              </div>
              <div className="h-72 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={disasterData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {disasterData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Case Success Stories */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-poppins font-bold text-foreground mb-4">Verification of Recovery</h2>
            <p className="text-muted-foreground text-sm">Every completed profile undergoes a post-harvest check by our field team to verify physical rehabilitation.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {successStories.map((story, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="h-64 relative overflow-hidden">
                    <ImageWithFallback src={story.image} alt={story.name} className="w-full h-full object-cover" />
                    <div className="absolute top-4 left-4 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                      <Trophy className="w-3.5 h-3.5" /> Successful Recovery
                    </div>
                  </div>
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-2xl font-poppins font-bold text-foreground">{story.name}</h3>
                      <span className="text-muted-foreground text-sm">• {story.district} District</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-primary/5 text-primary border border-primary/10 text-xs px-2.5 py-1 rounded font-medium">Crop: {story.crop}</span>
                      <span className="bg-destructive/5 text-destructive border border-destructive/10 text-xs px-2.5 py-1 rounded font-medium">Crisis: {story.disaster}</span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed mt-4">
                      {story.outcome}
                    </p>
                  </div>
                </div>
                <div className="px-6 pb-6 pt-0 mt-auto sm:px-8 sm:pb-8 flex items-center justify-between border-t border-border/50 pt-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Funded Amount</span>
                    <span className="text-primary font-bold text-lg">{story.amountRaised}</span>
                  </div>
                  <span className="text-xs font-semibold text-primary flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> Field Audited
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Donor Wall of Honor */}
      <section className="py-24 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-poppins font-bold text-foreground mb-4">Donor Wall of Honor</h2>
            <p className="text-muted-foreground text-sm">Celebrating the individuals and groups who make rural recovery possible.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
            {/* Recent Contributions */}
            <div className="lg:col-span-8 space-y-4">
              <h3 className="font-poppins font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-primary" /> Recent Contributions
              </h3>
              
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                {loading ? (
                  [1, 2, 3].map((n) => (
                    <div key={n} className="bg-card border border-border p-5 rounded-2xl animate-pulse h-24 flex flex-col justify-between">
                      <div className="h-4 bg-muted rounded w-1/3" />
                      <div className="h-3 bg-muted rounded w-1/2 mt-2" />
                    </div>
                  ))
                ) : donations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-10 text-sm">No donations logged on the platform yet.</p>
                ) : (
                  donations.slice(0, 5).map((donation) => (
                    <div key={donation.id} className="bg-card border border-border p-5 rounded-2xl flex flex-col sm:flex-row justify-between gap-4 text-sm shadow-sm hover:shadow transition-shadow">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">{donation.donorName}</span>
                          <span className="text-[10px] bg-primary/15 text-primary font-bold px-2 py-0.5 rounded-full">Sponsor</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Sponsorship towards <span className="font-medium text-foreground">{donation.farmerName}</span>'s checklist.</p>
                        {donation.message && (
                          <p className="text-xs italic text-primary bg-primary/5 p-3 rounded-lg border border-primary/10 mt-3">
                            "{donation.message}"
                          </p>
                        )}
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <p className="font-bold text-[#1b5e20] text-base">+ ₹{donation.amount.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{donation.date}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Top Donors / Leaderboard */}
            <div className="lg:col-span-4">
              <h3 className="font-poppins font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-secondary" /> Top Contributors
              </h3>
              
              <div className="bg-card border border-border p-6 rounded-3xl shadow-sm relative overflow-hidden flex flex-col gap-5">
                <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full blur-2xl" />
                
                {loading ? (
                  <div className="space-y-3 animate-pulse">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="h-10 bg-muted rounded-xl" />
                    ))}
                  </div>
                ) : topDonors.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">Top contributors list updating live.</p>
                ) : (
                  topDonors.map((donor, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          idx === 0 
                            ? "bg-secondary text-secondary-foreground" 
                            : idx === 1 
                            ? "bg-muted border border-border text-foreground" 
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-sm text-foreground">{donor.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Verified Donor</p>
                        </div>
                      </div>
                      <p className="font-bold text-primary text-sm">₹{donor.amount.toLocaleString()}</p>
                    </div>
                  ))
                )}

                <div className="bg-[#1b5e20]/5 border border-[#1b5e20]/10 rounded-2xl p-4 mt-2 flex items-start gap-3 text-xs text-muted-foreground">
                  <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p>
                    Thank you to all our anonymous supporters who have contributed significantly towards our active recovery campaigns.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="py-16 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="bg-primary text-primary-foreground rounded-3xl p-8 md:p-12 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-xl">
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            <div className="relative z-10 space-y-3 md:max-w-lg">
              <span className="bg-white/10 text-white border border-white/20 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full inline-block">
                Take Action
              </span>
              <h2 className="text-2xl md:text-3xl font-poppins font-bold">Help Write the Next Success Story</h2>
              <p className="text-white/80 text-sm md:text-base leading-relaxed">
                There are still farmers awaiting verification and funding. Your support today will shape their next harvest.
              </p>
            </div>
            <div className="relative z-10 shrink-0 w-full md:w-auto">
              <Link to="/farmers" className="bg-secondary text-secondary-foreground font-bold px-8 py-4 rounded-xl shadow-md block text-center hover:bg-secondary/90 transition-transform active:scale-95">
                Support a Farmer
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
