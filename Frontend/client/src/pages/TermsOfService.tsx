import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>1. Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3">
            <p>
              By accessing and using the LandToken platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our platform.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>2. Platform Description</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3">
            <p>
              LandToken is a blockchain-based platform that facilitates the tokenization and trading of real estate plots as NFTs (Non-Fungible Tokens). The platform enables:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Creation of land tokenization projects by verified property owners</li>
              <li>Purchase of tokenized land plots through primary sales</li>
              <li>Secondary market trading of owned plot NFTs</li>
              <li>Portfolio management and tracking</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>3. User Responsibilities</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3">
            <p>Users are responsible for:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Maintaining the security of their wallet and private keys</li>
              <li>Conducting their own due diligence before investing</li>
              <li>Understanding the risks associated with blockchain transactions</li>
              <li>Ensuring compliance with local laws and regulations</li>
              <li>Paying applicable gas fees for blockchain transactions</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>4. Investment Risks</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3">
            <p>
              Investing in tokenized real estate carries significant risks, including but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Loss of invested capital</li>
              <li>Price volatility of tokens</li>
              <li>Illiquidity in secondary markets</li>
              <li>Smart contract vulnerabilities</li>
              <li>Regulatory changes affecting digital assets</li>
            </ul>
            <p className="font-semibold text-foreground mt-3">
              Past performance is not indicative of future results. Only invest what you can afford to lose.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>5. Platform Limitations</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3">
            <p>
              LandToken is provided "as is" without warranties of any kind. We do not guarantee:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Uninterrupted or error-free service</li>
              <li>Accuracy of information provided by project owners</li>
              <li>Value retention or appreciation of tokens</li>
              <li>Immediate liquidity for all assets</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>6. Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3">
            <p>
              All content, features, and functionality of the LandToken platform are owned by the platform operators and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>7. Prohibited Activities</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3">
            <p>Users may not:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use the platform for illegal activities or money laundering</li>
              <li>Attempt to manipulate market prices</li>
              <li>Provide false or misleading information</li>
              <li>Attempt to hack or disrupt the platform</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>8. Dispute Resolution</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3">
            <p>
              Any disputes arising from the use of this platform shall be resolved through binding arbitration in accordance with applicable laws. Users waive their right to participate in class action lawsuits.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3">
            <p>
              We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the modified terms. Users are encouraged to review these terms periodically.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
