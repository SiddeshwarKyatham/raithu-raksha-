import { Search, ShieldCheck } from "lucide-react";
import { Link } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { motion } from "motion/react";
import { useState } from "react";
import { getFarmers } from "../utils/db";

export function Farmers() {
  const allFarmers = getFarmers();
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("");
  const [disaster, setDisaster] = useState("");

  const filteredFarmers = allFarmers.filter(farmer => {
    const matchesSearch = 
      farmer.name.toLowerCase().includes(search.toLowerCase()) ||
      farmer.district.toLowerCase().includes(search.toLowerCase()) ||
      farmer.crop.toLowerCase().includes(search.toLowerCase()) ||
      farmer.disaster.toLowerCase().includes(search.toLowerCase());

    const matchesDistrict = district === "" || farmer.district.toLowerCase() === district.toLowerCase();
    const matchesDisaster = disaster === "" || farmer.disaster.toLowerCase().includes(disaster.toLowerCase());

    return matchesSearch && matchesDistrict && matchesDisaster;
  });

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12">
          <h1 className="text-4xl font-poppins font-bold text-foreground mb-4">Support a Farmer</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Browse through verified profiles of farmers who need your help to recover from natural disasters and crop failures.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by name, district, or crop..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            <select 
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary min-w-[140px]"
            >
              <option value="">All Districts</option>
              <option value="warangal">Warangal</option>
              <option value="nalgonda">Nalgonda</option>
              <option value="khammam">Khammam</option>
              <option value="mahabubnagar">Mahabubnagar</option>
              <option value="siddipet">Siddipet</option>
              <option value="karimnagar">Karimnagar</option>
            </select>
            <select 
              value={disaster}
              onChange={(e) => setDisaster(e.target.value)}
              className="px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary min-w-[140px]"
            >
              <option value="">All Disasters</option>
              <option value="drought">Drought</option>
              <option value="floods">Floods</option>
              <option value="pest">Pest Attack</option>
              <option value="failure">Crop Failure</option>
            </select>
            <button 
              onClick={() => { setSearch(""); setDistrict(""); setDisaster(""); }}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-card border border-border rounded-xl hover:bg-muted transition-colors whitespace-nowrap text-sm font-medium"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Farmers Grid */}
        {filteredFarmers.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <p className="text-muted-foreground text-lg">No farmers match your search criteria.</p>
            <button onClick={() => { setSearch(""); setDistrict(""); setDisaster(""); }} className="mt-4 text-sm font-semibold text-primary hover:underline">
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFarmers.map((farmer, idx) => {
              const progress = (farmer.raised / farmer.goal) * 100;
              return (
                <motion.div 
                  key={farmer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-56 overflow-hidden">
                      <ImageWithFallback 
                        src={farmer.image} 
                        alt={farmer.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-primary text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <ShieldCheck className="w-3 h-3 text-secondary" /> Verified
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-poppins font-semibold text-foreground">{farmer.name}, {farmer.age}</h3>
                          <p className="text-muted-foreground text-xs">{farmer.district} District • {farmer.crop}</p>
                        </div>
                      </div>
                      <div className="inline-block bg-muted text-foreground text-xs font-medium px-2 py-1 rounded w-fit mb-4">
                        {farmer.disaster.split(" (")[0]}
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-5 pb-5 pt-0 mt-auto">
                    <div className="mb-4">
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-primary font-bold">₹{farmer.raised.toLocaleString()} raised</span>
                        <span className="text-muted-foreground">₹{farmer.goal.toLocaleString()} goal</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className="bg-secondary h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-1 text-right">
                        {Math.round(progress)}% Funded
                      </div>
                    </div>
                    <Link to={`/farmers/${farmer.id}`} className="block w-full text-center border border-primary text-primary py-2.5 rounded-xl text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors">
                      View Story
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
