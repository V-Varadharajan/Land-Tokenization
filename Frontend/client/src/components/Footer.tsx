import { Link } from "wouter";
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Mail, 
  Send,
  MapPin,
  Phone,
  FileText,
  Shield,
  BookOpen,
  HelpCircle,
  TrendingUp,
  Users,
  Coins
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useAllLandProjects } from "@/hooks/useBlockchainData";
import { formatEther } from "ethers";

export default function Footer() {
  const [email, setEmail] = useState("");
  const { projects } = useAllLandProjects();
  
  // Calculate dynamic stats from blockchain data with error handling
  const stats = {
    totalValue: projects.reduce((sum, p) => {
      try {
        if (p.basePrice && p.plotsMinted) {
          // Handle both BigInt and number types
          let priceInEther: number;
          if (typeof p.basePrice === 'bigint') {
            priceInEther = Number(formatEther(p.basePrice));
          } else {
            // Already a number or string number
            priceInEther = Number(p.basePrice);
          }
          const mintedPlots = Number(p.plotsMinted); // Use minted plots, not total
          return sum + (priceInEther * mintedPlots);
        }
        return sum;
      } catch (error) {
        return sum;
      }
    }, 0),
    activeProjects: projects.filter(p => p.active && Number(p.plotsMinted) > 0).length,
    totalPlots: projects.reduce((sum, p) => sum + Number(p.plotsMinted), 0), // Use plotsMinted
    tokenHolders: projects.reduce((sum, p) => sum + Number(p.plotsMinted), 0) // Approximate: each minted plot could be a holder
  };

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Thanks for subscribing!");
      setEmail("");
    }
  };

  const footerLinks = {
    platform: [
      { label: "Browse Projects", path: "/browse", icon: TrendingUp },
      { label: "My Plots", path: "/my-plots", icon: MapPin },
      { label: "Dashboard", path: "/", icon: Users },
      { label: "Marketplace", path: "/browse", icon: Coins },
    ],
    resources: [
      { label: "Documentation", path: "/docs", icon: BookOpen },
      { label: "API Reference", path: "/docs", icon: FileText },
      { label: "Help Center", path: "/help", icon: HelpCircle },
      { label: "Smart Contracts", path: "/docs", icon: Shield },
    ],
    legal: [
      { label: "Terms of Service", path: "/terms" },
      { label: "Privacy Policy", path: "/privacy" },
      { label: "Cookie Policy", path: "/privacy" },
      { label: "Risk Disclaimer", path: "/terms" },
    ],
    company: [
      { label: "About Us", path: "/about" },
      { label: "Careers", path: "/about" },
      { label: "Press Kit", path: "/about" },
      { label: "Contact", path: "/help" },
    ],
  };

  const socialLinks = [
    { icon: Twitter, url: "https://twitter.com", label: "Twitter" },
    { icon: Github, url: "https://github.com/", label: "GitHub" },
    { icon: Linkedin, url: "https://linkedin.com", label: "LinkedIn" },
    { icon: Mail, url: "mailto:support@landtoken.com", label: "Email" },
  ];

  return (
    <footer className="border-t bg-muted/30">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-3">
              🏞️ LandToken
            </h3>
            <p className="text-muted-foreground text-sm mb-4 max-w-xs">
              Democratizing real estate investment through blockchain technology. 
              Buy, sell, and trade fractional land ownership with complete transparency.
            </p>
            
            {/* Newsletter */}
            <div className="mb-4">
              <h4 className="font-semibold text-sm mb-2">Stay Updated</h4>
              <form onSubmit={handleNewsletter} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                  required
                />
                <Button type="submit" size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>

            {/* Social Links */}
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-accent transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.label}>
                    <Link href={link.path}>
                      <span className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                        <Icon className="h-3.5 w-3.5" />
                        {link.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.label}>
                    <a
                      href={link.path}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3 mb-6">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.path}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <h4 className="font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.path}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Platform Stats - Dynamic from Blockchain */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {stats.totalValue >= 1000000 
                ? `$${(stats.totalValue / 1000000).toFixed(1)}M`
                : stats.totalValue >= 1000
                ? `$${(stats.totalValue / 1000).toFixed(1)}K`
                : stats.totalValue > 0
                ? `$${stats.totalValue.toFixed(2)}`
                : '$0'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Total Value Locked</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {stats.activeProjects > 0 ? stats.activeProjects : '0'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Active Projects</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {stats.totalPlots > 0 ? stats.totalPlots.toLocaleString() : '0'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Plots Tokenized</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {stats.tokenHolders > 0 ? stats.tokenHolders.toLocaleString() : '0'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Token Holders</div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} LandToken. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Secured by Blockchain
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Built with ❤️ for Real Estate
            </span>
          </div>
        </div>

        {/* Risk Disclaimer */}
        <div className="mt-6 p-4 rounded-lg bg-muted/50 border">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Risk Disclaimer:</strong> Investing in tokenized real estate 
            involves financial risk. The value of tokens may fluctuate. Past performance is not indicative 
            of future results. Please conduct your own research and consult with financial advisors before 
            making investment decisions. This platform is experimental and for educational purposes.
          </p>
        </div>
      </div>
    </footer>
  );
}
