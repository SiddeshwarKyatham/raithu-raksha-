import { useState } from "react";
import { Mail, Phone, MapPin, Send, HelpCircle, ChevronDown, MessageSquare, ShieldCheck, Heart } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

interface FAQItem {
  question: string;
  answer: string;
}

export function Contact() {
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "General Query",
    message: ""
  });

  const faqs: FAQItem[] = [
    {
      question: "How do you verify the farmer cases?",
      answer: "Every case undergoes a strict verification process: first, a digital screening of coordinates and weather logs; followed by a physical, on-site visit by our verified local NGO partner team. The field coordinator validates government ID, land titles, and estimates damages before publishing the profile."
    },
    {
      question: "Are there any platform or commission fees?",
      answer: "No. Rythu Raksha takes exactly 0% commission from donations. All transfer costs and server hosting expenses are funded by independent philanthropic foundation grants and corporate sponsorships. 100% of your donation reaches the farmer's verified budget checklist."
    },
    {
      question: "How is the donation money paid to the farmers?",
      answer: "To ensure full transparency and avoid misuse, the money is not sent as a raw cash transfer. Instead, our on-ground partner NGO purchases the items (e.g. seeds, fertilizers) directly from regional agricultural cooperatives and delivers them to the farmer. Donors receive live photographic and invoice updates upon delivery."
    },
    {
      question: "Can I volunteer as a field verification representative?",
      answer: "Yes, absolutely! We are always looking for volunteers and grassroots NGO partners across various rural districts. Please submit the contact form selecting the 'Volunteer Inquiry' category, and our field coordinator will reach out to you."
    }
  ];

  const handleFAQToggle = (index: number) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() === "" || formData.email.trim() === "" || formData.message.trim() === "") {
      toast.error("Please fill out all required fields.");
      return;
    }
    
    toast.success("Thank you for reaching out! Our verification team will review your message and respond within 24 hours.");
    setFormData({
      name: "",
      email: "",
      category: "General Query",
      message: ""
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      
      {/* Title Header Card */}
      <section className="relative py-20 bg-card border-b border-border overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#1a3627]/5 rounded-bl-full pointer-events-none blur-3xl" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl space-y-4">
            <span className="bg-[#1a3627]/10 border border-[#1a3627]/20 text-[#1a3627] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest inline-block">
              ✉️ Support Center
            </span>
            <h1 className="text-4xl md:text-5xl font-poppins font-bold text-foreground tracking-tight leading-tight">
              Get in Touch with <br />
              <span className="text-[#1a3627]">Rythu Raksha</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Have questions about donating, verification, or reporting a case? Our team and NGO partners are here to assist.
            </p>
          </div>
        </div>
      </section>

      {/* Main Support Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* Left: Contact Info & Form */}
            <div className="lg:col-span-7 space-y-12">
              <div className="space-y-6">
                <h2 className="text-2xl font-poppins font-bold text-foreground tracking-tight">Send Us a Message</h2>
                
                <form onSubmit={handleFormSubmit} className="space-y-6 bg-card border border-border p-6 sm:p-8 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground uppercase tracking-wider block">Full Name <span className="text-destructive">*</span></label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Dr./Mr./Ms. Name"
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3627] focus:border-transparent text-sm transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground uppercase tracking-wider block">Email Address <span className="text-destructive">*</span></label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="yourname@domain.com"
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3627] focus:border-transparent text-sm transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider block">Category</label>
                    <select 
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3627] focus:border-transparent text-sm transition-all"
                    >
                      <option value="General Query">General Inquiry</option>
                      <option value="Donor Support">Donation Support</option>
                      <option value="Volunteer Inquiry">Volunteer / NGO Partnership</option>
                      <option value="Report Issue">Report Platform Issue</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider block">Your Message <span className="text-destructive">*</span></label>
                    <textarea 
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Type details about your inquiry here..."
                      rows={5}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3627] focus:border-transparent text-sm transition-all leading-relaxed"
                      required
                    />
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit" 
                    className="w-full bg-[#1a3627] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#1a3627]/95 transition-colors flex items-center justify-center gap-2 shadow-md"
                  >
                    <Send className="w-4 h-4" /> Send Message
                  </motion.button>
                </form>
              </div>

              {/* Support Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="border border-border bg-[#1a3627]/5 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow group">
                  <div className="w-12 h-12 rounded-full bg-[#1a3627]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Phone className="w-6 h-6 text-[#1a3627]" />
                  </div>
                  <h4 className="font-bold text-sm text-foreground mb-1 font-poppins">Call Support</h4>
                  <p className="text-xs text-muted-foreground font-semibold">+91 70326 91531</p>
                </div>
                
                <div className="border border-border bg-[#d4af37]/5 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow group">
                  <div className="w-12 h-12 rounded-full bg-[#d4af37]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Mail className="w-6 h-6 text-[#d4af37]" />
                  </div>
                  <h4 className="font-bold text-sm text-foreground mb-1 font-poppins">Email Us</h4>
                  <p className="text-xs text-muted-foreground font-semibold">support@rythuraksha.org</p>
                </div>

                <div className="border border-border bg-[#8B5A2B]/5 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow group">
                  <div className="w-12 h-12 rounded-full bg-[#8B5A2B]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="w-6 h-6 text-[#8B5A2B]" />
                  </div>
                  <h4 className="font-bold text-sm text-foreground mb-1 font-poppins">Head Office</h4>
                  <p className="text-xs text-muted-foreground font-semibold">Hyderabad, Telangana</p>
                </div>
              </div>
            </div>

            {/* Right: FAQ Section */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
              <div className="flex items-center gap-2 mb-6">
                <HelpCircle className="w-6 h-6 text-[#1a3627]" />
                <h2 className="text-2xl font-poppins font-bold text-foreground tracking-tight">Frequently Asked FAQs</h2>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, idx) => {
                  const isOpen = activeFAQ === idx;
                  return (
                    <div 
                      key={idx} 
                      className={`border bg-card rounded-2xl overflow-hidden shadow-sm transition-all duration-300 ${
                        isOpen ? "border-[#1a3627]" : "border-border"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleFAQToggle(idx)}
                        className="w-full flex items-center justify-between p-5 text-left font-poppins font-bold text-sm text-foreground hover:bg-muted/20 transition-colors"
                      >
                        <span className={isOpen ? "text-[#1a3627]" : "text-foreground"}>{faq.question}</span>
                        <ChevronDown 
                          className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-300 ${
                            isOpen ? "rotate-180 text-[#1a3627]" : ""
                          }`}
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                          >
                            <div className="p-5 pt-0 border-t border-border/50 text-xs md:text-sm text-muted-foreground leading-relaxed bg-muted/5">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
