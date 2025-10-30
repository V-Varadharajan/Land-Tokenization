import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>1. Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3">
            <p>We collect the following types of information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-foreground">Blockchain Data:</strong> Your public wallet address and transaction history, which are publicly available on the blockchain
              </li>
              <li>
                <strong className="text-foreground">Usage Data:</strong> Information about how you interact with our platform, including pages visited and features used
              </li>
              <li>
                <strong className="text-foreground">Technical Data:</strong> IP address, browser type, device information, and cookies for platform functionality
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>2. How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3">
            <p>We use collected information to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide and maintain our platform services</li>
              <li>Process your transactions on the blockchain</li>
              <li>Improve user experience and platform features</li>
              <li>Send important updates and notifications</li>
              <li>Detect and prevent fraud or security issues</li>
              <li>Comply with legal obligations</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>3. Blockchain Transparency</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3">
            <p>
              Important: Blockchain transactions are permanent and publicly visible. Your wallet address and all transactions are recorded on the Ethereum blockchain and can be viewed by anyone using blockchain explorers.
            </p>
            <p>
              We cannot delete, modify, or hide blockchain data. This is an inherent characteristic of blockchain technology.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>4. Data Sharing and Disclosure</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3">
            <p>We do not sell your personal information. We may share data with:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Service providers who assist in platform operations</li>
              <li>Law enforcement when required by law</li>
              <li>Third parties with your explicit consent</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>5. Cookies and Tracking</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3">
            <p>
              We use cookies and similar technologies to enhance your experience, remember your preferences, and analyze platform usage. You can control cookies through your browser settings, but some features may not function properly if cookies are disabled.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>6. Data Security</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3">
            <p>
              We implement industry-standard security measures to protect your information. However, no method of transmission over the internet is 100% secure. Users are responsible for maintaining the security of their own wallets and private keys.
            </p>
            <p className="font-semibold text-foreground">
              Never share your private keys or seed phrases with anyone, including our team.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>7. Your Rights</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3">
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access your personal information we hold</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data (except blockchain records)</li>
              <li>Opt-out of marketing communications</li>
              <li>Lodge a complaint with data protection authorities</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>8. Third-Party Services</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3">
            <p>
              Our platform integrates with third-party services like MetaMask and Ethereum blockchain. These services have their own privacy policies, which we encourage you to review.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>9. Children's Privacy</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3">
            <p>
              Our platform is not intended for users under 18 years of age. We do not knowingly collect information from children. If you believe we have collected information from a minor, please contact us immediately.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Policy Updates</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3">
            <p>
              We may update this privacy policy from time to time. We will notify users of significant changes through the platform or via email. Continued use after changes constitutes acceptance of the updated policy.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
