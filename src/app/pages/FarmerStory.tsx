import { useParams, Link } from "react-router";
import { ShieldCheck, MapPin, Sprout, CheckCircle2, Heart, Share2, AlertTriangle, QrCode } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { getFarmerById, donateToFarmer, Farmer } from "../utils/db";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export function FarmerStory() {
  const { id } = useParams();
  const farmerId = Number(id);
  const [farmer, setFarmer] = useState<Farmer | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [isDonating, setIsDonating] = useState(false);
  const [donationStep, setDonationStep] = useState(1); // 1: Select Amount, 2: Payment, 3: Processing, 4: Success
  const [donationAmount, setDonationAmount] = useState("1000");
  const [donorName, setDonorName] = useState("");
  const [donorMessage, setDonorMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi"); // upi or card
  const [vpa, setVpa] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [mockOrderId, setMockOrderId] = useState("");

  useEffect(() => {
    setLoading(true);
    getFarmerById(farmerId)
      .then(data => {
        setFarmer(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [farmerId]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Story link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-muted-foreground">Loading farmer profile...</p>
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-3xl font-poppins font-bold mb-2 text-foreground">Profile Not Found</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          The farmer profile you are looking for does not exist or is currently undergoing offline verification.
        </p>
        <Link to="/farmers" className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors">
          Browse Verified Farmers
        </Link>
      </div>
    );
  }

  const handlePaymentStart = async () => {
    const amt = parseFloat(donationAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid donation amount.");
      return;
    }

    setDonationStep(3); // Show processing screen

    try {
      // 1. Fetch order details from backend
      const amountInPaise = Math.round(amt * 100);
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `receipt_farmer_${farmer.id}_${Date.now()}`
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to initialize payment order.");
      }

      const orderData = await res.json();

      // 2. If order creation failed (mock fallback), show simulated checkout
      //    Razorpay modal REQUIRES a valid order_id to work — without it, it crashes.
      if (orderData.is_mock) {
        setMockOrderId(orderData.order_id);
        setDonationStep(5);
        return;
      }

      // 3. Real order created successfully — load script and open Razorpay modal
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Razorpay Checkout script could not be loaded. Please check your internet connection.");
        setMockOrderId(orderData.order_id);
        setDonationStep(5);
        return;
      }

      const rzpOptions = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Rythu Raksha Foundation",
        description: `Recovery Support for ${farmer.name}`,
        order_id: orderData.order_id,
        handler: async function (response: any) {
          setDonationStep(3); // Verification in progress
          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                farmerId: farmer.id,
                amount: amt,
                donorName: donorName || "Anonymous Supporter",
                donorMessage: donorMessage
              })
            });

            if (!verifyRes.ok) {
              const verifyErr = await verifyRes.json().catch(() => ({}));
              throw new Error(verifyErr.error || "Payment signature verification failed.");
            }

            const verifyResult = await verifyRes.json();
            if (verifyResult.success) {
              if (verifyResult.farmer) setFarmer(verifyResult.farmer);
              setDonationStep(4);
              confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            } else {
              throw new Error("Verification response did not return success.");
            }
          } catch (dbErr: any) {
            console.error(dbErr);
            toast.error(dbErr.message || "Failed to verify transaction. Please contact support.");
            setDonationStep(1);
          }
        },
        prefill: {
          name: donorName,
          email: "donor@rythuraksha.org"
        },
        theme: {
          color: "#1a3627"
        },
        modal: {
          ondismiss: function() {
            toast.error("Payment checkout dismissed.");
            setDonationStep(1);
          }
        }
      };

      const rzp = new (window as any).Razorpay(rzpOptions);
      rzp.on('payment.failed', function (response: any) {
        console.error("Payment failed:", response.error);
        toast.error(response.error?.description || "Payment failed. Please try again.");
        setDonationStep(1);
      });
      rzp.open();

    } catch (err: any) {
      console.error("Order creation failed:", err);
      toast.error(err.message || "Failed to initialize payment. Try again.");
      setDonationStep(1);
    }
  };

  const progress = (farmer.raised / farmer.goal) * 100;

  return (
    <div className="bg-background min-h-screen pb-24">
      {/* Cinematic Hero */}
      <div className="relative h-[60vh] min-h-[400px] w-full">
        <ImageWithFallback 
          src={farmer.image} 
          alt={farmer.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full">
          <div className="container mx-auto px-4 md:px-6 pb-10">
            <div className="flex flex-wrap gap-3 mb-4">
              <span className="bg-white text-primary text-sm font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                <ShieldCheck className="w-4 h-4 text-secondary" /> NGO Verified
              </span>
              <span className="bg-destructive/90 text-white text-sm font-semibold px-4 py-1.5 rounded-full backdrop-blur-sm">
                {farmer.disaster}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-foreground mb-4">
              {farmer.name}, {farmer.age}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm md:text-base font-medium">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {farmer.village}, {farmer.district}</span>
              <span className="flex items-center gap-1"><Sprout className="w-4 h-4" /> {farmer.crop}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 mt-8">
        <div className="flex flex-col lg:flex-row gap-12 relative">
          
          {/* Left Column: Story & Details */}
          <div className="w-full lg:w-2/3 flex flex-col gap-12">
            
            {/* The Story */}
            <section>
              <h2 className="text-2xl font-poppins font-bold text-foreground mb-6">The Story</h2>
              <p className="text-foreground/80 leading-relaxed text-lg whitespace-pre-line">
                {farmer.story}
              </p>
            </section>

            {/* NGO Assessment */}
            <section className="bg-muted/30 rounded-2xl p-6 border border-border">
              <h3 className="text-xl font-poppins font-semibold text-foreground mb-6 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-primary" /> NGO Assessment Report
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Land Area</p>
                  <p className="font-semibold text-lg text-foreground">{farmer.landArea}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Primary Crop</p>
                  <p className="font-semibold text-lg text-foreground">{farmer.crop}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Crop Damage</p>
                  <p className="font-semibold text-lg text-destructive">{farmer.damage}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Verification</p>
                  <p className="font-semibold text-lg text-primary">On-site</p>
                </div>
              </div>
            </section>

            {/* Evidence Gallery */}
            <section>
              <h3 className="text-2xl font-poppins font-bold text-foreground mb-6">Field Evidence</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {farmer.gallery.map((img, i) => (
                  <div key={i} className="rounded-xl overflow-hidden h-48 border border-border">
                    <ImageWithFallback src={img} alt="Evidence" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            </section>

            {/* Timeline */}
            <section>
              <h3 className="text-2xl font-poppins font-bold text-foreground mb-6">Case Timeline</h3>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                
                {farmer.timeline.map((item, idx) => {
                  const isActive = item.status === "active";
                  const isCompleted = item.status === "completed";
                  return (
                    <div key={idx} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${isActive || isCompleted ? 'is-active' : ''}`}>
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow ${
                        isCompleted ? 'bg-primary text-white' : isActive ? 'bg-secondary text-secondary-foreground border-secondary animate-pulse' : 'bg-background border-border text-muted-foreground'
                      }`}>
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : isActive ? <ShieldCheck className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
                      </div>
                      <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border shadow-sm ${
                        isCompleted || isActive ? 'bg-card' : 'bg-background/50'
                      }`}>
                        <div className="flex items-center justify-between space-x-2 mb-1">
                          <div className="font-bold text-foreground">{item.title}</div>
                          <time className="font-medium text-xs text-muted-foreground">{item.date}</time>
                        </div>
                        <div className="text-sm text-muted-foreground">{item.description}</div>
                      </div>
                    </div>
                  );
                })}

              </div>
            </section>
          </div>

          {/* Right Column: Sticky Donation Widget */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-24 bg-card rounded-2xl shadow-xl border border-border p-6 md:p-8 flex flex-col gap-6">
              
              <div>
                <h3 className="text-2xl font-poppins font-bold text-foreground mb-2">Support Recovery</h3>
                <p className="text-muted-foreground text-sm">Your contribution goes directly towards {farmer.name}'s recovery plan.</p>
              </div>

              {/* Progress */}
              <div>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-3xl font-poppins font-bold text-primary">₹{farmer.raised.toLocaleString()}</span>
                  <span className="text-muted-foreground mb-1">raised of ₹{farmer.goal.toLocaleString()}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 mb-2">
                  <div className="bg-secondary h-3 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-primary">{Math.round(progress)}% Funded</span>
                  <span className="text-muted-foreground">NGO Supervised</span>
                </div>
              </div>


              {/* Actions */}
              <div className="flex flex-col gap-3 mt-2">
                <button 
                  onClick={() => setIsDonating(true)}
                  disabled={farmer.raised >= farmer.goal}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all active:scale-95 shadow-md flex justify-center items-center gap-2 ${
                    farmer.raised >= farmer.goal 
                      ? "bg-muted text-muted-foreground cursor-not-allowed" 
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${farmer.raised >= farmer.goal ? "" : "fill-current"}`} /> 
                  {farmer.raised >= farmer.goal ? "Fully Supported" : "Donate Now"}
                </button>
                <button 
                  onClick={handleShare}
                  className="w-full bg-background border border-border text-foreground py-3 rounded-xl font-medium hover:bg-muted transition-colors flex justify-center items-center gap-2"
                >
                  <Share2 className="w-5 h-5" /> Share Story
                </button>
              </div>

              <div className="flex items-start gap-3 bg-muted/50 p-4 rounded-xl mt-2 text-sm text-muted-foreground">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p>100% of your donation directly funds the requested items. We do not take a cut.</p>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Donation Modal */}
      <Dialog open={isDonating} onOpenChange={(open) => {
        setIsDonating(open);
        if (!open) {
          setDonationStep(1);
        }
      }}>
        <DialogContent className="sm:max-w-md bg-card border border-border rounded-3xl p-6 relative">
          <DialogHeader>
            <DialogTitle className="font-poppins font-bold text-xl text-foreground">
              {donationStep === 4 ? "Support Successful!" : `Support ${farmer.name}`}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {donationStep === 4 ? "Thank you for your generous support!" : "Your contribution directly funds the recovery goals."}
            </DialogDescription>
          </DialogHeader>

          {donationStep === 1 && (
            <div className="space-y-5 py-2">
              <div>
                <label className="text-xs font-bold text-foreground mb-2 block">Select Donation Amount</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {["500", "1000", "5000", "10000"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDonationAmount(preset)}
                      className={`py-2 px-3 text-sm font-semibold rounded-xl border transition-all ${
                        donationAmount === preset
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-background border-border text-foreground hover:bg-muted/50"
                      }`}
                    >
                      ₹{Number(preset).toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">Or Enter Custom Amount (₹)</label>
                <input
                  type="number"
                  placeholder="Enter custom amount"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm font-semibold text-primary"
                />
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-foreground mb-1 block">Your Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="Anonymous"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground mb-1 block">Encouragement Message (Optional)</label>
                  <input
                    type="text"
                    placeholder="Stay strong, we are with you!"
                    value={donorMessage}
                    onChange={(e) => setDonorMessage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handlePaymentStart}
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors mt-2"
              >
                Proceed to Pay
              </button>
            </div>
          )}



          {donationStep === 3 && (
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold text-foreground">Processing secure transaction...</p>
              <p className="text-xs text-muted-foreground">Please do not refresh the page.</p>
            </div>
          )}

          {donationStep === 4 && (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-5">
              <div className="w-16 h-16 bg-secondary/15 rounded-full flex items-center justify-center text-secondary">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              <div>
                <h4 className="font-poppins font-bold text-lg text-foreground">₹{Number(donationAmount).toLocaleString()} Received</h4>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                  Thank you, <span className="font-semibold text-foreground">{donorName || "Anonymous Supporter"}</span>, for helping {farmer.name}! 
                </p>
              </div>

              {/* Transaction Receipt Card */}
              <div className="bg-muted/40 border border-border rounded-2xl p-4 w-full text-xs space-y-2 text-left">
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground font-medium">Receipt ID</span>
                  <span className="font-mono text-foreground font-bold uppercase">RR-{Math.floor(100000 + Math.random() * 900000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Beneficiary</span>
                  <span className="text-foreground font-semibold">{farmer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Payment Gateway</span>
                  <span className="text-foreground font-semibold uppercase">Razorpay Secure</span>
                </div>
                {donorMessage && (
                  <div className="border-t border-border/50 pt-2 mt-2">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block mb-1">Your Message</span>
                    <p className="italic text-primary bg-primary/5 p-2.5 rounded-lg border border-primary/10">
                      "{donorMessage}"
                    </p>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsDonating(false);
                  setDonationStep(1);
                  setDonorName("");
                  setDonorMessage("");
                  setVpa("");
                  setCardNumber("");
                  setCardExpiry("");
                  setCardCvv("");
                }}
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                Done
              </button>
            </div>
          )}

          {donationStep === 5 && (
            <div className="space-y-4 py-4 text-center">
              <div className="flex items-center justify-center gap-2 border-b border-border pb-3 mb-2">
                <span className="bg-blue-600 text-white font-extrabold text-sm px-2.5 py-0.5 rounded tracking-wide font-sans font-black">Razorpay</span>
                <span className="text-[10px] bg-amber-500/10 text-amber-600 font-bold px-2 py-0.5 rounded border border-amber-500/25 uppercase">Sandbox Test Mode</span>
              </div>
              
              <div className="bg-muted/30 border border-border p-4 rounded-xl text-left text-xs space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID:</span>
                  <span className="font-mono text-foreground font-bold">{mockOrderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="text-foreground font-bold">₹{Number(donationAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payee:</span>
                  <span className="text-foreground font-medium">Rythu Raksha Foundation</span>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground leading-normal">
                This is a local simulated transaction. Click <strong>Simulate Success</strong> to complete checkout or <strong>Simulate Fail</strong> to cancel.
              </p>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    toast.error("Payment simulation cancelled.");
                    setDonationStep(1);
                  }}
                  className="flex-1 border border-border py-2.5 rounded-xl font-semibold text-xs hover:bg-muted/50 transition-colors"
                >
                  Simulate Fail
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const payId = `pay_mock_${Math.random().toString(36).substring(2, 11)}`;
                    setDonationStep(3); // Processing DB record
                    try {
                      const updatedFarmer = await donateToFarmer(
                        farmer.id,
                        parseFloat(donationAmount),
                        donorName || "Anonymous Supporter",
                        donorMessage || `Paid via Razorpay Simulated (${payId})`
                      );
                      if (updatedFarmer) setFarmer(updatedFarmer);
                      setDonationStep(4); // Success Receipt
                      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                    } catch (err) {
                      console.error(err);
                      toast.error("Transaction simulated successfully, but database failed to update.");
                      setDonationStep(1);
                    }
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold text-xs transition-colors"
                >
                  Simulate Success
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
