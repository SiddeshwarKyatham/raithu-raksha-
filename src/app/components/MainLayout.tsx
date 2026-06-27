import { Outlet, Link } from "react-router";
import { Menu, Leaf, Mail, Award } from "lucide-react";
import { useState } from "react";
import { Toaster } from "sonner";
import logo from "../../assets/logo.png";
import footerLogo from "../../assets/footer_logo.png";

export function MainLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Toaster position="top-right" richColors />
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 animate-pulse-none">
            <img src={logo} alt="Rythu Raksha Logo" className="w-16 h-16 object-contain" />
            <div className="flex flex-col justify-center">
              <div className="font-poppins font-bold text-2xl tracking-tight leading-none flex items-center">
                <span className="text-[#1a3627]">Rythu</span>
                <span className="text-[#8B5A2B] ml-1">Raksha</span>
              </div>
              <div className="flex items-center gap-1 mt-1 w-full">
                <div className="h-[1px] bg-[#1a3627]/20 flex-1" />
                <Leaf className="w-2.5 h-2.5 text-[#1a3627]/60 shrink-0" />
                <div className="h-[1px] bg-[#1a3627]/20 flex-1" />
              </div>
              <span className="text-[8px] text-[#1a3627]/85 font-bold tracking-widest uppercase mt-0.5">
                BY NAVA NIRMAN FOUNDATION
              </span>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link to="/farmers" className="text-foreground hover:text-primary transition-colors">Farmers</Link>
            <Link to="/report" className="text-foreground hover:text-primary transition-colors">Report a Farmer</Link>
            <Link to="/impact" className="text-foreground hover:text-primary transition-colors">Impact</Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors">About</Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/report" className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors">
              Report a Farmer
            </Link>
          </div>

          <button 
            className="md:hidden text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-background border-b border-border p-4 flex flex-col gap-4">
            <Link to="/farmers" className="text-foreground font-medium" onClick={() => setIsMobileMenuOpen(false)}>Farmers</Link>
            <Link to="/report" className="text-foreground font-medium" onClick={() => setIsMobileMenuOpen(false)}>Report a Farmer</Link>
            <Link to="/impact" className="text-foreground font-medium" onClick={() => setIsMobileMenuOpen(false)}>Impact</Link>
            <Link to="/about" className="text-foreground font-medium" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
            <Link to="/report" className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium text-center" onClick={() => setIsMobileMenuOpen(false)}>
              Report a Farmer
            </Link>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12 border-t border-primary/20">
        <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2.5">
              <img src={footerLogo} alt="Rythu Raksha Logo" className="w-20 h-20 object-contain" />
              <div className="flex flex-col justify-center">
                <div className="font-poppins font-bold text-2xl tracking-tight leading-none flex items-center">
                  <span className="text-white">Rythu</span>
                  <span className="text-[#d4af37] ml-1">Raksha</span>
                </div>
                <div className="flex items-center gap-1 mt-1 w-full">
                  <div className="h-[1px] bg-white/20 flex-1" />
                  <Leaf className="w-2.5 h-2.5 text-white/50 shrink-0" />
                  <div className="h-[1px] bg-white/20 flex-1" />
                </div>
                <span className="text-[8px] text-white/80 font-bold tracking-widest uppercase mt-0.5">
                  BY NAVA NIRMAN FOUNDATION
                </span>
              </div>
            </Link>
            <p className="text-primary-foreground/80 text-sm">
              Connecting disaster-affected farmers with people willing to help through verified stories and transparent support.
            </p>
            <div className="flex flex-col gap-2.5 text-xs font-semibold text-primary-foreground/95 mt-3">
              <a 
                href="https://wa.me/917032691531" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:underline flex items-center gap-2 text-white/95"
              >
                <svg className="w-4 h-4 text-[#25D366] shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12.004 2.001c-5.51 0-9.99 4.48-9.99 9.99 0 2.05.62 3.96 1.7 5.56L2.3 22l4.63-1.38c1.55.93 3.36 1.47 5.07 1.47 5.51 0 9.99-4.48 9.99-9.99 0-5.51-4.48-9.99-9.99-9.99zm5.55 14.16c-.23.65-1.34 1.22-1.85 1.28-.5.06-1 .28-3.23-.62-2.69-1.09-4.39-3.83-4.52-4.01-.13-.18-1.09-1.45-1.09-2.76 0-1.31.69-1.96.93-2.22.25-.26.54-.33.72-.33.18 0 .36.01.52.02.17.01.4.01.61.5.22.53.76 1.85.83 1.99.07.15.12.32.02.51-.1.2-.15.32-.3.49-.15.17-.32.39-.46.55-.16.18-.33.37-.14.7.19.33.85 1.41 1.83 2.29.98.88 1.8-1.18 2.13-1.34.33-.16.65-.12.87.1.22.22 1.41 1.41 1.65 1.65.24.24.4.36.4.52 0 .15-.09.84-.32 1.49z"/></svg>
                <span>WhatsApp: +91 70326 91531</span>
              </a>
              <a 
                href="mailto:support@rythuraksha.org" 
                className="hover:underline flex items-center gap-2 bg-[#d4af37]/15 border border-[#d4af37]/35 text-[#d4af37] px-2.5 py-1 rounded-lg w-fit transition-colors shadow-sm font-poppins"
              >
                <Mail className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                <span>support@rythuraksha.org</span>
              </a>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 w-full">
              <a 
                href="https://navanirmanfoundation.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-between bg-gradient-to-r from-[#d4af37]/10 via-[#d4af37]/5 to-transparent hover:from-[#d4af37]/20 border border-[#d4af37]/20 hover:border-[#d4af37]/60 rounded-2xl p-4 text-xs font-bold text-white transition-all duration-300 group shadow-md font-poppins"
              >
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-[#d4af37] shrink-0" />
                  <span className="tracking-wide">Learn More About Nava Nirman Foundation</span>
                </div>
                <span className="text-[#d4af37] group-hover:translate-x-1.5 transition-transform duration-300 font-bold text-sm">→</span>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-poppins font-semibold mb-4">Explore</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link to="/farmers" className="hover:text-white transition-colors">Farmers</Link></li>
              <li><Link to="/impact" className="hover:text-white transition-colors">Impact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-poppins font-semibold mb-4">Organization</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-poppins font-semibold mb-4">Get Involved</h4>
            <Link to="/farmers" className="block text-center bg-secondary text-secondary-foreground px-4 py-2 rounded-full text-sm font-medium w-full mb-3 hover:bg-secondary/90 transition-colors">
              Donate Now
            </Link>
            <Link to="/report" className="block text-center bg-transparent border border-primary-foreground/30 text-white px-4 py-2 rounded-full text-sm font-medium w-full hover:bg-primary-foreground/10 transition-colors">
              Report a Farmer
            </Link>
          </div>
        </div>
        <div className="container mx-auto px-4 md:px-6 mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col items-center gap-4 text-center">
          <p className="text-primary-foreground font-medium text-lg font-poppins">
            Together, We Protect Farmers. Together, We Build Hope.
          </p>
          <div className="flex items-center gap-4 w-full max-w-md justify-center">
            <div className="h-px bg-primary-foreground/20 flex-1" />
            <span className="text-secondary text-lg">💚</span>
            <div className="h-px bg-primary-foreground/20 flex-1" />
          </div>
          <p className="text-xs font-semibold tracking-wider text-primary-foreground/80 uppercase">
            A Crowdfunding Platform for Farmers
          </p>
          <div className="text-xs text-primary-foreground/50 mt-4">
            © {new Date().getFullYear()} Rythu Raksha NGO. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
