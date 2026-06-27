import { useState, useEffect } from "react";
import { 
  getFarmers, 
  verifyFarmer, 
  updateFarmerDetails, 
  deleteFarmer,
  getDonations, 
  Farmer, 
  Donation,
  getOptimizedImageUrl,
  getOptimizedVideoUrl,
  uploadToCloudinary
} from "../utils/db";
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  Edit3, 
  Trash2, 
  Coins, 
  Search, 
  ClipboardList,
  PlusCircle,
  Loader2,
  Upload
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";

export function Admin() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "verified" | "donations">("pending");
  const [search, setSearch] = useState("");
  
  // NGO Passcode Authorization State
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [inputPasscode, setInputPasscode] = useState("");

  // Edit Dialog State
  const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    age: "",
    district: "",
    village: "",
    crop: "",
    disaster: "",
    damage: "",
    goal: "",
    story: "",
    farmerPhone: "",
    requestedAmount: "",
    locationLink: ""
  });

  // Collapsible case, lightbox overlay, and verify approval states
  const [expandedCase, setExpandedCase] = useState<number | null>(null);
  const [selectedImageOverlay, setSelectedImageOverlay] = useState<string | null>(null);
  const [approvingCase, setApprovingCase] = useState<Farmer | null>(null);
  const [approvedGoalInput, setApprovedGoalInput] = useState("");
  const [approvedStoryInput, setApprovedStoryInput] = useState("");
  const [breakdownItems, setBreakdownItems] = useState<{ item: string; cost: number }[]>([]);
  // Recovery updates posting states
  const [updatingFarmer, setUpdatingFarmer] = useState<Farmer | null>(null);
  const [updateText, setUpdateText] = useState("");
  const [updateFile, setUpdateFile] = useState<string | null>(null);
  const [updateFileType, setUpdateFileType] = useState<'image' | 'video'>('image');
  const [isUploadingUpdate, setIsUploadingUpdate] = useState(false);

  const handleUpdateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUpdateFile(reader.result as string);
      setUpdateFileType(file.type.startsWith('video') ? 'video' : 'image');
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingFarmer) return;

    if (!updateText.trim()) {
      toast.error("Please enter an update description.");
      return;
    }

    setIsUploadingUpdate(true);
    try {
      let mediaUrl = "";
      if (updateFile) {
        mediaUrl = await uploadToCloudinary(updateFile, updateFileType);
      }

      // Add to timeline
      const newTimelineItem = {
        title: `Recovery Update: ${updateFileType === 'video' ? 'Video Posted' : 'Progress'}`,
        description: updateText,
        date: "Just now",
        status: "completed" as const
      };

      const updatedTimeline = [...(updatingFarmer.timeline || []), newTimelineItem];
      const updatedGallery = mediaUrl ? [...(updatingFarmer.gallery || []), mediaUrl] : (updatingFarmer.gallery || []);

      const updatePayload: Partial<Farmer> = {
        timeline: updatedTimeline,
        gallery: updatedGallery
      };

      if (updateFileType === 'video' && mediaUrl) {
        updatePayload.videoProof = mediaUrl;
      }

      await updateFarmerDetails(updatingFarmer.id, updatePayload);
      toast.success("Recovery update successfully posted!");
      setUpdatingFarmer(null);
      setUpdateText("");
      setUpdateFile(null);
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to post recovery update.");
    } finally {
      setIsUploadingUpdate(false);
    }
  };

  const loadData = () => {
    setLoading(true);
    Promise.all([getFarmers(), getDonations()])
      .then(([farmersData, donationsData]) => {
        setFarmers(farmersData);
        setDonations(donationsData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        toast.error("Failed to load verification reports from database.");
        setLoading(false);
      });
  };

  useEffect(() => {
    if (isAuthorized) {
      loadData();
    }
  }, [isAuthorized]);

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPasscode === "rythu2026") {
      setIsAuthorized(true);
      toast.success("NGO access granted.");
    } else {
      toast.error("Incorrect passcode. Access Denied.");
    }
  };

  const startApproval = (farmer: Farmer) => {
    setApprovingCase(farmer);
    const reqAmt = farmer.requestedAmount || farmer.goal || 40000;
    setApprovedGoalInput(reqAmt.toString());
    setApprovedStoryInput(
      farmer.story === "Pending verification and story addition by NGO admin."
        ? ""
        : farmer.story
    );

    // Load or calculate default breakdown
    if (farmer.breakdown && farmer.breakdown.length > 0) {
      setBreakdownItems(farmer.breakdown);
    } else {
      const seeds = Math.round(reqAmt * 0.35);
      const fertilizer = Math.round(reqAmt * 0.35);
      const labor = reqAmt - (seeds + fertilizer);
      setBreakdownItems([
        { item: "High-Quality Seeds", cost: seeds },
        { item: "Pest-resistant Fertilizers", cost: fertilizer },
        { item: "Initial Labor & Land Prep", cost: labor }
      ]);
    }
  };

  const handleConfirmApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingCase) return;

    const approvedAmount = parseFloat(approvedGoalInput) || 0;
    if (approvedAmount <= 0) {
      toast.error("Please enter a valid approved amount greater than 0.");
      return;
    }

    if (approvedStoryInput.trim().length < 20) {
      toast.error("Please enter a detailed story of at least 20 characters.");
      return;
    }

    // Validate that budget items sum up to approvedAmount
    const breakdownSum = breakdownItems.reduce((sum, item) => sum + item.cost, 0);
    if (breakdownSum !== approvedAmount) {
      if (confirm(`The sum of your budget breakdown items (₹${breakdownSum.toLocaleString()}) does not match the Approved Goal Amount (₹${approvedAmount.toLocaleString()}). Do you want to adjust the Goal Amount to ₹${breakdownSum.toLocaleString()}?`)) {
        verifyFarmer(approvingCase.id, breakdownSum, approvedStoryInput, breakdownItems)
          .then((verified) => {
            if (verified) {
              toast.success(`${verified.name}'s profile is now verified and active for fundraising!`);
              setApprovingCase(null);
              loadData();
            }
          })
          .catch(err => {
            console.error(err);
            toast.error("Failed to verify case.");
          });
        return;
      }
      return;
    }

    verifyFarmer(approvingCase.id, approvedAmount, approvedStoryInput, breakdownItems)
      .then((verified) => {
        if (verified) {
          toast.success(`${verified.name}'s profile is now verified and active for fundraising!`);
          setApprovingCase(null);
          loadData();
        }
      })
      .catch(err => {
        console.error(err);
        toast.error("Failed to verify case.");
      });
  };

  const handleVerify = (id: number) => {
    verifyFarmer(id, 0)
      .then((verified) => {
        if (verified) {
          toast.success(`${verified.name}'s profile is now verified!`);
          loadData();
        }
      })
      .catch(err => {
        console.error(err);
        toast.error("Failed to verify case.");
      });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to permanently delete this report case?")) {
      deleteFarmer(id)
        .then(() => {
          toast.success("Case profile successfully deleted.");
          loadData();
        })
        .catch(err => {
          console.error(err);
          toast.error("Failed to delete case.");
        });
    }
  };

  const openEditModal = (farmer: Farmer) => {
    setEditingFarmer(farmer);
    
    // Get base disaster name (without percentage)
    const disasterBase = farmer.disaster.split(" (")[0];
    const damageVal = farmer.damage.replace("%", "");

    setEditFormData({
      name: farmer.name,
      age: farmer.age.toString(),
      district: farmer.district,
      village: farmer.village,
      crop: farmer.crop,
      disaster: disasterBase,
      damage: damageVal,
      goal: farmer.goal.toString(),
      story: farmer.story,
      farmerPhone: farmer.farmerPhone || "",
      requestedAmount: farmer.requestedAmount?.toString() || farmer.goal.toString() || "",
      locationLink: farmer.locationLink || ""
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFarmer) return;

    const totalGoal = parseFloat(editFormData.goal) || 0;

    updateFarmerDetails(editingFarmer.id, {
      name: editFormData.name,
      age: parseInt(editFormData.age) || editingFarmer.age,
      district: editFormData.district,
      village: editFormData.village,
      crop: editFormData.crop,
      disaster: `${editFormData.disaster} (${editFormData.damage}% Damage)`,
      damage: `${editFormData.damage}%`,
      goal: totalGoal,
      story: editFormData.story,
      breakdown: [],
      farmerPhone: editFormData.farmerPhone,
      requestedAmount: parseFloat(editFormData.requestedAmount) || 0,
      locationLink: editFormData.locationLink
    })
      .then((updated) => {
        if (updated) {
          toast.success(`Successfully updated details for ${updated.name}!`);
          setEditingFarmer(null);
          loadData();
        }
      })
      .catch(err => {
        console.error(err);
        toast.error("Failed to update details.");
      });
  };

  // Passcode gate rendering
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card border border-border p-8 rounded-3xl max-w-sm w-full shadow-2xl relative overflow-hidden text-center flex flex-col items-center gap-6">
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />
          
          <div className="w-16 h-16 rounded-full bg-[#1b5e20]/15 flex items-center justify-center text-[#1b5e20] mb-2">
            <ShieldCheck className="w-9 h-9" />
          </div>

          <div>
            <h2 className="text-2xl font-poppins font-bold text-foreground">NGO Portal Access</h2>
            <p className="text-muted-foreground text-xs mt-2">Enter your verification passcode to manage platform cases.</p>
          </div>

          <form onSubmit={handlePasscodeSubmit} className="space-y-4 w-full relative z-10">
            <input 
              type="password" 
              placeholder="••••••••" 
              value={inputPasscode}
              onChange={(e) => setInputPasscode(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-center font-bold tracking-widest text-lg transition-all text-foreground"
              required
            />
            <button 
              type="submit" 
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors shadow-md shadow-primary/10"
            >
              Verify & Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filter lists
  const pendingCases = farmers.filter(f => !f.verified || f.status === 'NGO Submitted' || f.status === 'Farmer Contact Pending' || f.status === 'Farmer Contact Verified');
  const verifiedCases = farmers.filter(f => f.verified || f.status === 'Fundraising' || f.status === 'Fully Funded' || f.status === 'Funds Released');

  const filteredPending = pendingCases.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.district.toLowerCase().includes(search.toLowerCase()) ||
    f.crop.toLowerCase().includes(search.toLowerCase())
  );

  const filteredVerified = verifiedCases.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.district.toLowerCase().includes(search.toLowerCase()) ||
    f.crop.toLowerCase().includes(search.toLowerCase())
  );

  // Stats calculation
  const totalCases = farmers.length;
  const pendingCount = pendingCases.length;
  const verifiedCount = verifiedCases.length;
  const totalRaised = farmers.reduce((acc, f) => acc + f.raised, 0);

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-poppins font-bold text-foreground">NGO Verification Portal</h1>
            <p className="text-muted-foreground text-sm mt-1">Review, verify, and manage farmer distress reports submitted by community members.</p>
          </div>
          <div className="flex items-center gap-2 bg-[#1b5e20]/15 border border-[#1b5e20]/20 text-[#1b5e20] px-4 py-2 rounded-xl text-xs font-semibold max-w-[200px]">
            <ShieldCheck className="w-5 h-5 shrink-0" /> NGO Verified Session
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-card border border-border p-6 rounded-3xl shadow-sm flex items-center gap-5">
            <div className="p-4 bg-muted rounded-2xl text-foreground">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Total Reports</p>
              <p className="text-2xl font-bold mt-0.5">{totalCases}</p>
            </div>
          </div>
          <div className="bg-card border border-border p-6 rounded-3xl shadow-sm flex items-center gap-5">
            <div className="p-4 bg-destructive/15 rounded-2xl text-destructive">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Awaiting Verify</p>
              <p className="text-2xl font-bold mt-0.5 text-destructive">{pendingCount}</p>
            </div>
          </div>
          <div className="bg-card border border-border p-6 rounded-3xl shadow-sm flex items-center gap-5">
            <div className="p-4 bg-[#1b5e20]/15 rounded-2xl text-[#1b5e20]">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Verified & Active</p>
              <p className="text-2xl font-bold mt-0.5 text-[#1b5e20]">{verifiedCount}</p>
            </div>
          </div>
          <div className="bg-card border border-border p-6 rounded-3xl shadow-sm flex items-center gap-5">
            <div className="p-4 bg-secondary/15 rounded-2xl text-secondary-foreground">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Total Funds Raised</p>
              <p className="text-2xl font-bold mt-0.5 text-secondary-foreground">₹{totalRaised.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Tab Controls and Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-4 mb-8 gap-4">
          <div className="flex gap-2 bg-muted/50 p-1.5 rounded-xl border border-border w-fit">
            <button
              onClick={() => { setActiveTab("pending"); setSearch(""); }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "pending"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pending Verification ({pendingCount})
            </button>
            <button
              onClick={() => { setActiveTab("verified"); setSearch(""); }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "verified"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Verified Fundraisers ({verifiedCount})
            </button>
            <button
              onClick={() => { setActiveTab("donations"); setSearch(""); }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "donations"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Donations Feed
            </button>
          </div>

          {activeTab !== "donations" && (
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search by name, district, crop..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          )}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 border-4 border-[#1b5e20] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-muted-foreground">Fetching records from PostgreSQL...</p>
          </div>
        ) : (
          <>
            {/* Tab Contents */}
            {activeTab === "pending" && (
              <div>
                {filteredPending.length === 0 ? (
                  <div className="text-center py-16 bg-card border border-border rounded-3xl">
                    <p className="text-muted-foreground text-sm">No pending verification cases found.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredPending.map(farmer => (
                      <div key={farmer.id} className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-poppins font-bold text-lg text-foreground">{farmer.name}, {farmer.age}</h3>
                              <p className="text-xs text-muted-foreground mt-0.5">{farmer.village}, {farmer.district} District</p>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                                farmer.status === 'NGO Submitted' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                                farmer.status === 'Farmer Contact Pending' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                                farmer.status === 'Farmer Contact Verified' ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' :
                                'bg-destructive/10 text-destructive border-destructive/20'
                              }`}>
                                {farmer.status || 'NGO Submitted'}
                              </span>
                              <span className="bg-destructive/10 border border-destructive/20 text-destructive text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                {farmer.damage} Damage
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 bg-muted/30 border border-border/50 p-4 rounded-xl mb-4 text-xs">
                            <div>
                              <span className="text-muted-foreground block font-medium">Crop Cultivated</span>
                              <span className="font-bold text-foreground mt-0.5 block">{farmer.crop}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block font-medium">Disaster Category</span>
                              <span className="font-bold text-foreground mt-0.5 block max-w-[150px] truncate">{farmer.disaster.split(" (")[0]}</span>
                            </div>
                            <div className="col-span-2 border-t border-border/50 pt-2">
                              <span className="text-muted-foreground block font-medium">Requested Recovery Funds</span>
                              <span className="font-bold text-primary text-sm mt-0.5 block">₹{(farmer.requestedAmount || farmer.goal).toLocaleString()}</span>
                            </div>
                          </div>

                          <p className="text-xs text-foreground/80 leading-relaxed line-clamp-3 mb-4">
                            {farmer.story}
                          </p>

                          {/* Collapsible Evidence Section */}
                          <div className="mt-4 border-t border-border pt-4 mb-6">
                            <button 
                              type="button" 
                              onClick={() => setExpandedCase(expandedCase === farmer.id ? null : farmer.id)}
                              className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5"
                            >
                              {expandedCase === farmer.id ? "Hide Evidence & Uploads" : "Review Evidence & Uploads"}
                            </button>
                            
                            {expandedCase === farmer.id && (
                              <div className="mt-4 space-y-4 bg-muted/20 border border-border p-4 rounded-2xl animate-fade-in text-xs">
                                {farmer.farmerPhone && (
                                  <div>
                                    <span className="text-muted-foreground font-medium">Farmer Phone: </span>
                                    <a href={`tel:${farmer.farmerPhone}`} className="text-primary font-bold hover:underline">{farmer.farmerPhone}</a>
                                  </div>
                                )}
                                
                                {farmer.locationLink && (
                                  <div className="space-y-2">
                                    <div>
                                      <span className="text-muted-foreground font-medium">Field Location: </span>
                                      <a href={farmer.locationLink} target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline break-all">{farmer.locationLink}</a>
                                    </div>
                                    <div className="rounded-xl overflow-hidden border border-border h-48 w-full shadow-inner relative mt-1 bg-muted">
                                      <iframe
                                        title={`Map for ${farmer.name}`}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        loading="lazy"
                                        src={(() => {
                                          let query = `${farmer.village}, ${farmer.district}`;
                                          try {
                                            if (farmer.locationLink && !farmer.locationLink.startsWith('http')) {
                                              query = farmer.locationLink;
                                            } else if (farmer.locationLink && farmer.locationLink.includes('?q=')) {
                                              const qParam = new URL(farmer.locationLink).searchParams.get('q');
                                              if (qParam) query = qParam;
                                            } else if (farmer.locationLink && farmer.locationLink.includes('/maps/place/')) {
                                              const part = farmer.locationLink.split('/maps/place/')[1]?.split('/')[0];
                                              if (part) query = decodeURIComponent(part.replace(/\+/g, ' '));
                                            }
                                          } catch (e) {
                                            console.error("Error parsing location link", e);
                                          }
                                          return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
                                        })()}
                                      />
                                    </div>
                                  </div>
                                )}
                                
                                {farmer.videoProof && (
                                  <div className="space-y-1.5">
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Video Proof Walkthrough</span>
                                    <div className="rounded-xl overflow-hidden border border-border aspect-video bg-black relative">
                                      <video 
                                        src={getOptimizedVideoUrl(farmer.videoProof)}
                                        controls
                                        className="w-full h-full object-cover"
                                        poster="https://images.unsplash.com/photo-1681226298721-88cdb4096e5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBhZ3JpY3VsdHVyZSUyMGZpZWxkc3xlbnwxfHx8fDE3ODE1NDcyODh8MA&ixlib=rb-4.1.0&q=80&w=600"
                                      />
                                    </div>
                                  </div>
                                )}
                                
                                {farmer.imageProofs && farmer.imageProofs.length > 0 && (
                                  <div className="space-y-1.5">
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Image Proofs ({farmer.imageProofs.length})</span>
                                    <div className="grid grid-cols-3 gap-2">
                                      {farmer.imageProofs.map((img, idx) => (
                                        <div 
                                          key={idx} 
                                          className="relative aspect-video rounded-lg overflow-hidden border border-border cursor-pointer group bg-muted" 
                                          onClick={() => setSelectedImageOverlay(img)}
                                        >
                                          <img src={getOptimizedImageUrl(img, 300)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={`Damage proof ${idx+1}`} />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {farmer.status === 'Farmer Contact Pending' && farmer.verificationToken && (
                                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                                    <span className="text-[10px] text-amber-700 uppercase font-bold tracking-wider block">Verification Link Actions</span>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                      <input 
                                        type="text" 
                                        readOnly 
                                        value={`${window.location.origin}/farmer/verify/${farmer.verificationToken}`} 
                                        className="flex-1 bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs text-foreground font-mono"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(`${window.location.origin}/farmer/verify/${farmer.verificationToken}`);
                                          toast.success("Verification link copied to clipboard!");
                                        }}
                                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
                                      >
                                        Copy
                                      </button>
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          try {
                                            const res = await resendVerificationLink(farmer.id);
                                            if (res.success) toast.success("Verification link successfully regenerated!");
                                          } catch (err: any) {
                                            toast.error(err.message || "Failed to regenerate link.");
                                          }
                                        }}
                                        className="bg-[#1a3627] hover:bg-[#1a3627]/90 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
                                      >
                                        Regenerate Link
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {farmer.bankDetails && farmer.bankDetails.accountNumber && (
                                  <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-2">
                                    <span className="text-[10px] text-indigo-700 uppercase font-bold tracking-wider block">Bank Details for Disbursal</span>
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                      <div><span className="text-muted-foreground block font-medium">Account Name</span><span className="font-bold text-foreground block">{farmer.bankDetails.accountName}</span></div>
                                      <div><span className="text-muted-foreground block font-medium">Bank Name</span><span className="font-bold text-foreground block">{farmer.bankDetails.bankName}</span></div>
                                      <div><span className="text-muted-foreground block font-medium">Account Number</span><span className="font-bold text-foreground block">{farmer.bankDetails.accountNumber}</span></div>
                                      <div><span className="text-muted-foreground block font-medium">IFSC Code</span><span className="font-bold text-foreground block">{farmer.bankDetails.ifsc}</span></div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 border-t border-border pt-4 mt-auto">
                          <button 
                            onClick={() => startApproval(farmer)}
                            className="flex-1 bg-[#1b5e20] text-white py-2.5 rounded-xl text-xs font-bold hover:bg-[#1b5e20]/90 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <ShieldCheck className="w-4 h-4" /> Approve & Publish
                          </button>
                          <button 
                            onClick={() => openEditModal(farmer)}
                            className="p-2.5 border border-border rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Edit Details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(farmer.id)}
                            className="p-2.5 border border-destructive/20 hover:bg-destructive/10 text-destructive rounded-xl transition-colors"
                            title="Delete Case"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "verified" && (
              <div>
                {filteredVerified.length === 0 ? (
                  <div className="text-center py-16 bg-card border border-border rounded-3xl">
                    <p className="text-muted-foreground text-sm">No active verified fundraisers found.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredVerified.map(farmer => {
                      const progress = (farmer.raised / farmer.goal) * 100;
                      return (
                        <div key={farmer.id} className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                          <div>
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-poppins font-bold text-lg text-foreground">{farmer.name}, {farmer.age}</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">{farmer.village}, {farmer.district} District</p>
                              </div>
                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase flex items-center gap-1 ${
                                farmer.status === 'Fully Funded' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                farmer.status === 'Funds Released' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                'bg-[#1b5e20]/10 text-[#1b5e20] border border-[#1b5e20]/20'
                              }`}>
                                <ShieldCheck className="w-3.5 h-3.5" /> {farmer.status || 'Fundraising'}
                              </span>
                            </div>

                            {/* Progress */}
                            <div className="mb-4 bg-muted/20 border border-border/50 p-4 rounded-xl">
                              <div className="flex justify-between text-xs font-semibold mb-1">
                                <span className="text-primary font-bold">₹{farmer.raised.toLocaleString()} raised</span>
                                <span className="text-muted-foreground">₹{farmer.goal.toLocaleString()} goal</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div className="bg-[#1b5e20] h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                              </div>
                              <div className="text-[10px] text-muted-foreground mt-1 text-right">{Math.round(progress)}% funded</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 border-t border-border pt-4 mt-auto">
                            <button 
                              onClick={() => setUpdatingFarmer(farmer)}
                              className="bg-[#1b5e20] text-white px-3 py-2.5 rounded-xl text-xs font-bold hover:bg-[#1b5e20]/90 transition-all flex items-center justify-center gap-1.5"
                            >
                              <PlusCircle className="w-4 h-4" /> Post Update
                            </button>
                            <button 
                              onClick={() => openEditModal(farmer)}
                              className="flex-1 border border-border py-2.5 rounded-xl text-xs font-bold hover:bg-muted text-foreground transition-all flex items-center justify-center gap-1.5"
                            >
                              <Edit3 className="w-4 h-4" /> Edit Details
                            </button>
                            <button 
                              onClick={() => handleDelete(farmer.id)}
                              className="p-2.5 border border-destructive/20 hover:bg-destructive/10 text-destructive rounded-xl transition-colors"
                              title="Delete Case"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === "donations" && (
              <div className="max-w-4xl mx-auto bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
                <h3 className="font-poppins font-bold text-xl text-foreground mb-6">Master Transactions & Donations Feed</h3>
                
                <div className="space-y-4">
                  {donations.length === 0 ? (
                    <p className="text-muted-foreground text-center py-10 text-sm">No donations logged on the platform yet.</p>
                  ) : (
                    donations.map((donation) => (
                      <div key={donation.id} className="border border-border bg-muted/20 p-4 rounded-2xl flex items-start justify-between gap-4 text-sm hover:bg-muted/40 transition-colors">
                        <div>
                          <p className="font-bold text-foreground">{donation.donorName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Sponsoring recovery items for <span className="font-semibold text-primary">{donation.farmerName}</span></p>
                          {donation.message && (
                            <p className="text-xs italic text-primary bg-primary/5 p-3 rounded-lg border border-primary/10 mt-2 max-w-xl">
                              "{donation.message}"
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-secondary-foreground text-base">+ ₹{donation.amount.toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{donation.date}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}

      </div>

      {/* Edit Farmer Dialog */}
      <Dialog open={editingFarmer !== null} onOpenChange={(open) => !open && setEditingFarmer(null)}>
        <DialogContent className="sm:max-w-xl bg-card border border-border p-6 rounded-3xl relative overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="font-poppins font-bold text-lg text-foreground">Edit Case Profile</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">Modify case details, crop data, and allocate recovery budgets.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <label className="block mb-1 text-foreground">Farmer's Name</label>
                <input 
                  type="text" 
                  value={editFormData.name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-foreground">Age</label>
                <input 
                  type="number" 
                  value={editFormData.age}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, age: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-foreground">District</label>
                <input 
                  type="text" 
                  value={editFormData.district}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, district: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-foreground">Village</label>
                <input 
                  type="text" 
                  value={editFormData.village}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, village: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-foreground">Crop</label>
                <input 
                  type="text" 
                  value={editFormData.crop}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, crop: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-foreground">Disaster Category</label>
                <input 
                  type="text" 
                  value={editFormData.disaster}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, disaster: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block mb-1 text-foreground">Crop Damage (%)</label>
                <input 
                  type="number" 
                  min={10} 
                  max={100}
                  value={editFormData.damage}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, damage: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              {/* Budget Breakdown */}
              <div className="col-span-2 border-t border-border pt-3 mt-1">
                <label className="block mb-1 text-foreground font-poppins font-bold text-sm">Recovery Fund Goal (Approved Goal) (₹)</label>
                <input 
                  type="number" 
                  value={editFormData.goal}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, goal: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-foreground">Farmer's Phone Number</label>
                <input 
                  type="tel" 
                  value={editFormData.farmerPhone}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, farmerPhone: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-foreground">Requested Amount (₹)</label>
                <input 
                  type="number" 
                  value={editFormData.requestedAmount}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, requestedAmount: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block mb-1 text-foreground">Field Location / Google Maps Link</label>
                <input 
                  type="text" 
                  value={editFormData.locationLink}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, locationLink: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block mb-1 text-foreground">Detailed Story</label>
                <textarea 
                  rows={4}
                  value={editFormData.story}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, story: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-border">
              <button 
                type="button" 
                onClick={() => setEditingFarmer(null)}
                className="px-4 py-2 border border-border rounded-xl text-xs font-bold hover:bg-muted text-foreground transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-6 py-2 bg-[#1b5e20] text-white rounded-xl text-xs font-bold hover:bg-[#1b5e20]/90 transition-all shadow-md"
              >
                Save Updates
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Case Approval Dialog */}
      <Dialog open={approvingCase !== null} onOpenChange={(open) => !open && setApprovingCase(null)}>
        <DialogContent className="sm:max-w-xl bg-card border border-border p-6 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-poppins font-bold text-lg text-foreground">Approve Fundraiser Case</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Verify this case, write the official case story, and set the approved funding target to publish it on the platform.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmApproval} className="space-y-4 mt-4 text-xs">
            <div className="bg-muted/30 border border-border p-4 rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Farmer Name:</span>
                <span className="font-bold text-foreground">{approvingCase?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Requested Amount:</span>
                <span className="font-bold text-primary">₹{approvingCase?.requestedAmount?.toLocaleString() || approvingCase?.goal.toLocaleString()}</span>
              </div>
            </div>

            {/* Dynamic Budget Builder */}
            <div className="border border-border rounded-2xl p-4 bg-muted/20 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-poppins font-bold text-xs text-foreground">Allocation Budget Breakdown Builder</span>
                <button
                  type="button"
                  onClick={() => setBreakdownItems(prev => [...prev, { item: "", cost: 0 }])}
                  className="bg-primary/10 hover:bg-primary/20 text-primary px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
                >
                  + Add Line Item
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {breakdownItems.map((bItem, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Item name (e.g. Cotton Seeds)"
                      value={bItem.item}
                      onChange={(e) => {
                        const newItems = [...breakdownItems];
                        newItems[idx].item = e.target.value;
                        setBreakdownItems(newItems);
                      }}
                      className="flex-1 px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Cost (₹)"
                      value={bItem.cost || ""}
                      onChange={(e) => {
                        const newItems = [...breakdownItems];
                        const newCost = parseFloat(e.target.value) || 0;
                        newItems[idx].cost = newCost;
                        setBreakdownItems(newItems);
                        // Auto-update Approved Goal Input sum
                        const sum = newItems.reduce((acc, curr) => acc + curr.cost, 0);
                        setApprovedGoalInput(sum.toString());
                      }}
                      className="w-24 px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs font-semibold text-right"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newItems = breakdownItems.filter((_, i) => i !== idx);
                        setBreakdownItems(newItems);
                        const sum = newItems.reduce((acc, curr) => acc + curr.cost, 0);
                        setApprovedGoalInput(sum.toString());
                      }}
                      disabled={breakdownItems.length <= 1}
                      className="p-1.5 border border-destructive/20 hover:bg-destructive/10 text-destructive rounded-lg disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[11px] font-bold border-t border-border pt-2 text-foreground">
                <span>Calculated Total:</span>
                <span className="text-primary text-xs">₹{breakdownItems.reduce((sum, item) => sum + item.cost, 0).toLocaleString()}</span>
              </div>
            </div>

            <div>
              <label className="block mb-1 text-xs font-semibold text-foreground">Approved Goal Amount (₹) <span className="text-destructive">*</span></label>
              <input 
                type="number" 
                value={approvedGoalInput}
                onChange={(e) => setApprovedGoalInput(e.target.value)}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm font-semibold"
                placeholder="e.g. 45000"
                required
              />
              <p className="text-[10px] text-muted-foreground mt-1">Specify the final fundraising target to show publicly to donors.</p>
            </div>

            <div>
              <label className="block mb-1 text-xs font-semibold text-foreground">Detailed Story / Situation <span className="text-destructive">*</span></label>
              <textarea 
                value={approvedStoryInput}
                onChange={(e) => setApprovedStoryInput(e.target.value)}
                rows={5}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-xs leading-relaxed"
                placeholder="Write the official case details and family/economic distress story post-verification..."
                required
              />
              <p className="text-[10px] text-muted-foreground mt-1">Include details on field assessment, crop yield impact, and family dependency. (Min 20 characters)</p>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-border">
              <button 
                type="button" 
                onClick={() => setApprovingCase(null)}
                className="px-4 py-2 border border-border rounded-xl text-xs font-bold hover:bg-muted text-foreground transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-6 py-2 bg-[#1b5e20] text-white rounded-xl text-xs font-bold hover:bg-[#1b5e20]/90 transition-all shadow-md"
              >
                Approve & Publish Fundraiser
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Post Recovery Update Dialog */}
      <Dialog open={updatingFarmer !== null} onOpenChange={(open) => {
        if (!open) {
          setUpdatingFarmer(null);
          setUpdateText("");
          setUpdateFile(null);
        }
      }}>
        <DialogContent className="sm:max-w-md bg-card border border-border p-6 rounded-3xl relative">
          <DialogHeader>
            <DialogTitle className="font-poppins font-bold text-lg text-foreground">Post Recovery Update</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Share progress on the crop's recovery with pictures and videos for donors to see.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateSubmit} className="space-y-4 mt-2">
            <div>
              <label className="block mb-1 text-xs font-semibold text-foreground">Update Description <span className="text-destructive">*</span></label>
              <textarea 
                value={updateText}
                onChange={(e) => setUpdateText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-xs leading-relaxed"
                placeholder="Describe the current recovery state (e.g. Purchased seeds, sowing completed, crop is recovering well...)"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-xs font-semibold text-foreground">Attach Picture / Video</label>
              <div className="flex items-center gap-3">
                <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-6 cursor-pointer bg-background transition-colors text-center">
                  <Upload className="w-6 h-6 text-muted-foreground mb-1.5" />
                  <span className="text-xs font-medium text-foreground">Upload Media</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">JPEG, PNG or MP4</span>
                  <input 
                    type="file" 
                    accept="image/*,video/*"
                    onChange={handleUpdateFileChange}
                    className="hidden"
                  />
                </label>
              </div>
              {updateFile && (
                <div className="mt-3 text-xs bg-muted/40 p-2.5 border border-border rounded-xl flex items-center justify-between">
                  <span className="truncate font-semibold text-foreground">
                    Selected file ({updateFileType})
                  </span>
                  <button 
                    type="button" 
                    onClick={() => setUpdateFile(null)}
                    className="text-destructive font-semibold"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-border">
              <button 
                type="button" 
                onClick={() => setUpdatingFarmer(null)}
                className="px-4 py-2 border border-border rounded-xl text-xs font-bold hover:bg-muted text-foreground transition-all"
                disabled={isUploadingUpdate}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-6 py-2 bg-[#1b5e20] text-white rounded-xl text-xs font-bold hover:bg-[#1b5e20]/90 transition-all shadow-md flex items-center gap-1.5"
                disabled={isUploadingUpdate}
              >
                {isUploadingUpdate ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Post Update"
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Image Lightbox Dialog */}
      <Dialog open={selectedImageOverlay !== null} onOpenChange={(open) => !open && setSelectedImageOverlay(null)}>
        <DialogContent className="sm:max-w-3xl bg-black border-0 p-0 overflow-hidden flex items-center justify-center max-h-[80vh]">
          {selectedImageOverlay && (
            <img src={getOptimizedImageUrl(selectedImageOverlay, 1200)} className="max-w-full max-h-[80vh] object-contain" alt="Enlarged evidence proof" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
