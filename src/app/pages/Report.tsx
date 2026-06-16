import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, MapPin, Sprout, AlertTriangle, Coins } from "lucide-react";
import { addFarmer } from "../utils/db";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export function Report() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefilled = location.state || {};
  const [step, setStep] = useState(prefilled.farmerName || prefilled.reporterPhone ? 2 : 1);
  
  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Reporter Info
    reporterName: "",
    reporterPhone: prefilled.reporterPhone || "",
    relationship: "NGO Partner",
    
    // Step 2: Farmer Profile
    farmerName: prefilled.farmerName || "",
    farmerAge: "",
    district: "Warangal",
    village: "",
    landArea: "",
    
    // Step 3: Crisis Details
    crop: "Cotton",
    disaster: "Pest Attack",
    damage: "80",
    story: "",
    
    // Step 4: Requirements & Budget
    seedsCost: "",
    fertilizerCost: "",
    laborCost: "",
    image: ""
  });

  const districts = ["Warangal", "Nalgonda", "Khammam", "Mahabubnagar", "Siddipet", "Karimnagar"];
  const disasters = [
    "Pest Attack",
    "Severe Drought",
    "Floods",
    "Crop Failure (Heatwave)",
    "Unseasonal Rains"
  ];
  const crops = ["Cotton", "Paddy", "Chilli", "Maize", "Groundnut", "Turmeric"];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Validation
  const isStepValid = () => {
    if (step === 1) {
      return formData.reporterName.trim() !== "" && formData.reporterPhone.trim().length >= 10;
    }
    if (step === 2) {
      return (
        formData.farmerName.trim() !== "" &&
        formData.farmerAge.trim() !== "" &&
        formData.village.trim() !== "" &&
        formData.landArea.trim() !== ""
      );
    }
    if (step === 3) {
      return formData.story.trim().length >= 20;
    }
    if (step === 4) {
      return (
        formData.seedsCost.trim() !== "" &&
        formData.fertilizerCost.trim() !== "" &&
        formData.laborCost.trim() !== ""
      );
    }
    return false;
  };

  const nextStep = () => {
    if (isStepValid()) {
      setStep(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      toast.error("Please fill out all required fields correctly.");
    }
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStepValid()) {
      toast.error("Please fill out all required fields correctly.");
      return;
    }

    const seeds = parseFloat(formData.seedsCost) || 0;
    const ferts = parseFloat(formData.fertilizerCost) || 0;
    const labor = parseFloat(formData.laborCost) || 0;
    const totalGoal = seeds + ferts + labor;

    const fallbackImages: Record<string, string> = {
      "Cotton": "https://images.unsplash.com/photo-1608876537010-ac56d8731614?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBmYXJtZXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3ODE1NDcyODd8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "Paddy": "https://images.unsplash.com/photo-1666545743813-e692fb2b2430?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcnklMjBmYXJtJTIwbGFuZCUyMGluZGlhfGVufDF8fHx8MTc4MTU0NzI4OHww&ixlib=rb-4.1.0&q=80&w=1080",
      "Chilli": "https://images.unsplash.com/photo-1780342286779-1032160016be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB2aWxsYWdlJTIwY29tbXVuaXR5fGVufDF8fHx8MTc4MTU0NzI4OHww&ixlib=rb-4.1.0&q=80&w=1080",
      "default": "https://images.unsplash.com/photo-1681226298721-88cdb4096e5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBhZ3JpY3VsdHVyZSUyMGZpZWxkc3xlbnwxfHx8fDE3ODE1NDcyODh8MA&ixlib=rb-4.1.0&q=80&w=1080"
    };

    const imageSelected = fallbackImages[formData.crop] || fallbackImages.default;

    try {
      addFarmer({
        name: formData.farmerName,
        age: parseInt(formData.farmerAge) || 40,
        district: formData.district,
        village: formData.village,
        crop: formData.crop,
        disaster: `${formData.disaster} (${formData.damage}% Damage)`,
        goal: totalGoal,
        landArea: `${formData.landArea} Acres`,
        damage: `${formData.damage}%`,
        image: imageSelected,
        story: formData.story,
        breakdown: [
          { item: "High-Quality Seeds", cost: seeds },
          { item: "Pest-resistant Fertilizers & Tools", cost: ferts },
          { item: "Labor & Land Preparation", cost: labor }
        ]
      });

      toast.success("Farmer profile submitted successfully for verification!");
      navigate("/farmers");
    } catch (err) {
      toast.error("Failed to submit report. Please try again.");
    }
  };

  // Helper step component
  const stepsList = [
    { num: 1, name: "Reporter Details" },
    { num: 2, name: "Farmer Details" },
    { num: 3, name: "Damage Report" },
    { num: 4, name: "Financial Needs" }
  ];

  return (
    <div className="bg-background min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-poppins font-bold text-foreground mb-3">Report a Farmer Case</h1>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Submit verified details about crop damages to help our partner NGOs initiate the digital verification flow.
          </p>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between items-center relative mb-4">
            {stepsList.map((s, i) => (
              <div key={s.num} className="flex flex-col items-center flex-1 relative z-10">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 ${
                    step === s.num
                      ? "bg-primary border-primary text-white shadow-md shadow-primary/20 scale-110"
                      : step > s.num
                      ? "bg-secondary border-secondary text-secondary-foreground"
                      : "bg-card border-border text-muted-foreground"
                  }`}
                >
                  {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                </div>
                <span className="text-[11px] sm:text-xs font-semibold text-foreground/80 mt-2 text-center hidden sm:block">
                  {s.name}
                </span>
              </div>
            ))}
            {/* Background Line */}
            <div className="absolute left-[12.5%] right-[12.5%] top-[20px] h-[3px] bg-border -z-0 rounded" />
            {/* Filled Progress Line */}
            <div 
              className="absolute left-[12.5%] top-[20px] h-[3px] bg-secondary -z-0 rounded transition-all duration-500" 
              style={{ width: `${((step - 1) / (stepsList.length - 1)) * 75}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-card border border-border rounded-3xl shadow-xl p-6 sm:p-10 relative overflow-hidden">
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />

          <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
            <AnimatePresence mode="wait">
              {/* STEP 1: REPORTER INFO */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-bold font-poppins text-foreground mb-1">Your Information</h3>
                    <p className="text-sm text-muted-foreground">Who is submitting this report? (For NGO contact purpose only)</p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1.5 block">Your Full Name <span className="text-destructive">*</span></label>
                      <input 
                        type="text" 
                        name="reporterName"
                        value={formData.reporterName}
                        onChange={handleInputChange}
                        placeholder="Enter your name" 
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1.5 block">Your Phone Number <span className="text-destructive">*</span></label>
                      <input 
                        type="tel" 
                        name="reporterPhone"
                        value={formData.reporterPhone}
                        onChange={handleInputChange}
                        placeholder="Enter 10-digit mobile number" 
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1.5 block">Your Relationship to Farmer</label>
                      <select 
                        name="relationship"
                        value={formData.relationship}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                      >
                        <option value="Self">Self (I am the farmer)</option>
                        <option value="Family">Family Member / Relative</option>
                        <option value="Neighbor">Neighbor / Villager</option>
                        <option value="NGO Partner">NGO Volunteer</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: FARMER PROFILE */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-bold font-poppins text-foreground mb-1">Farmer Profile</h3>
                    <p className="text-sm text-muted-foreground">Provide basic details of the affected farmer.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="text-sm font-semibold text-foreground mb-1.5 block">Farmer's Full Name <span className="text-destructive">*</span></label>
                      <input 
                        type="text" 
                        name="farmerName"
                        value={formData.farmerName}
                        onChange={handleInputChange}
                        placeholder="Enter farmer's name" 
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1.5 block">Farmer's Age <span className="text-destructive">*</span></label>
                      <input 
                        type="number" 
                        name="farmerAge"
                        value={formData.farmerAge}
                        onChange={handleInputChange}
                        placeholder="Enter age" 
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1.5 block">District <span className="text-destructive">*</span></label>
                      <select 
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                      >
                        {districts.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1.5 block">Village Name <span className="text-destructive">*</span></label>
                      <input 
                        type="text" 
                        name="village"
                        value={formData.village}
                        onChange={handleInputChange}
                        placeholder="Enter village" 
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1.5 block">Cultivated Land Area (Acres) <span className="text-destructive">*</span></label>
                      <input 
                        type="number" 
                        step="0.1"
                        name="landArea"
                        value={formData.landArea}
                        onChange={handleInputChange}
                        placeholder="e.g. 3.5" 
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm" 
                        required 
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: CRISIS DETAILS */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-bold font-poppins text-foreground mb-1">Crop & Crisis Report</h3>
                    <p className="text-sm text-muted-foreground">Describe the crop type and the nature of the crop damage.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1.5 block">Primary Crop Cultivated</label>
                      <select 
                        name="crop"
                        value={formData.crop}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                      >
                        {crops.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1.5 block">Disaster Category</label>
                      <select 
                        name="disaster"
                        value={formData.disaster}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                      >
                        {disasters.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-semibold text-foreground mb-1.5 block flex justify-between">
                        <span>Crop Damage Percentage (%)</span>
                        <span className="text-primary font-bold">{formData.damage}%</span>
                      </label>
                      <input 
                        type="range" 
                        min="10" 
                        max="100" 
                        step="5"
                        name="damage"
                        value={formData.damage}
                        onChange={handleInputChange}
                        className="w-full accent-primary h-2 bg-muted rounded-lg appearance-none cursor-pointer" 
                      />
                      <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                        <span>10% (Mild)</span>
                        <span>50% (Moderate)</span>
                        <span>100% (Total Failure)</span>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-semibold text-foreground mb-1.5 block">Detailed Story / Situation <span className="text-destructive">*</span></label>
                      <textarea 
                        name="story"
                        value={formData.story}
                        onChange={handleInputChange}
                        placeholder="Please write at least 20 characters explaining the circumstances, financial burden, and family situation..." 
                        rows={5}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm leading-relaxed" 
                        required 
                      />
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Tip: Include information about family dependency, existing loans, and crop cycle impact.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: BUDGET & FINANCIAL NEEDS */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-bold font-poppins text-foreground mb-1">Financial Requirements</h3>
                    <p className="text-sm text-muted-foreground">Estimate recovery costs to purchase seeds and inputs for the next cycle.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-foreground mb-1 block">High-Quality Seeds Cost (₹) <span className="text-destructive">*</span></label>
                        <input 
                          type="number" 
                          name="seedsCost"
                          value={formData.seedsCost}
                          onChange={handleInputChange}
                          placeholder="e.g. 12000" 
                          className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-xs" 
                          required 
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-foreground mb-1 block">Fertilizers & Pesticides (₹) <span className="text-destructive">*</span></label>
                        <input 
                          type="number" 
                          name="fertilizerCost"
                          value={formData.fertilizerCost}
                          onChange={handleInputChange}
                          placeholder="e.g. 15000" 
                          className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-xs" 
                          required 
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-foreground mb-1 block">Labor & Land Prep (₹) <span className="text-destructive">*</span></label>
                        <input 
                          type="number" 
                          name="laborCost"
                          value={formData.laborCost}
                          onChange={handleInputChange}
                          placeholder="e.g. 13000" 
                          className="w-full px-3 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-xs" 
                          required 
                        />
                      </div>
                    </div>

                    {/* Breakdown Summary Box */}
                    <div className="bg-muted/30 border border-border rounded-xl p-5 mt-6">
                      <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground border-b border-border pb-2 mb-3">Live Estimate Summary</h4>
                      <div className="space-y-2.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">High-Quality Seeds</span>
                          <span className="font-medium text-foreground">₹{parseFloat(formData.seedsCost || "0").toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Pest-resistant Fertilizers & Tools</span>
                          <span className="font-medium text-foreground">₹{parseFloat(formData.fertilizerCost || "0").toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Labor & Land Prep</span>
                          <span className="font-medium text-foreground">₹{parseFloat(formData.laborCost || "0").toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold pt-3 border-t border-border mt-3">
                          <span className="flex items-center gap-1.5"><Coins className="w-5 h-5 text-secondary" /> Total Recovery Goal</span>
                          <span className="text-primary">
                            ₹{(
                              (parseFloat(formData.seedsCost) || 0) + 
                              (parseFloat(formData.fertilizerCost) || 0) + 
                              (parseFloat(formData.laborCost) || 0)
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-primary/5 rounded-xl p-4 border border-primary/10 flex items-start gap-3 mt-4 text-xs text-muted-foreground">
                      <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <p>
                        Our local agents will verify these estimates against regional standards and land size coordinates during the field visit before funding begins.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-8 border-t border-border mt-8">
              {step > 1 ? (
                <button 
                  type="button" 
                  onClick={prevStep}
                  className="px-6 py-3 border border-border rounded-xl text-sm font-semibold hover:bg-muted/50 transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button 
                  type="button" 
                  onClick={nextStep}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all flex items-center gap-2"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  type="submit"
                  className="bg-secondary text-secondary-foreground px-8 py-3 rounded-xl text-sm font-bold hover:bg-secondary/90 transition-transform active:scale-95 shadow-md flex items-center gap-2"
                >
                  Submit Profile <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
