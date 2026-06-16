import { motion } from "motion/react";
import { ArrowRight, ShieldCheck, HeartHandshake, Sprout, Smartphone, QrCode, MessageCircle } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useState } from "react";
import { getFarmers } from "../utils/db";

export function Home() {
  const navigate = useNavigate();
  const [quickName, setQuickName] = useState("");
  const [quickPhone, setQuickPhone] = useState("");

  const handleQuickReport = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/report", { state: { farmerName: quickName, reporterPhone: quickPhone } });
  };

  const allFarmers = getFarmers();
  let urgentFarmers = allFarmers.filter(f => f.raised < f.goal);
  if (urgentFarmers.length === 0) {
    urgentFarmers = allFarmers.slice(0, 3);
  } else {
    urgentFarmers = urgentFarmers
      .sort((a, b) => (a.raised / a.goal) - (b.raised / b.goal))
      .slice(0, 3);
  }

  const tickerItems = [
    "Ramesh Kumar from Warangal received ₹15,000",
    "Laxmi Bai from Nalgonda reached her recovery goal",
    "Srinivas Reddy from Khammam received ₹5,000 for fertilizers",
    "Venkataiah from Mahabubnagar received ₹12,000 for borewell repair",
    "Kavitha from Siddipet reached her recovery goal",
    "Raju from Karimnagar received ₹8,000 for seeds"
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1681226298721-88cdb4096e5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBhZ3JpY3VsdHVyZSUyMGZpZWxkc3xlbnwxfHx8fDE3ODE1NDcyODh8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Telangana farmer in field"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/50 to-transparent" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 md:px-6 text-center text-white mt-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl lg:text-7xl font-poppins font-bold mb-6 max-w-4xl mx-auto leading-tight"
          >
            When Crops Fail, <br className="hidden md:block"/> Communities Rise.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto"
          >
            Connecting disaster-affected farmers with people willing to help through verified stories and transparent support.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/farmers" className="bg-secondary text-secondary-foreground px-8 py-4 rounded-full text-base font-semibold hover:bg-secondary/90 transition-colors w-full sm:w-auto text-center flex items-center justify-center gap-2">
              Explore Farmers <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-full text-base font-medium hover:bg-white/20 transition-colors w-full sm:w-auto">
              Report via WhatsApp
            </button>
          </motion.div>
        </div>

        {/* Scrolling Ticker */}
        <div className="absolute bottom-0 left-0 w-full bg-primary/80 backdrop-blur-md py-4 border-t border-white/10 z-20 overflow-hidden">
          <motion.div 
            className="flex gap-12 items-center whitespace-nowrap w-max px-6"
            animate={{ x: [0, "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
          >
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm font-medium text-white">
                <HeartHandshake className="w-5 h-5 text-secondary" />
                {item}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Farmers */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-end mb-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-poppins font-bold text-foreground mb-4">Urgent Cases</h2>
              <p className="text-muted-foreground text-lg">Verified farmers needing immediate support to begin recovery.</p>
            </div>
            <Link to="/farmers" className="hidden md:flex items-center gap-2 text-primary font-medium hover:underline">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {urgentFarmers.map((farmer) => {
              const progress = (farmer.raised / farmer.goal) * 100;
              return (
                <div key={farmer.id} className="group bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="relative h-64 overflow-hidden">
                      <ImageWithFallback 
                        src={farmer.image} 
                        alt={farmer.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-primary text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <ShieldCheck className="w-3 h-3 text-secondary" /> NGO Verified
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-poppins font-semibold text-foreground">{farmer.name}, {farmer.age}</h3>
                          <p className="text-muted-foreground text-sm">{farmer.district} District • {farmer.crop}</p>
                        </div>
                        <div className="bg-destructive/10 text-destructive text-xs font-semibold px-2 py-1 rounded max-w-[120px] truncate">
                          {farmer.disaster.split(" (")[0]}
                        </div>
                      </div>
                      <p className="text-foreground/80 text-sm mb-6 line-clamp-2">
                        {farmer.story}
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress & Action */}
                  <div className="px-6 pb-6 pt-0">
                    <div className="mb-4 animate-pulse-none">
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-primary font-bold">₹{farmer.raised.toLocaleString()} raised</span>
                        <span className="text-muted-foreground">₹{farmer.goal.toLocaleString()} goal</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-secondary h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                    <Link to={`/farmers/${farmer.id}`} className="block w-full text-center bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors">
                      Read Story & Support
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-8 md:hidden flex justify-center">
             <Link to="/farmers" className="flex items-center gap-2 text-primary font-medium border border-primary px-6 py-3 rounded-full hover:bg-primary hover:text-white transition-colors">
              View all Farmers <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How We Verify */}
      <section className="py-24 bg-background border-y border-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-foreground mb-4">Radical Transparency</h2>
            <p className="text-muted-foreground text-lg">Every story on Rythu Raksha is deeply vetted by our on-ground NGO team before it reaches you.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-card border border-border shadow-sm flex items-center justify-center mb-6 text-primary">
                <Smartphone className="w-8 h-8" />
              </div>
              <h3 className="font-poppins font-semibold text-lg mb-2">1. Report</h3>
              <p className="text-sm text-muted-foreground">Farmer or community member submits a case with evidence via WhatsApp.</p>
            </div>
            <div className="flex flex-col items-center text-center relative">
              <div className="hidden md:block absolute top-8 left-1/2 w-full h-px bg-border -z-10" />
              <div className="w-16 h-16 rounded-full bg-card border border-border shadow-sm flex items-center justify-center mb-6 text-primary">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="font-poppins font-semibold text-lg mb-2">2. Review</h3>
              <p className="text-sm text-muted-foreground">NGO team reviews the digital evidence and contacts local authorities.</p>
            </div>
            <div className="flex flex-col items-center text-center relative">
              <div className="hidden md:block absolute top-8 left-1/2 w-full h-px bg-border -z-10" />
              <div className="w-16 h-16 rounded-full bg-card border border-border shadow-sm flex items-center justify-center mb-6 text-primary">
                <HeartHandshake className="w-8 h-8" />
              </div>
              <h3 className="font-poppins font-semibold text-lg mb-2">3. Verify</h3>
              <p className="text-sm text-muted-foreground">Field agents visit the farm, assess land damage, and verify requirement.</p>
            </div>
            <div className="flex flex-col items-center text-center relative">
              <div className="hidden md:block absolute top-8 left-1/2 w-full h-px bg-border -z-10" />
              <div className="w-16 h-16 rounded-full bg-primary shadow-md flex items-center justify-center mb-6 text-white">
                <Sprout className="w-8 h-8" />
              </div>
              <h3 className="font-poppins font-semibold text-lg mb-2">4. Publish</h3>
              <p className="text-sm text-muted-foreground">The verified story is published with a transparent breakdown of needs.</p>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Banner Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="bg-muted/40 border border-border rounded-3xl overflow-hidden flex flex-col md:flex-row items-center justify-between">
            <div className="p-8 md:p-16 md:w-1/2 flex flex-col gap-6 items-start">
              <h2 className="text-3xl md:text-5xl font-poppins font-bold text-primary leading-tight">
                Be the Reason a Farmer Smiles Again
              </h2>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                Your contribution is more than money; it is hope, dignity, and a future for a farming family in distress.
              </p>
              <Link 
                to="/farmers" 
                className="bg-primary text-primary-foreground px-8 py-3.5 rounded-full font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/10 active:scale-95"
              >
                Donate Now
              </Link>
            </div>
            <div className="w-full md:w-1/2 h-72 md:h-[380px] relative">
              <img 
                src="/smiling_farmer_sprout.png" 
                alt="Smiling Indian farmer holding sprout"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Report Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-foreground mb-4">Report a Farmer in Need</h2>
            <p className="text-muted-foreground text-lg">Help us reach farmers who need urgent support. You can report their situation directly to our verification team.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* WhatsApp Card */}
            <div className="bg-gradient-to-br from-[#25D366]/10 to-[#128C7E]/10 rounded-3xl p-8 md:p-10 border border-[#25D366]/20 flex flex-col items-center text-center relative overflow-hidden group">
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#25D366]/20 rounded-full blur-3xl group-hover:bg-[#25D366]/30 transition-all duration-500" />
              <div className="bg-white p-5 rounded-2xl shadow-sm mb-6 border border-[#25D366]/20 relative z-10">
                <QrCode className="w-24 h-24 text-[#128C7E]" />
              </div>
              <h3 className="text-2xl font-poppins font-bold text-foreground mb-2 relative z-10">Report via WhatsApp</h3>
              <p className="text-muted-foreground mb-8 max-w-sm relative z-10">Scan the QR code to instantly start a chat with our NGO team. Share photos, voice notes, and location directly.</p>
              <button className="bg-[#25D366] text-white px-8 py-3.5 rounded-full font-bold hover:bg-[#128C7E] transition-colors flex items-center gap-2 shadow-lg shadow-[#25D366]/20 relative z-10">
                <MessageCircle className="w-5 h-5" /> Open WhatsApp
              </button>
            </div>

            {/* Website Card */}
            <div className="bg-card rounded-3xl p-8 md:p-10 border border-border flex flex-col shadow-sm">
              <h3 className="text-2xl font-poppins font-bold text-foreground mb-2">Report on Website</h3>
              <p className="text-muted-foreground mb-8">Don't have WhatsApp? Fill out our detailed web form with the farmer's details, disaster type, and upload evidence directly.</p>
              
              <form onSubmit={handleQuickReport} className="space-y-5 flex-1 flex flex-col">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Farmer's Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter name" 
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Your Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="Enter your number" 
                    value={quickPhone}
                    onChange={(e) => setQuickPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div className="mt-auto pt-4">
                  <button type="submit" className="w-full bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-md">
                    Start Web Report <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
