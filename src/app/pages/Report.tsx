import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, MapPin, Sprout, AlertTriangle, Coins } from "lucide-react";
import { addFarmer, uploadToCloudinary } from "../utils/db";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { LocationPicker } from "../components/LocationPicker";

export function Report() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefilled = location.state || {};
  const [step, setStep] = useState(prefilled.farmerName || prefilled.reporterPhone ? 2 : 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
    farmerPhone: "",
    locationLink: "",
    
    // Step 3: Crisis Details
    crop: "Cotton",
    disaster: "Pest Attack",
    damage: "80",
    story: "",
    
    // Step 4: Evidence Proofs
    videoProof: "",
    videoFileName: "",
    imageProofs: [] as string[],
    imageFileNames: [] as string[],
    
    // Step 5: Financial Needs
    recoveryGoal: "",
    image: ""
  });

  const districts = [
    "Adilabad",
    "Bhadradri Kothagudem",
    "Hanamkonda",
    "Hyderabad",
    "Jagtial",
    "Jangaon",
    "Jayashankar Bhupalpally",
    "Jogulamba Gadwal",
    "Kamareddy",
    "Karimnagar",
    "Khammam",
    "Kumuram Bheem Asifabad",
    "Mahabubabad",
    "Mahabubnagar",
    "Mancherial",
    "Medak",
    "Medchal-Malkajgiri",
    "Mulugu",
    "Nagarkurnool",
    "Nalgonda",
    "Narayanpet",
    "Nirmal",
    "Nizamabad",
    "Peddapalli",
    "Rajanna Sircilla",
    "Rangareddy",
    "Sangareddy",
    "Siddipet",
    "Suryapet",
    "Vikarabad",
    "Wanaparthy",
    "Warangal",
    "Yadadri Bhuvanagiri"
  ];
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
    setFormData(prev => {
      const nextData = { ...prev, [name]: value };
      
      // Auto-fill farmer details if relationship is 'Self' (I am the farmer)
      if (name === "relationship" && value === "Self") {
        nextData.farmerName = nextData.reporterName;
        nextData.farmerPhone = nextData.reporterPhone;
      } else if (nextData.relationship === "Self") {
        if (name === "reporterName") {
          nextData.farmerName = value;
        }
        if (name === "reporterPhone") {
          nextData.farmerPhone = value;
        }
      }
      
      return nextData;
    });
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error("Video file is too large! Maximum limit is 20MB.");
        return;
      }

      // Check duration of video proof (30 to 45 seconds walkthrough with farmer and field)
      const videoElement = document.createElement("video");
      videoElement.preload = "metadata";
      videoElement.src = URL.createObjectURL(file);
      videoElement.onloadedmetadata = () => {
        URL.revokeObjectURL(videoElement.src);
        if (videoElement.duration < 30 || videoElement.duration > 45) {
          toast.error("Video must be between 30 and 45 seconds long! Please upload a brief walkthrough showing both the farmer and the field.");
        } else {
          const reader = new FileReader();
          reader.onload = () => {
            setFormData(prev => ({
              ...prev,
              videoFileName: file.name,
              videoProof: reader.result as string
            }));
            toast.success("Walkthrough video validated (30-45s duration) and attached!");
          };
          reader.onerror = () => {
            toast.error("Failed to read video file.");
          };
          reader.readAsDataURL(file);
        }
      };
      videoElement.onerror = () => {
        // Fallback for file parsing issues
        const reader = new FileReader();
        reader.onload = () => {
          setFormData(prev => ({
            ...prev,
            videoFileName: file.name,
            videoProof: reader.result as string
          }));
          toast.success("Walkthrough video attached successfully!");
        };
        reader.onerror = () => {
          toast.error("Failed to read video file.");
        };
        reader.readAsDataURL(file);
      };
    }
  };

  const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const readPromises = Array.from(files).map(file => {
        return new Promise<{ name: string, dataUrl: string }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({ name: file.name, dataUrl: reader.result as string });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readPromises)
        .then(results => {
          setFormData(prev => ({
            ...prev,
            imageProofs: [...prev.imageProofs, ...results.map(r => r.dataUrl)],
            imageFileNames: [...prev.imageFileNames, ...results.map(r => r.name)]
          }));
          toast.success(`Attached ${results.length} crop damage photo(s)!`);
        })
        .catch(err => {
          console.error(err);
          toast.error("Failed to read image files.");
        });
    }
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
        formData.landArea.trim() !== "" &&
        formData.farmerPhone.trim().length >= 10 &&
        formData.locationLink.trim() !== ""
      );
    }
    if (step === 3) {
      return true;
    }
    if (step === 4) {
      // Require at least one proof
      return formData.imageProofs.length > 0 || formData.videoProof !== "";
    }
    if (step === 5) {
      return formData.recoveryGoal.trim() !== "" && parseFloat(formData.recoveryGoal) > 0;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStepValid()) {
      toast.error("Please fill out all required fields correctly.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Uploading evidence to Cloudinary...");

    try {
      // 1. Upload video if it exists as base64
      let uploadedVideoUrl = "";
      if (formData.videoProof && formData.videoProof.startsWith("data:")) {
        toast.loading("Uploading walkthrough video...", { id: toastId });
        uploadedVideoUrl = await uploadToCloudinary(formData.videoProof, 'video');
      } else {
        uploadedVideoUrl = formData.videoProof;
      }

      // 2. Upload images
      const uploadedImageUrls: string[] = [];
      for (let i = 0; i < formData.imageProofs.length; i++) {
        const img = formData.imageProofs[i];
        if (img.startsWith("data:")) {
          toast.loading(`Uploading image proof ${i + 1} of ${formData.imageProofs.length}...`, { id: toastId });
          const url = await uploadToCloudinary(img, 'image');
          uploadedImageUrls.push(url);
        } else {
          uploadedImageUrls.push(img);
        }
      }

      // 3. Select main image (use first uploaded proof, or fallback)
      const fallbackImages: Record<string, string> = {
        "Cotton": "https://images.unsplash.com/photo-1608876537010-ac56d8731614?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBmYXJtZXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3ODE1NDcyODd8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "Paddy": "https://images.unsplash.com/photo-1666545743813-e692fb2b2430?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcnklMjBmYXJtJTIwbGFuZCUyMGluZGlhfGVufDF8fHx8MTc4MTU0NzI4OHww&ixlib=rb-4.1.0&q=80&w=1080",
        "Chilli": "https://images.unsplash.com/photo-1780342286779-1032160016be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB2aWxsYWdlJTIwY29tbXVuaXR5fGVufDF8fHx8MTc4MTU0NzI4OHww&ixlib=rb-4.1.0&q=80&w=1080",
        "default": "https://images.unsplash.com/photo-1681226298721-88cdb4096e5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBhZ3JpY3VsdHVyZSUyMGZpZWxkc3xlbnwxfHx8fDE3ODE1NDcyODh8MA&ixlib=rb-4.1.0&q=80&w=1080"
      };

      const mainImage = uploadedImageUrls.length > 0 ? uploadedImageUrls[0] : (fallbackImages[formData.crop] || fallbackImages.default);

      toast.loading("Saving farmer profile...", { id: toastId });

      await addFarmer({
        name: formData.farmerName,
        age: parseInt(formData.farmerAge) || 40,
        district: formData.district,
        village: formData.village,
        crop: formData.crop,
        disaster: `${formData.disaster} (${formData.damage}% Damage)`,
        goal: 0,
        landArea: `${formData.landArea} Acres`,
        damage: `${formData.damage}%`,
        image: mainImage,
        story: "Pending verification and story addition by NGO admin.",
        breakdown: [],
        farmerPhone: formData.farmerPhone,
        requestedAmount: parseFloat(formData.recoveryGoal) || 0,
        videoProof: uploadedVideoUrl || null,
        imageProofs: uploadedImageUrls,
        locationLink: formData.locationLink
      });

      toast.success("Farmer profile submitted successfully for verification!", { id: toastId });
      navigate("/farmers");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to submit report. Please try again.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper step component
  const stepsList = [
    { num: 1, name: "Reporter Details" },
    { num: 2, name: "Farmer Details" },
    { num: 3, name: "Damage Report" },
    { num: 4, name: "Evidence Uploads" },
    { num: 5, name: "Financial Needs" }
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
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1.5 block">Farmer's Phone Number <span className="text-destructive">*</span></label>
                      <input 
                        type="tel" 
                        name="farmerPhone"
                        value={formData.farmerPhone}
                        onChange={handleInputChange}
                        placeholder="Enter 10-digit mobile number" 
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm" 
                        required 
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-semibold text-foreground mb-3.5 block">Field Location (Live GPS & Interactive Map Pin) <span className="text-destructive">*</span></label>
                      <LocationPicker 
                        value={formData.locationLink} 
                        onChange={(url) => setFormData(prev => ({ ...prev, locationLink: url }))}
                        village={formData.village}
                        district={formData.district}
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
                    {/* Detailed story will be added by the NGO admin after verification */}
                  </div>
                </motion.div>
              )}

              {/* STEP 4: EVIDENCE UPLOADS (VIDEO & IMAGES) */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-bold font-poppins text-foreground mb-1">Upload Evidence & Proofs</h3>
                    <p className="text-sm text-muted-foreground">Attach video and image proofs to verify the crop damage condition.</p>
                  </div>

                  <div className="space-y-6">
                    {/* Video Proof */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground mb-1.5 block">Video Proof (Farmer & Field Walkthrough) <span className="text-destructive">*</span></label>
                      <div className="border-2 border-dashed border-border rounded-2xl p-6 flex flex-col items-center justify-center bg-muted/20 relative group hover:border-primary transition-colors">
                        <input 
                          type="file" 
                          accept="video/*" 
                          onChange={handleVideoUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                        />
                        <AlertTriangle className="w-8 h-8 text-muted-foreground group-hover:text-primary mb-2 transition-colors" />
                        <span className="text-xs font-semibold text-foreground/80">Drag & drop or click to upload walkthrough video</span>
                        <span className="text-[10px] text-muted-foreground mt-1">MP4, MOV, or WebM (30 to 45 seconds duration, Max 20MB)</span>
                      </div>
                      {formData.videoFileName && (
                        <div className="space-y-2 mt-2">
                          <div className="bg-primary/5 border border-primary/10 rounded-xl p-3.5 flex items-center justify-between text-xs text-primary font-medium">
                            <span className="truncate max-w-[250px]">{formData.videoFileName}</span>
                            <span className="text-[10px] bg-primary/10 px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider">Ready to review</span>
                          </div>
                          {formData.videoProof && (
                            <div className="rounded-2xl overflow-hidden border border-border aspect-video bg-black max-w-md mx-auto relative shadow-inner mt-2">
                              <video 
                                src={formData.videoProof}
                                controls
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Image Proofs */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground mb-1.5 block">Image Proofs (Close-up damage photos) <span className="text-destructive">*</span></label>
                      <div className="border-2 border-dashed border-border rounded-2xl p-6 flex flex-col items-center justify-center bg-muted/20 relative group hover:border-primary transition-colors">
                        <input 
                          type="file" 
                          accept="image/*" 
                          multiple 
                          onChange={handleImagesUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                        />
                        <MapPin className="w-8 h-8 text-muted-foreground group-hover:text-primary mb-2 transition-colors" />
                        <span className="text-xs font-semibold text-foreground/80">Drag & drop or click to upload crop damage photos</span>
                        <span className="text-[10px] text-muted-foreground mt-1">JPEG, PNG, or WEBP (Select one or more)</span>
                      </div>
                      
                      {formData.imageProofs.length > 0 && (
                        <div className="grid grid-cols-3 gap-3 mt-4">
                          {formData.imageProofs.map((img, idx) => (
                            <div key={idx} className="relative h-20 rounded-xl overflow-hidden border border-border bg-muted">
                              <img src={img} className="w-full h-full object-cover" alt={`Proof ${idx + 1}`} />
                              <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-[8px] text-white truncate text-center">
                                {formData.imageFileNames[idx]}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 5: BUDGET & FINANCIAL NEEDS */}
              {step === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-bold font-poppins text-foreground mb-1">Financial Requirements</h3>
                    <p className="text-sm text-muted-foreground">Specify the total recovery amount requested for this case.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1.5 block">Requested Recovery Funds (₹) <span className="text-destructive">*</span></label>
                      <input 
                        type="number" 
                        name="recoveryGoal"
                        value={formData.recoveryGoal}
                        onChange={handleInputChange}
                        placeholder="e.g. 50000" 
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm" 
                        required 
                      />
                      <p className="text-[11px] text-muted-foreground mt-1.5">
                        Enter the total estimated budget required for seed procurement, fertilizer, labor, and soil replenishment. Note: NGOs will review and set the final goal amount after verification.
                      </p>
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
                  disabled={isSubmitting}
                  className="px-6 py-3 border border-border rounded-xl text-sm font-semibold hover:bg-muted/50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <div />
              )}

              {step < 5 ? (
                <button 
                  type="button" 
                  onClick={nextStep}
                  disabled={isSubmitting}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-secondary text-secondary-foreground px-8 py-3 rounded-xl text-sm font-bold hover:bg-secondary/90 transition-transform active:scale-95 shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Uploading..." : "Submit Profile"} <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
