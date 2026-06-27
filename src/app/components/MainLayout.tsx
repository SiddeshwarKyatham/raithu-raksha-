import { Outlet, Link } from "react-router";
import { Menu } from "lucide-react";
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
          <Link to="/" className="flex items-center gap-3 text-primary animate-pulse-none">
            <img src={logo} alt="Rythu Raksha Logo" className="w-16 h-16 object-contain" />
            <div className="flex flex-col">
              <span className="font-poppins font-semibold text-xl tracking-tight leading-tight">Rythu Raksha</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">by Nava Nirman Foundation</span>
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
              <img src={footerLogo} alt="Rythu Raksha Logo" className="w-24 h-24 object-contain" />
              <div className="flex flex-col">
                <span className="font-poppins font-semibold text-xl">Rythu Raksha</span>
                <span className="text-xs text-primary-foreground/70">by Nava Nirman Foundation</span>
              </div>
            </Link>
            <p className="text-primary-foreground/80 text-sm">
              Connecting disaster-affected farmers with people willing to help through verified stories and transparent support.
            </p>
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
