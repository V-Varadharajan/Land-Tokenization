import { Link, useLocation } from "wouter";
import { useWallet } from "@/contexts/WalletContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Wallet, Moon, Sun, Menu, X, ChevronDown, Home, Building2, Grid3x3, ShieldCheck, LogOut, User, Copy, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-toastify";

export default function Navbar() {
  const { account, isOwner, network, connecting, connectWallet, disconnectWallet } = useWallet();
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/browse", label: "Browse Projects", icon: Building2 },
    { path: "/my-plots", label: "My Plots", icon: Grid3x3 },
    ...(isOwner ? [{ path: "/owner", label: "Owner Panel", icon: ShieldCheck }] : []),
  ];

  const handleCopyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      toast.success("Address copied to clipboard!");
    }
  };

  const handleViewOnExplorer = () => {
    if (account) {
      const explorerUrl = `https://etherscan.io/address/${account}`;
      window.open(explorerUrl, "_blank");
    }
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href="/">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent hover-elevate active-elevate-2 px-3 py-2 rounded-md cursor-pointer" data-testid="link-home">
                🏞️ LandToken
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link key={link.path} href={link.path}>
                    <span
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover-elevate active-elevate-2 cursor-pointer transition-all ${
                        location === link.path 
                          ? "bg-primary text-primary-foreground shadow-sm" 
                          : "hover:bg-accent"
                      }`}
                      data-testid={`link-${link.label.toLowerCase().replace(" ", "-")}`}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Network Badge */}
            {account && (
              <Badge variant="secondary" className="hidden sm:flex items-center gap-2 px-3 py-1.5" data-testid="badge-network">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                <span className="font-medium">{network}</span>
              </Badge>
            )}
            
            {/* Theme Toggle */}
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleTheme}
              className="hover-elevate active-elevate-2"
              data-testid="button-theme-toggle"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>

            {/* Wallet Connection */}
            {account ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="font-mono text-sm hover-elevate active-elevate-2 gap-2"
                    data-testid="button-wallet-menu"
                  >
                    <Wallet className="h-4 w-4" />
                    <span className="hidden sm:inline">{truncateAddress(account)}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Your Account</p>
                      <p className="text-xs leading-none text-muted-foreground font-mono">
                        {truncateAddress(account)}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleCopyAddress} className="cursor-pointer">
                    <Copy className="mr-2 h-4 w-4" />
                    <span>Copy Address</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleViewOnExplorer} className="cursor-pointer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    <span>View on Explorer</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={disconnectWallet} className="cursor-pointer text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Disconnect</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={connectWallet}
                disabled={connecting}
                className="hover-elevate active-elevate-2"
                data-testid="button-connect-wallet"
              >
                <Wallet className="h-4 w-4 mr-2" />
                {connecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              size="icon"
              variant="ghost"
              className="md:hidden hover-elevate active-elevate-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.path} href={link.path}>
                  <span
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover-elevate active-elevate-2 cursor-pointer transition-all ${
                      location === link.path 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "hover:bg-accent"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={`mobile-link-${link.label.toLowerCase().replace(" ", "-")}`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
