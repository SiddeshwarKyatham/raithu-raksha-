import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { getFarmerByToken, submitFarmerVerification, resendVerificationLink, uploadToCloudinary, Farmer, getOptimizedImageUrl, getOptimizedVideoUrl } from "../utils/db";
import { ShieldCheck, AlertCircle, Loader2, CheckCircle2, Upload, Trash2, ArrowRight, User, Phone, MapPin, Building, CreditCard } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export function FarmerVerify() {
  const { token } = useParams<{ token: string }>();
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorType, setErrorType] = useState<"invalid" | "expired" | "used" | null>(null);
  const [errorFarmerId, setErrorFarmerId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Form State
  const [editForm, setEditForm] = useState({
    name: "",
    age: "",
    district: "",
    village: "",
    crop: "",
    disaster: "",
    damage: "",
    requestedAmount: "",
    story: "",
    locationLink: "",
    videoProof: "",
    imageProofs: [] as string[]
  });

  // Bank Details State
  const [bankDetails, setBankDetails] = useState({
    accountName: "",
    accountNumber: "",
    ifsc: "",
    bankName: ""
  });

  // File Upload State
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    if (token) {
      loadFarmerData();
    }
  }, [token]);

  const loadFarmerData = async () => {
    setLoading(true);
    setErrorType(null);
    try {
      const data = await getFarmerByToken(token!);
      setFarmer(data);
      setEditForm({
        name: data.name || "",
        age: data.age ? data.age.toString() : "",
        district: data.district || "",
        village: data.village || "",
        crop: data.crop || "",
        disaster: data.disaster || "",
        damage: data.damage || "",
        requestedAmount: data.requestedAmount ? data.requestedAmount.toString() : "",
        story: data.story || "",
        locationLink: data.locationLink || "",
        videoProof: data.videoProof || "",
        imageProofs: data.imageProofs || []
      });
      if (data.bankDetails) {
        setBankDetails({
          accountName: data.bankDetails.accountName || "",
          accountNumber: data.bankDetails.accountNumber || "",
          ifsc: data.bankDetails.ifsc || "",
          bankName: data.bankDetails.bankName || ""
        });
      }
    } catch (err: any) {
      console.error(err);
      if (err.message.includes("expired")) {
        setErrorType("expired");
        // Try to extract farmer ID if returned by api
        // Simple extraction fallback:
        try {
          const res = await fetch(`/api/farmer-by-token?token=${encodeURIComponent(token!)}`);
          const body = await res.json();
          if (body.farmerId) setErrorFarmerId(body.farmerId);
        } catch {}
      } else if (err.message.includes("used")) {
        setErrorType("used");
      } else {
        setErrorType("invalid");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBankDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFile(true);
    try {
      const file = files[0];
      const reader = new FileReader();
      
      const uploadPromise = new Promise<string>((resolve, reject) => {
        reader.onload = async () => {
          try {
            const url = await uploadToCloudinary(reader.result as string, type);
            resolve(url);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = () => reject(new Error("File reading failed."));
        reader.readAsDataURL(file);
      });

      toast.promise(uploadPromise, {
        loading: `Uploading ${type} to secure storage...`,
        success: (url) => {
          if (type === 'video') {
            setEditForm(prev => ({ ...prev, videoProof: url }));
          } else {
            setEditForm(prev => ({ ...prev, imageProofs: [...prev.imageProofs, url] }));
          }
          return `${type === 'video' ? 'Video' : 'Photo'} uploaded successfully!`;
        },
        error: "Upload failed. Please check file format."
      });

      await uploadPromise;
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      imageProofs: prev.imageProofs.filter((_, i) => i !== index)
    }));
  };

  const handleResendLink = async () => {
    if (!farmer && !errorFarmerId) return;
    const fId = farmer ? farmer.id : errorFarmerId;
    if (!fId) return;

    setIsResending(true);
    try {
      const res = await resendVerificationLink(fId);
      if (res.success) {
        toast.success(res.message || "A new verification link has been sent to your WhatsApp!");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to resend verification link.");
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    // Validation
    if (!bankDetails.accountName || !bankDetails.accountNumber || !bankDetails.ifsc) {
      toast.error("Please fill in all bank details to receive support funds.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await submitFarmerVerification(token, {
        ...editForm,
        bankDetails
      });

      if (response.success) {
        setDonationStep(4); // Success step flag
        confetti({ particleCount: 150, spread: 85, origin: { y: 0.6 } });
        toast.success("Application successfully submitted!");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [donationStep, setDonationStep] = useState(1); // 1 = form, 4 = success

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground text-sm font-medium">Validating secure token details...</p>
      </div>
    );
  }

  if (errorType === "invalid") {
    return (
      <div className="container mx-auto px-4 py-20 max-w-md text-center">
        <div className="bg-destructive/10 text-destructive w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold font-poppins text-foreground mb-3">Invalid Link</h2>
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          The link you used is invalid or incorrectly formatted. Please contact your NGO coordinator.
        </p>
        <Link to="/" className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors">
          Return Home
        </Link>
      </div>
    );
  }

  if (errorType === "used") {
    return (
      <div className="container mx-auto px-4 py-20 max-w-md text-center">
        <div className="bg-secondary/15 text-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold font-poppins text-foreground mb-3">Verification Already Completed</h2>
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          Your profile and bank details have already been verified and submitted for final NGO approval. No further action is required.
        </p>
        <Link to="/" className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors">
          Return Home
        </Link>
      </div>
    );
  }

  if (errorType === "expired") {
    return (
      <div className="container mx-auto px-4 py-20 max-w-md text-center">
        <div className="bg-destructive/10 text-destructive w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold font-poppins text-foreground mb-3">Link Expired</h2>
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          Verification links expire after 24 hours for security. Please request a new link to proceed with your application.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={handleResendLink}
            disabled={isResending}
            className="w-full bg-primary text-primary-foreground py-3 rounded-full font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            {isResending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Resend Verification Link via WhatsApp
          </button>
          <Link to="/" className="text-sm font-semibold text-muted-foreground hover:underline">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  if (donationStep === 4) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-md text-center">
        <div className="bg-secondary/15 text-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 animate-bounce" />
        </div>
        <h2 className="text-3xl font-bold font-poppins text-foreground mb-3 font-poppins">Details Verified!</h2>
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
          Thank you, <span className="font-semibold text-foreground">{editForm.name}</span>. Your details and bank account have been successfully confirmed.
        </p>
        
        <div className="bg-muted/40 border border-border rounded-2xl p-6 text-left text-xs mb-8 space-y-3">
          <h4 className="font-bold text-foreground text-sm border-b border-border/50 pb-2 mb-2 uppercase tracking-wide">Application Checklist</h4>
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <span className="text-secondary font-bold">✓</span> Farmer Contact Verified
          </div>
          <div className="flex items-center gap-2 text-muted-foreground font-semibold">
            <span className="text-amber-500 font-bold">●</span> NGO Field Audit Verification (Pending)
          </div>
          <div className="flex items-center gap-2 text-muted-foreground font-semibold">
            <span className="text-muted-foreground/50 font-bold">○</span> Campaign Publication & Fundraising
          </div>
        </div>

        <Link to="/" className="bg-primary text-primary-foreground px-8 py-3.5 rounded-full font-bold text-sm hover:bg-primary/90 transition-all">
          Go to Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold px-3 py-1 rounded-full mb-3">
            <ShieldCheck className="w-4 h-4" /> Secure Verification Portal
          </div>
          <h1 className="text-3xl font-bold font-poppins text-foreground mb-2">Review & Verify Application</h1>
          <p className="text-muted-foreground text-sm">Please verify your details and enter bank details to activate your recovery campaign.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Farmer & Crisis Details */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
            <h3 className="text-lg font-bold font-poppins text-primary border-b border-border/50 pb-3 flex items-center gap-2">
              <User className="w-5 h-5" /> 1. Personal & Crisis Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">Age</label>
                <input
                  type="number"
                  name="age"
                  value={editForm.age}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">District</label>
                <input
                  type="text"
                  name="district"
                  value={editForm.district}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">Village</label>
                <input
                  type="text"
                  name="village"
                  value={editForm.village}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">Crop Damaged</label>
                <input
                  type="text"
                  name="crop"
                  value={editForm.crop}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">Disaster Type</label>
                <input
                  type="text"
                  name="disaster"
                  value={editForm.disaster}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">Damage Percentage (%)</label>
                <input
                  type="text"
                  name="damage"
                  value={editForm.damage}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">Requested Support Goal (₹)</label>
                <input
                  type="number"
                  name="requestedAmount"
                  value={editForm.requestedAmount}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">Your Story Description</label>
              <textarea
                name="story"
                rows={4}
                value={editForm.story}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium leading-relaxed"
                placeholder="Brief description of the crop damage and financial support required..."
                required
              />
            </div>
          </div>

          {/* Section 2: Uploads & Verification Evidence */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
            <h3 className="text-lg font-bold font-poppins text-primary border-b border-border/50 pb-3 flex items-center gap-2">
              <Upload className="w-5 h-5" /> 2. Verification Evidence
            </h3>

            {/* Video Proof */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-foreground block">Walkthrough Video Proof (Max 20MB)</label>
              
              {editForm.videoProof ? (
                <div className="relative rounded-2xl overflow-hidden border border-border bg-black max-w-sm">
                  <video src={getOptimizedVideoUrl(editForm.videoProof)} controls className="w-full h-48 object-cover" />
                  <button
                    type="button"
                    onClick={() => setEditForm(prev => ({ ...prev, videoProof: "" }))}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-destructive text-white p-2 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-muted/20">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="text-xs font-semibold text-foreground">Upload brief video proof</span>
                  <span className="text-[10px] text-muted-foreground">30-45s walkthrough video</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileUpload(e, 'video')}
                    className="hidden"
                    disabled={uploadingFile}
                  />
                </label>
              )}
            </div>

            {/* Photo Proofs */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-foreground block">Additional Crop / ID Proof Photos</label>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {editForm.imageProofs.map((img, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden border border-border h-24">
                    <img src={getOptimizedImageUrl(img, 200)} alt="Proof preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-destructive text-white p-1 rounded-full transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <label className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl flex flex-col items-center justify-center h-24 cursor-pointer transition-colors bg-muted/20">
                  <Upload className="w-5 h-5 text-muted-foreground mb-1" />
                  <span className="text-[10px] font-bold text-foreground">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'image')}
                    className="hidden"
                    disabled={uploadingFile}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Bank Account Details */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
            <h3 className="text-lg font-bold font-poppins text-primary border-b border-border/50 pb-3 flex items-center gap-2">
              <Building className="w-5 h-5" /> 3. Bank Account Information (For Fund Disbursement)
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">Account Holder Name</label>
                <input
                  type="text"
                  name="accountName"
                  value={bankDetails.accountName}
                  onChange={handleBankChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                  placeholder="Enter name as in passbook"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  value={bankDetails.bankName}
                  onChange={handleBankChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                  placeholder="e.g. State Bank of India"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">Account Number</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={bankDetails.accountNumber}
                  onChange={handleBankChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                  placeholder="Enter account number"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">IFSC Code</label>
                <input
                  type="text"
                  name="ifsc"
                  value={bankDetails.ifsc}
                  onChange={handleBankChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold"
                  placeholder="e.g. SBIN0020123"
                  required
                />
              </div>
            </div>

            <div className="flex items-start gap-3 bg-secondary/5 p-4 border border-secondary/20 rounded-xl mt-2 text-xs text-secondary leading-normal">
              <CreditCard className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
              <p>
                <strong>Double-check Bank details:</strong> Registered crowdfunding proceeds are directly transferred to this account. Ensure IFSC and account numbers are entered accurately.
              </p>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || uploadingFile}
              className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              Submit Final Application
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
