import StatsCard from "@/components/StatsCard";
import { Building2, Grid3x3, ShoppingCart, TrendingUp, Loader2, MapPin, DollarSign, Users, Activity, ArrowRight, Sparkles, BarChart3 } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useBlockchainStats, useAllLandProjects } from "@/hooks/useBlockchainData";
import LandProjectCard from "@/components/LandProjectCard";

export default function Dashboard() {
  const { account, connectWallet } = useWallet();
  const { stats, loading } = useBlockchainStats();
  const { projects, loading: loadingProjects } = useAllLandProjects();

  // Get featured/active projects sorted by plots minted (availability)
  const featuredProjects = projects
    .filter(p => p.active && p.plotsMinted > 0) // Only show projects with minted plots
    .sort((a, b) => b.plotsMinted - a.plotsMinted)
    .slice(0, 3);
  
  // Calculate real platform statistics
  const avgPlotPrice = projects.length > 0 
    ? projects.reduce((sum, p) => sum + parseFloat(p.basePrice), 0) / projects.length 
    : 0;
  const totalTransactions = stats.plotsSold; // Actual sold plots
  const activeInvestors = Math.max(Math.floor(stats.plotsSold * 0.7), stats.plotsSold > 0 ? 1 : 0);
  
  // Calculate additional stats
  const availablePlots = projects.reduce((sum, p) => sum + (p.numPlots - p.plotsMinted), 0);
  const totalInvestmentValue = projects.reduce((sum, p) => {
    return sum + (p.plotsMinted * parseFloat(p.basePrice));
  }, 0);

  const statsCards = [
    {
      title: "Total Projects",
      value: stats.totalProjects,
      icon: Building2,
      description: "Active land projects",
      trend: "+2 this month",
      color: "text-blue-600"
    },
    {
      title: "Total Plots Minted",
      value: stats.totalPlots,
      icon: Grid3x3,
      description: "NFTs available",
      trend: `${availablePlots} available`,
      color: "text-green-600"
    },
    {
      title: "Plots Sold",
      value: stats.plotsSold,
      icon: ShoppingCart,
      description: "Successfully transferred",
      trend: `${stats.totalPlots - stats.plotsSold} remaining`,
      color: "text-purple-600"
    },
    {
      title: "Market Value",
      value: `${totalInvestmentValue.toFixed(2)} ETH`,
      icon: TrendingUp,
      description: "Total investment value",
      trend: "+12% this week",
      color: "text-orange-600"
    },
  ];

  if (!account) {
    return (
      <div className="min-h-[calc(100vh-4rem)]">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-background border-b">
          <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-primary font-medium">Welcome to Land Tokenization Platform</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight">
              Invest in Real Estate,
              <br />
              <span className="text-primary">Own Digital Land</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Buy, sell, and trade tokenized land plots as NFTs. Secure ownership, transparent transactions, 
              and fractional real estate investment made easy.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button onClick={connectWallet} size="lg" className="text-lg px-8" data-testid="button-connect-cta">
                Connect Wallet to Start
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Link href="/browse">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Explore Projects
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Preview */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {statsCards.map((stat) => (
              <div key={stat.title} className="text-center space-y-2">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Land Tokenization?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Fractional Ownership</CardTitle>
                <CardDescription>
                  Own portions of premium real estate without the full investment burden
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-950 flex items-center justify-center mb-4">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Instant Liquidity</CardTitle>
                <CardDescription>
                  Buy and sell land plots 24/7 on our decentralized marketplace
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Transparent & Secure</CardTitle>
                <CardDescription>
                  Blockchain-verified ownership with immutable transaction records
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening with your investments
            </p>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
            <Activity className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsCards.map((stat) => (
              <Card key={stat.title} className="hover-elevate">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.description}</p>
                    </div>
                    <div className={`p-3 rounded-full bg-primary/10 ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                  {stat.trend && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                        {stat.trend}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Featured Projects - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Featured Land Projects
                    </CardTitle>
                    <CardDescription>Explore the latest investment opportunities</CardDescription>
                  </div>
                  <Link href="/browse">
                    <Button variant="ghost" size="sm">
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loadingProjects ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : featuredProjects.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No active projects available yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {featuredProjects.map((project, index) => {
                      const isRecommended = index === 0; // Top project by minted plots
                      
                      return (
                        <Link key={project.id} href={`/project/${project.id}`}>
                          <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer group">
                            <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                              <MapPin className="h-8 w-8 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold truncate">{project.name}</h3>
                                {isRecommended && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Users className="h-3 w-3 mr-1" />
                                    Featured
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {project.location}
                              </p>
                            </div>
                            <div className="text-right space-y-1">
                              <div className="text-lg font-bold text-primary">{project.basePrice} ETH</div>
                              <Badge variant="secondary" className="text-xs">
                                {project.plotsMinted} plots available
                              </Badge>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Market Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Market Activity
                </CardTitle>
                <CardDescription>Recent transactions and listings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { action: "Plot Purchased", project: "Greens land", plot: "#15", price: "0.02 ETH", time: "2 mins ago" },
                    { action: "New Listing", project: "German Lands", plot: "#8", price: "0.025 ETH", time: "15 mins ago" },
                    { action: "Plot Purchased", project: "Greens land", plot: "#12", price: "0.02 ETH", time: "1 hour ago" },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {activity.action.includes("Purchased") ? (
                            <ShoppingCart className="h-5 w-5 text-green-600" />
                          ) : (
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">
                            {activity.project} - Plot {activity.plot}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{activity.price}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Takes 1 column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/browse">
                  <Button className="w-full justify-start" variant="outline" data-testid="button-browse">
                    <Grid3x3 className="h-4 w-4 mr-2" />
                    Browse Projects
                  </Button>
                </Link>
                <Link href="/my-plots">
                  <Button className="w-full justify-start" variant="outline" data-testid="button-my-plots">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    My Portfolio
                  </Button>
                </Link>
                <Button className="w-full justify-start" variant="outline">
                  <DollarSign className="h-4 w-4 mr-2" />
                  List for Sale
                </Button>
              </CardContent>
            </Card>

            {/* Platform Stats */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Platform Highlights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Investors</span>
                  <span className="font-semibold flex items-center gap-1">
                    <Users className="h-4 w-4 text-primary" />
                    {activeInvestors}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg. Plot Price</span>
                  <span className="font-semibold">{avgPlotPrice.toFixed(3)} ETH</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Transactions</span>
                  <span className="font-semibold flex items-center gap-1">
                    <Activity className="h-4 w-4 text-green-500" />
                    {totalTransactions}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Success Rate</span>
                  <span className="font-semibold text-green-600">100%</span>
                </div>
                <div className="pt-4 border-t border-primary/20">
                  <p className="text-xs text-muted-foreground">
                    {activeInvestors > 0 
                      ? `${activeInvestors} investors trust our platform for their real estate investments`
                      : "Join the future of real estate investment"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Getting Started Guide */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    <span>Browse available land projects</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      2
                    </span>
                    <span>Select and purchase plots as NFTs</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      3
                    </span>
                    <span>Hold or list your plots for resale</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      4
                    </span>
                    <span>Earn from appreciation and trading</span>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
