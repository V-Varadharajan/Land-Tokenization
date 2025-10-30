import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, ChevronDown, MessageSquare, Mail } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function HelpCenter() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      question: "What is Land Tokenization?",
      answer: "Land tokenization is the process of converting real estate ownership into digital tokens (NFTs) on the blockchain. Each token represents a fractional ownership of a specific land plot, making real estate investment more accessible and liquid."
    },
    {
      question: "How do I buy a land plot?",
      answer: "First, connect your Web3 wallet (like MetaMask). Then browse available projects, select a plot you're interested in, and click 'Buy Plot'. Confirm the transaction in your wallet, and once confirmed, you'll receive the NFT representing your ownership."
    },
    {
      question: "What is the difference between Primary Sale and Resale?",
      answer: "Primary Sale is when you buy directly from the land owner (the first sale of a plot). Resale is when you buy from another investor who is selling their plot on the secondary market. Prices may differ between primary and resale listings."
    },
    {
      question: "How do I list my plot for resale?",
      answer: "Go to 'My Plots', find the plot you want to sell, and click 'List for Resale'. Enter your desired price and confirm. Your plot will then be available for others to purchase on the secondary market."
    },
    {
      question: "What are gas fees?",
      answer: "Gas fees are transaction costs on the Ethereum blockchain. They compensate network validators for processing your transaction. Gas fees vary based on network congestion and are paid in ETH."
    },
    {
      question: "Is my investment secure?",
      answer: "Our smart contracts use industry-standard security practices including ReentrancyGuard and access controls. However, all cryptocurrency investments carry risk. Never invest more than you can afford to lose, and always do your own research."
    },
    {
      question: "Can I transfer my plot to another wallet?",
      answer: "Yes! As ERC-721 NFTs, your land plots can be transferred to any Ethereum address. You can do this through your wallet interface or NFT marketplace platforms that support transfers."
    },
    {
      question: "What happens if a project goes on hold?",
      answer: "When a project owner puts a project on hold, all trading for that project's plots is temporarily suspended. You still own your plots, but cannot buy or sell them until the owner removes the hold status."
    },
    {
      question: "How do I become a land owner on the platform?",
      answer: "If you own real estate and want to tokenize it, contact our team through the Contact page. You'll need to verify ownership and complete our onboarding process to create projects and mint plot NFTs."
    },
    {
      question: "Which wallets are supported?",
      answer: "We support any Web3 wallet that's compatible with Ethereum, including MetaMask, WalletConnect-enabled wallets, Coinbase Wallet, and more. MetaMask is recommended for the best experience."
    }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find answers to commonly asked questions about our platform
          </p>
        </div>

        {/* FAQ Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <Card key={idx} className="overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left"
                >
                  <CardHeader className="hover:bg-accent/50 transition-colors">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>{faq.question}</span>
                      <ChevronDown 
                        className={`h-5 w-5 transition-transform ${
                          openFaq === idx ? "rotate-180" : ""
                        }`}
                      />
                    </CardTitle>
                  </CardHeader>
                </button>
                {openFaq === idx && (
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Still Need Help?
            </CardTitle>
            <CardDescription>
              Our support team is here to assist you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Can't find the answer you're looking for? Reach out to our support team and we'll get back to you as soon as possible.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Support
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Live Chat
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
