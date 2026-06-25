import { motion } from "motion/react";
import { ShieldCheck, HeartHandshake, Sprout, Target, Eye, Users, FileText, CheckCircle2 } from "lucide-react";
import { Link } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function About() {
  const coreValues = [
    {
      icon: <Target className="w-8 h-8 text-primary" />,
      title: "Direct & Transparent",
      description: "100% of your donations go directly to the verified requirements of farmers. We keep a zero-commission model, supported by independent grants."
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-secondary" />,
      title: "Rigorous Verification",
      description: "We don't just host stories. Every case is digitally screened, verified with government land records, and cross-checked on-site by NGO field coordinators."
    },
    {
      icon: <HeartHandshake className="w-8 h-8 text-primary" />,
      title: "Community-Led Recovery",
      description: "We bridge the gap between urban donors and rural farmers, fostering a digital community of support, encouragement, and accountability."
    }
  ];

  const team = [
    {
      name: "Dr. K. Srinivas Rao",
      role: "Agricultural Policy Expert & Co-founder",
      bio: "20+ years of working in rural distress mitigation and sustainable farming advisory.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxpbmRpYW4lMjBtYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3ODE1NDcyODd8MA&ixlib=rb-4.1.0&q=80&w=400"
    },
    {
      name: "Ananya Deshmukh",
      role: "Director of On-Ground NGO Relations",
      bio: "Leading field verification operations across 6 districts of Telangana with 50+ local NGO partners.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxpbmRpYW4lMjB3b21hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc4MTU0NzI4OHww&ixlib=rb-4.1.0&q=80&w=400"
    },
    {
      name: "Vikram Malhotra",
      role: "Technology Lead",
      bio: "Software architect dedicated to building transparent, accessible, and high-trust platforms.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxpbmRpYW4lMjBtYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3ODE1NDcyODd8MA&ixlib=rb-4.1.0&q=80&w=400"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1681226298721-88cdb4096e5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBhZ3JpY3VsdHVyZSUyMGZpZWxkc3xlbnwxfHx8fDE3ODE1NDcyODh8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Farming community banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-primary/70 to-primary/90" />
        </div>

        <div className="container relative z-10 mx-auto px-4 md:px-6 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <span className="bg-secondary/20 border border-secondary/30 text-secondary-foreground px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide uppercase mb-4 inline-block backdrop-blur-sm">
              Who We Are
            </span>
            <h1 className="text-4xl md:text-6xl font-poppins font-bold mb-6 leading-tight text-white">
              Restoring Livelihoods, Rebuilding Hope.
            </h1>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed">
              Rythu Raksha is a peer-to-peer verification and relief platform built to support smallholder farmers recovering from devastating natural disasters.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Mission & Vision */}
      <section className="py-24 bg-card border-b border-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <span className="text-primary font-bold text-sm uppercase tracking-wider">Our Core Vision</span>
              <h2 className="text-3xl md:text-4xl font-poppins font-bold text-foreground">
                Connecting Generosity with Authenticity
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Agriculture in India is a gamble against nature. When unseasonal rains, drought, or pest attacks hit, a small farmer can lose their entire annual income in a matter of days. Most of these farmers are burdened with micro-loans and have no social safety net.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                **Rythu Raksha** was born to create a transparent, reliable channel where individuals and institutions can directly fund a farmer's specific recovery checklist—be it seeds for the next cycle, soil replenishment, or borewell repairs.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl border border-border"
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1666545743813-e692fb2b2430?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcnklMjBmYXJtJTIwbGFuZCUyMGluZGlhfGVufDF8fHx8MTc4MTU0NzI4OHww&ixlib=rb-4.1.0&q=80&w=800"
                alt="Dry agricultural lands"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white right-6">
                <p className="font-poppins font-bold text-xl mb-1">Every Story is Verified</p>
                <p className="text-white/80 text-sm">Our field agents visit every location before a fundraiser goes live.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-foreground mb-4">What Sets Us Apart</h2>
            <p className="text-muted-foreground text-lg">We value accountability and direct action over bureaucratic paperwork.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {coreValues.map((val, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-card border border-border p-8 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col items-start gap-5"
              >
                <div className="p-4 bg-muted rounded-2xl border border-border/50">
                  {val.icon}
                </div>
                <h3 className="text-xl font-poppins font-bold text-foreground">{val.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{val.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Verification Process */}
      <section className="py-24 bg-card border-y border-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-foreground mb-4">Double-Loop Verification</h2>
            <p className="text-muted-foreground text-lg">Ensuring every single rupee donated is utilized efficiently and reaches the right hands.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {[
              {
                num: "01",
                title: "Report Case",
                desc: "A volunteer, local representative, or farmer submits basic details and pictures of crop damage."
              },
              {
                num: "02",
                title: "Digital Auditing",
                desc: "Our platform checks coordinates against regional weather records and satellite crop health indexes."
              },
              {
                num: "03",
                title: "Physical Visit",
                desc: "An NGO coordinator visits the farm to verify land boundaries, identity cards, and estimate recovery costs."
              },
              {
                num: "04",
                title: "Publish & Support",
                desc: "The profile goes live. Donors fund items directly, and updates are posted upon seed delivery."
              }
            ].map((step, idx) => (
              <div key={idx} className="relative p-6 bg-muted/40 rounded-2xl border border-border flex flex-col gap-4">
                <span className="text-4xl font-bold font-poppins text-primary/20 absolute right-6 top-6">{step.num}</span>
                <h3 className="text-lg font-poppins font-bold text-foreground mt-4">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership & Advisory Team */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-foreground mb-4">The Driving Force</h2>
            <p className="text-muted-foreground text-lg">A multidisciplinary team combining agronomy, technology, and social work.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-64 overflow-hidden relative">
                  <ImageWithFallback src={t.image} alt={t.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-poppins font-bold text-foreground mb-1">{t.name}</h3>
                  <p className="text-xs text-primary font-semibold mb-4">{t.role}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{t.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 md:px-6 text-center max-w-3xl">
          <h2 className="text-3xl font-poppins font-bold text-foreground mb-4">Be Part of the Solution</h2>
          <p className="text-muted-foreground text-base mb-8 leading-relaxed max-w-xl mx-auto">
            Whether you are a donor wanting to sponsor seeds or a volunteer who wants to help verify cases in your district, you can make a tangible difference.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/farmers" className="bg-primary text-primary-foreground px-8 py-3.5 rounded-full font-bold hover:bg-primary/90 transition-all shadow-md w-full sm:w-auto text-center">
              Explore Verified Cases
            </Link>
            <Link to="/report" className="bg-background border border-border text-foreground px-8 py-3.5 rounded-full font-semibold hover:bg-muted transition-all w-full sm:w-auto text-center">
              Report a Distress Case
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
