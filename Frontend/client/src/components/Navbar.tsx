import { Link, useLocation } from "wouter";
import { useWallet } from "@/contexts/WalletContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Wallet, Moon, Sun, Menu, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function Navbar() {
  const { account, isOwner, network, connecting, connectWallet, disconnectWallet } = useWallet();
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: "/", label: "Dashboard" },
    { path: "/browse", label: "Browse Projects" },
    { path: "/my-plots", label: "My Plots" },
    ...(isOwner ? [{ path: "/owner", label: "Owner Panel" }] : []),
  ];

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/">
              <span className="text-xl font-bold hover-elevate active-elevate-2 px-3 py-2 rounded-md cursor-pointer" data-testid="link-home">
                Land Tokenization
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => (
                <Link key={link.path} href={link.path}>
                  <span
                    className={`px-3 py-2 rounded-md text-sm font-medium hover-elevate active-elevate-2 cursor-pointer ${
                      location === link.path ? "bg-accent" : ""
                    }`}
                    data-testid={`link-${link.label.toLowerCase().replace(" ", "-")}`}
                  >
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {account && (
              <Badge variant="secondary" className="hidden sm:flex" data-testid="badge-network">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                {network}
              </Badge>
            )}
            
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>

            {account ? (
              <Button
                variant="outline"
                onClick={disconnectWallet}
                className="font-mono text-sm"
                data-testid="button-disconnect-wallet"
              >
                <Wallet className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{truncateAddress(account)}</span>
                <span className="sm:hidden">Disconnect</span>
              </Button>
            ) : (
              <Button
                onClick={connectWallet}
                disabled={connecting}
                data-testid="button-connect-wallet"
              >
                <Wallet className="h-4 w-4 mr-2" />
                {connecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}

            <Button
              size="icon"
              variant="ghost"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <span
                  className={`block px-3 py-2 rounded-md text-sm font-medium hover-elevate active-elevate-2 mb-1 cursor-pointer ${
                    location === link.path ? "bg-accent" : ""
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`mobile-link-${link.label.toLowerCase().replace(" ", "-")}`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
