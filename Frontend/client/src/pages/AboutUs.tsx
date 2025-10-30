import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Eye, Award, Users, TrendingUp, Shield } from "lucide-react";

export default function AboutUs() {
  const values = [
    {
      icon: Shield,
      title: "Transparency",
      description: "Blockchain technology ensures every transaction is visible and verifiable"
    },
    {
      icon: Users,
      title: "Accessibility",
      description: "Making real estate investment accessible to everyone, regardless of capital"
    },
    {
      icon: TrendingUp,
      title: "Innovation",
      description: "Pioneering the future of property ownership through tokenization"
    },
    {
      icon: Award,
      title: "Trust",
      description: "Built on secure, auditable smart contracts with user protection in mind"
    }
  ];

  const team = [
    {
      role: "Blockchain Development",
      description: "Expert Solidity developers ensuring secure and efficient smart contracts"
    },
    {
      role: "Real Estate Advisory",
      description: "Industry professionals bringing decades of property market experience"
    },
    {
      role: "Legal Compliance",
      description: "Ensuring adherence to regulations across multiple jurisdictions"
    },
    {
      role: "Community Support",
      description: "Dedicated team helping users navigate the platform successfully"
    }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            About LandToken
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We're revolutionizing real estate investment by making it accessible, transparent, 
            and liquid through blockchain technology. Our mission is to democratize property ownership 
            and create new opportunities for investors worldwide.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                To break down barriers in real estate investment by leveraging blockchain technology, 
                enabling fractional ownership, and creating a transparent marketplace where anyone can 
                participate in property markets that were previously inaccessible.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-6 w-6 text-primary" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                A future where real estate investment is as simple as trading stocks, where property 
                ownership is accessible to all economic classes, and where blockchain ensures complete 
                transparency and trust in every transaction.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Core Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <Card key={value.title} className="text-center">
                <CardHeader>
                  <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit mb-2">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl">How We're Different</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</span>
                  Fractional Ownership
                </h4>
                <p className="text-sm text-muted-foreground">
                  Own a piece of premium real estate without needing millions. Each plot is tokenized into affordable units.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</span>
                  Instant Liquidity
                </h4>
                <p className="text-sm text-muted-foreground">
                  Unlike traditional real estate, sell your tokens anytime on our secondary market without lengthy processes.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</span>
                  Blockchain Security
                </h4>
                <p className="text-sm text-muted-foreground">
                  Every transaction is recorded on-chain, ensuring transparency, security, and verifiable ownership.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Team</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {team.map((member) => (
              <Card key={member.role}>
                <CardHeader>
                  <CardTitle className="text-lg">{member.role}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats */}
        <Card className="bg-gradient-to-br from-primary/10 to-blue-500/10">
          <CardContent className="py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary">2024</div>
                <div className="text-sm text-muted-foreground mt-1">Founded</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">$2.5M+</div>
                <div className="text-sm text-muted-foreground mt-1">Assets Tokenized</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">1,200+</div>
                <div className="text-sm text-muted-foreground mt-1">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">150+</div>
                <div className="text-sm text-muted-foreground mt-1">Projects</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
