import StatsCard from "@/components/StatsCard";
import { Building2, Grid3x3, ShoppingCart, TrendingUp, Loader2 } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useBlockchainStats } from "@/hooks/useBlockchainData";

export default function Dashboard() {
  const { account, connectWallet } = useWallet();
  const { stats, loading } = useBlockchainStats();

  const statsCards = [
    {
      title: "Total Projects",
      value: stats.totalProjects,
      icon: Building2,
      description: "Active land projects",
    },
    {
      title: "Total Plots",
      value: stats.totalPlots,
      icon: Grid3x3,
      description: "Minted plot NFTs",
    },
    {
      title: "Plots Sold",
      value: stats.plotsSold,
      icon: ShoppingCart,
      description: "Successfully transferred",
    },
    {
      title: "Total Volume",
      value: stats.totalVolume,
      icon: TrendingUp,
      description: "All-time trading volume",
    },
  ];

  if (!account) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Building2 className="h-16 w-16 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold">Welcome to Land Tokenization</h2>
          <p className="text-muted-foreground max-w-md">
            Connect your wallet to start exploring land projects, buying plots, and managing your
            NFT portfolio.
          </p>
          <Button onClick={connectWallet} size="lg" data-testid="button-connect-cta">
            Connect Wallet to Get Started
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of the Land Tokenization platform
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsCards.map((stat) => (
              <StatsCard key={stat.title} {...stat} />
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-semibold">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/browse">
                <Button className="w-full justify-start" variant="outline" data-testid="button-browse">
                  <Grid3x3 className="h-4 w-4 mr-2" />
                  Browse Land Projects
                </Button>
              </Link>
              <Link href="/my-plots">
                <Button className="w-full justify-start" variant="outline" data-testid="button-my-plots">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  View My Plots
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-semibold">Getting Started</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                <span>Browse available land projects and explore plot details</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                <span>Purchase plots directly from project owners</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                <span>List your plots for resale on the secondary market</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
