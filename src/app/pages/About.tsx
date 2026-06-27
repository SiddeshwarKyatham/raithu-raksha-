import { motion } from "motion/react";
import { ShieldCheck, HeartHandshake, Target, CheckCircle2, Leaf, Award, ExternalLink, MapPin, Shield, Users, Heart, Phone, Mail, Globe } from "lucide-react";
import { Link } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function About() {
  const missionItems = [
    "Identify and support genuine cases of farmer distress.",
    "Conduct thorough verification of every reported case.",
    "Enable transparent and accountable fundraising.",
    "Help farmers rebuild livelihoods and return to cultivation.",
    "Strengthen rural communities through collective action."
  ];

  const coreValues = [
    {
      icon: <Shield className="w-8 h-8 text-[#1a3627]" />,
      title: "Transparency",
      description: "Every case is verified and every contribution is completely accountable.",
      accent: "border-[#1a3627]/30 hover:border-[#1a3627]"
    },
    {
      icon: <Award className="w-8 h-8 text-[#d4af37]" />,
      title: "Integrity",
      description: "We uphold honesty and ethical practices in all our activities and operations.",
      accent: "border-[#d4af37]/30 hover:border-[#d4af37]"
    },
    {
      icon: <Heart className="w-8 h-8 text-[#8B5A2B]" />,
      title: "Compassion",
      description: "We stand shoulder-to-shoulder with farming families during their most difficult times.",
      accent: "border-[#8B5A2B]/30 hover:border-[#8B5A2B]"
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-[#1a3627]" />,
      title: "Accountability",
      description: "We ensure support reaches those who truly need it without fail.",
      accent: "border-[#1a3627]/30 hover:border-[#1a3627]"
    },
    {
      icon: <Users className="w-8 h-8 text-[#d4af37]" />,
      title: "Empowerment",
      description: "We believe lasting change happens when communities come together to uplift each other.",
      accent: "border-[#d4af37]/30 hover:border-[#d4af37]"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[55vh] min-h-[440px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1681226298721-88cdb4096e5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBhZ3JpY3VsdHVyZSUyMGZpZWxkc3xlbnwxfHx8fDE3ODE1NDcyODh8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Farming community banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-[#1a3627]/75 to-[#1a3627]/95" />
        </div>

        <div className="container relative z-10 mx-auto px-4 md:px-6 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            <span className="bg-[#d4af37]/20 border border-[#d4af37]/35 text-[#d4af37] px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase inline-block backdrop-blur-md">
              🌳 Rythu Raksha
            </span>
            <h1 className="text-4xl md:text-6xl font-poppins font-bold mb-4 leading-tight tracking-tight drop-shadow-md text-white">
              Restoring Livelihoods, <br />
              <span className="text-[#d4af37]">Rebuilding Hope.</span>
            </h1>
            <p className="text-base md:text-lg text-white/95 leading-relaxed max-w-2xl mx-auto font-medium font-poppins">
              Connecting distressed farming families with direct support, transparent crowdfunding, and verified recovery resources.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story / About Rythu Raksha */}
      <section className="py-24 bg-card border-b border-border relative overflow-hidden">
        <div className="absolute -left-16 top-1/4 w-96 h-96 bg-[#1a3627]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Story Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-[#1a3627]" />
                <span className="text-[#1a3627] font-bold text-xs uppercase tracking-widest">Our Story</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-poppins font-bold text-foreground tracking-tight leading-tight">
                About <span className="text-[#1a3627]">Rythu Raksha</span>
              </h2>
              <div className="space-y-4 text-muted-foreground text-sm md:text-base leading-relaxed font-medium">
                <p>
                  Rythu Raksha is a farmer support and recovery initiative by <strong className="text-[#1a3627] font-extrabold border-b-2 border-[#d4af37]/50 pb-0.5">Nava Nirman Foundation</strong>, created to help farmers affected by droughts, floods, pest attacks, crop failures, and other agricultural challenges.
                </p>
                <p>
                  Agriculture is the backbone of our nation, yet countless farming families struggle to recover when disasters strike. Rythu Raksha serves as a trusted bridge between farmers in need and compassionate individuals, organizations, and communities willing to support them.
                </p>
                <p>
                  Through rigorous field verification, transparent fundraising, and community-driven action, we ensure that every contribution reaches genuine beneficiaries and creates meaningful impact on the ground.
                </p>
              </div>
            </motion.div>

            {/* Story Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 relative rounded-[2.5rem] overflow-hidden shadow-xl border border-border group"
            >
              <div className="absolute inset-0 bg-[#1a3627]/10 group-hover:bg-transparent transition-colors duration-500 z-10" />
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1666545743813-e692fb2b2430?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcnklMjBmYXJtJTIwbGFuZCUyMGluZGlhfGVufDF8fHx8MTc4MTU0NzI4OHww&ixlib=rb-4.1.0&q=80&w=800"
                alt="Support to distress farmers"
                className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a3627]/80 to-transparent z-20" />
              <div className="absolute bottom-8 left-8 text-white right-8 z-30 space-y-2">
                <span className="bg-[#d4af37] text-[#1a3627] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">NGO Verified</span>
                <h3 className="font-poppins font-bold text-lg drop-shadow-sm text-white">Cultivating Hope</h3>
                <p className="text-white/80 text-xs leading-relaxed">Direct support delivered to farmers for seeds, fertilizers, and field recovery.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Side-by-Side */}
      <section className="py-24 bg-card border-b border-border relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Vision Column */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#d4af37]" />
                <span className="text-[#d4af37] font-bold text-xs uppercase tracking-widest">Our Vision</span>
              </div>
              <h2 className="text-3xl font-poppins font-bold text-foreground tracking-tight">
                To build a resilient future
              </h2>
              <div className="p-8 border-l-4 border-[#d4af37] bg-[#d4af37]/5 rounded-r-3xl">
                <p className="text-[#5c4033] text-base md:text-lg font-medium leading-relaxed italic font-poppins">
                  "To build a future where no farmer faces agricultural hardship alone and every farming family has access to timely support, resources, and opportunities for recovery."
                </p>
              </div>
            </motion.div>

            {/* Mission Column */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-[#1a3627]" />
                <span className="text-[#1a3627] font-bold text-xs uppercase tracking-widest">Our Mission</span>
              </div>
              <h2 className="text-3xl font-poppins font-bold text-foreground tracking-tight">
                Action-Driven Milestones
              </h2>
              <ul className="space-y-4 pt-2">
                {missionItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-[#1a3627]/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1a3627]" />
                    </div>
                    <span className="text-muted-foreground text-sm md:text-base leading-relaxed font-medium">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-24 bg-muted/15 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[#d4af37] font-bold text-xs uppercase tracking-widest block">Core Pillars</span>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-foreground tracking-tight">Our Core Values</h2>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              The principles that guide our work and our commitment to farming communities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {coreValues.map((val, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`bg-card border ${val.accent} p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center gap-4 group`}
              >
                <div className="p-3 bg-[#1a3627]/5 rounded-2xl border border-[#1a3627]/10 group-hover:scale-110 transition-transform duration-300">
                  {val.icon}
                </div>
                <h3 className="text-base font-poppins font-bold text-foreground">{val.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{val.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Nava Nirman Foundation Details Section */}
      <section className="py-24 bg-card border-t border-border relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-muted/30 border border-border rounded-[2.5rem] p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-10 items-center shadow-inner"
          >
            <div className="space-y-5">
              <span className="text-[#1a3627] font-bold text-xs uppercase tracking-widest block">Platform Organizer</span>
              <h3 className="text-2xl md:text-3xl font-poppins font-bold text-foreground leading-tight">Nava Nirman Foundation</h3>
              <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                Rythu Raksha is a social impact initiative powered by <strong>Nava Nirman Foundation</strong>, a registered non-profit organization dedicated to rural community empowerment, agricultural development, and distress mitigation through direct, physical action.
              </p>
              <div className="pt-2">
                <a 
                  href="https://navanirmanfoundation.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-between bg-[#1a3627]/5 hover:bg-[#1a3627]/10 border border-[#1a3627]/10 hover:border-[#d4af37]/40 rounded-2xl p-4 text-xs font-bold text-[#1a3627] transition-all group shadow-sm max-w-sm font-poppins"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[#d4af37] text-lg">🛡️</span>
                    <span>Learn More About Nava Nirman Foundation</span>
                  </div>
                  <span className="text-[#d4af37] group-hover:translate-x-1 transition-transform font-bold">→</span>
                </a>
              </div>
            </div>
            
            <div className="bg-card border border-border p-8 rounded-2xl space-y-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#1a3627]/5 rounded-bl-full pointer-events-none" />
              <h4 className="font-poppins font-bold text-lg text-foreground pb-2 border-b border-border">Get in Touch</h4>
              <div className="space-y-4 text-xs md:text-sm text-foreground/80 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1a3627]/10 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-[#1a3627]" />
                  </div>
                  <span><strong>Phone/WhatsApp:</strong> <a href="https://wa.me/917032691531" target="_blank" rel="noopener noreferrer" className="hover:underline text-[#1a3627] font-semibold">+91 70326 91531</a></span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/35 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-[#d4af37]" />
                  </div>
                  <span>
                    <strong>Email:</strong>{" "}
                    <a 
                      href="mailto:support@rythuraksha.org" 
                      className="hover:underline text-[#1a3627] font-bold bg-[#1a3627]/5 px-2.5 py-1 rounded-lg border border-[#1a3627]/10 inline-block transition-colors"
                    >
                      support@rythuraksha.org
                    </a>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#8B5A2B]/10 flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4 text-[#8B5A2B]" />
                  </div>
                  <span><strong>Website:</strong> <a href="https://www.rythuraksha.org" target="_blank" rel="noopener noreferrer" className="hover:underline text-[#1a3627] font-semibold">www.rythuraksha.org</a></span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action / Closing */}
      <section className="py-20 bg-muted/20 border-t border-border">
        <div className="container mx-auto px-4 md:px-6 text-center max-w-3xl space-y-6">
          <h2 className="text-3xl font-poppins font-bold text-foreground">Together, we can restore hope, rebuild livelihoods, and create a stronger future.</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/farmers" className="bg-[#1a3627] text-white px-8 py-3.5 rounded-full font-bold hover:bg-[#1a3627]/90 transition-all shadow-md w-full sm:w-auto text-center font-poppins text-sm">
              Explore Verified Cases
            </Link>
            <Link to="/report" className="bg-background border border-border text-foreground px-8 py-3.5 rounded-full font-semibold hover:bg-muted transition-all w-full sm:w-auto text-center font-poppins text-sm">
              Report a Distress Case
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
