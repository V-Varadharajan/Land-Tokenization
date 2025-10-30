import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Code, Wallet, Building2, ShoppingCart, Shield, FileText } from "lucide-react";

export default function Documentation() {
  const sections = [
    {
      icon: Wallet,
      title: "Getting Started",
      items: [
        "Connect your Web3 wallet (MetaMask recommended)",
        "Ensure you're on the correct network",
        "Acquire some ETH for gas fees",
        "Browse available land projects"
      ]
    },
    {
      icon: Building2,
      title: "For Land Owners",
      items: [
        "Create a new land tokenization project",
        "Set plot prices and project details",
        "Mint plot NFTs (up to 50 per batch)",
        "Manage project status (hold/unhold)",
        "Monitor sales and revenue"
      ]
    },
    {
      icon: ShoppingCart,
      title: "For Investors",
      items: [
        "Browse available land projects",
        "View detailed plot information",
        "Purchase plots from primary or secondary market",
        "List your plots for resale",
        "Track your portfolio in 'My Plots'"
      ]
    },
    {
      icon: Shield,
      title: "Smart Contract Security",
      items: [
        "ERC-721 compliant NFT standard",
        "ReentrancyGuard protection",
        "Ownable access control",
        "Transparent on-chain operations",
        "Auditable source code"
      ]
    }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Documentation</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about tokenizing and investing in real estate on the blockchain
          </p>
        </div>

        {/* Quick Start Guide */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Quick Start Guide
            </CardTitle>
            <CardDescription>
              Get up and running in minutes with our platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Connect Your Wallet</h4>
                  <p className="text-sm text-muted-foreground">
                    Click "Connect Wallet" in the navbar and approve the connection in MetaMask
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Browse Projects</h4>
                  <p className="text-sm text-muted-foreground">
                    Navigate to "Browse Projects" to see available land tokenization projects
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Purchase Plots</h4>
                  <p className="text-sm text-muted-foreground">
                    Select a project, view available plots, and click "Buy Plot" to acquire ownership
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Manage Your Portfolio</h4>
                  <p className="text-sm text-muted-foreground">
                    Visit "My Plots" to view your holdings and list plots for resale
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Sections */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {sections.map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <section.icon className="h-5 w-5 text-primary" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Smart Contract Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Smart Contract Details
            </CardTitle>
            <CardDescription>
              Technical information about our blockchain implementation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Contract Features</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• ERC-721 NFT standard for land plot ownership</li>
                  <li>• Batch minting capability (up to 50 plots)</li>
                  <li>• Primary and secondary market support</li>
                  <li>• Project management (hold/unhold functionality)</li>
                  <li>• Transparent pricing and ownership tracking</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Security Measures</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• ReentrancyGuard prevents reentrancy attacks</li>
                  <li>• Ownable pattern for access control</li>
                  <li>• Input validation on all functions</li>
                  <li>• Safe transfer protocols</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
