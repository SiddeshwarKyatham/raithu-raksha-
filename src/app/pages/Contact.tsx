import { useState } from "react";
import { Mail, Phone, MapPin, Send, HelpCircle, ChevronDown } from "lucide-react";
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
      answer: "Every case undergoes a two-step validation: first, a digital screening of coordinates and regional crop health index records; followed by a physical, on-site visit by our verified local NGO partner team. The field coordinator validates government ID, land titles, and estimates damages before publishing the profile."
    },
    {
      question: "Are there any platform or commission fees?",
      answer: "No. Rythu Raksha takes exactly 0% commission from donations. All transfer costs and server hosting expenses are funded by independent philanthropic foundation grants and corporate sponsorships. 100% of your donation reaches the farmer's verified budget checklist."
    },
    {
      question: "How is the donation money paid to the farmers?",
      answer: "To ensure full transparency and avoid misuse, the money is not sent as a raw cash transfer. Instead, our on-ground partner NGO purchases the items (e.g. seeds, fertilizers) directly from regional agricultural cooperative banks and delivers them to the farmer. Donors receive live photographic and invoice updates upon delivery."
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
      
      {/* Title Header */}
      <section className="py-16 border-b border-border bg-muted/20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl">
            <span className="bg-primary/10 border border-primary/20 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">
              Support Center
            </span>
            <h1 className="text-4xl md:text-5xl font-poppins font-bold text-foreground mb-4">
              Get in Touch with Rythu Raksha
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Have questions about donating, verification, or reporting a case? Our team and NGO partners are here to assist.
            </p>
          </div>
        </div>
      </section>

      {/* Main Support Grid */}
      <section className="py-24 border-b border-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left: Contact Info & Form */}
            <div className="lg:col-span-7 space-y-12">
              <div>
                <h2 className="text-2xl font-poppins font-bold text-foreground mb-6">Send Us a Message</h2>
                
                <form onSubmit={handleFormSubmit} className="space-y-5 bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs font-bold text-foreground mb-1.5 block">Full Name <span className="text-destructive">*</span></label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter name"
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-foreground mb-1.5 block">Email Address <span className="text-destructive">*</span></label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="name@example.com"
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground mb-1.5 block">Category</label>
                    <select 
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all"
                    >
                      <option value="General Query">General Inquiry</option>
                      <option value="Donor Support">Donation Support</option>
                      <option value="Volunteer Inquiry">Volunteer / NGO Partnership</option>
                      <option value="Report Issue">Report Platform Issue</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground mb-1.5 block">Your Message <span className="text-destructive">*</span></label>
                    <textarea 
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Write your details here..."
                      rows={5}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all leading-relaxed"
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-md"
                  >
                    <Send className="w-4 h-4" /> Send Message
                  </button>
                </form>
              </div>

              {/* Support Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="border border-border bg-card p-6 rounded-2xl flex flex-col items-center text-center shadow-sm">
                  <Phone className="w-8 h-8 text-primary mb-4" />
                  <h4 className="font-bold text-sm text-foreground mb-1 font-poppins">Call Support</h4>
                  <p className="text-xs text-muted-foreground">+91 98765 43210</p>
                </div>
                <div className="border border-border bg-card p-6 rounded-2xl flex flex-col items-center text-center shadow-sm">
                  <Mail className="w-8 h-8 text-secondary mb-4" />
                  <h4 className="font-bold text-sm text-foreground mb-1 font-poppins">Email Us</h4>
                  <p className="text-xs text-muted-foreground">help@raithuraksha.org</p>
                </div>
                <div className="border border-border bg-card p-6 rounded-2xl flex flex-col items-center text-center shadow-sm">
                  <MapPin className="w-8 h-8 text-primary mb-4" />
                  <h4 className="font-bold text-sm text-foreground mb-1 font-poppins">Head Office</h4>
                  <p className="text-xs text-muted-foreground">Hyderabad, Telangana</p>
                </div>
              </div>
            </div>

            {/* Right: FAQ Section */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center gap-2 mb-6">
                <HelpCircle className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-poppins font-bold text-foreground">Frequently Asked FAQs</h2>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, idx) => {
                  const isOpen = activeFAQ === idx;
                  return (
                    <div 
                      key={idx} 
                      className="border border-border bg-card rounded-2xl overflow-hidden shadow-sm transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => handleFAQToggle(idx)}
                        className="w-full flex items-center justify-between p-5 text-left font-poppins font-bold text-sm text-foreground hover:bg-muted/30 transition-colors"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown 
                          className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-300 ${
                            isOpen ? "rotate-180" : ""
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
                            <div className="p-5 pt-0 border-t border-border/50 text-xs text-muted-foreground leading-relaxed">
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
