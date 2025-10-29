import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ListForSaleModal from "@/components/ListForSaleModal";
import { Grid3x3, Tag, X, Loader2 } from "lucide-react";
import { useUserOwnedPlots } from "@/hooks/useBlockchainData";

interface OwnedPlot {
  tokenId: number;
  plotNumber: number;
  landName: string;
  landId: number;
  purchasePrice: string;
  isListed: boolean;
  listingPrice?: string;
}

export default function MyPlots() {
  const { account, connectWallet } = useWallet();
  const [selectedPlot, setSelectedPlot] = useState<any>(null);
  const [listModalOpen, setListModalOpen] = useState(false);
  const { plots, loading } = useUserOwnedPlots(account);

  const handleListForSale = (plot: OwnedPlot) => {
    setSelectedPlot({
      tokenId: plot.tokenId,
      plotNumber: plot.plotNumber,
      landName: plot.landName,
      originalPrice: plot.purchasePrice,
    });
    setListModalOpen(true);
  };

  const handleUnlist = async (tokenId: number) => {
    try {
      const { unlistFromSale } = await import("@/lib/blockchain");
      const { toast } = await import("react-toastify");
      
      await unlistFromSale(tokenId);
      toast.success("Plot unlisted successfully!");
      
      // Refresh the plots
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      const { toast } = await import("react-toastify");
      console.error("Error unlisting plot:", error);
      
      if (error.code === 4001) {
        toast.error("Transaction rejected by user");
      } else {
        toast.error("Failed to unlist plot. Please try again.");
      }
    }
  };

  if (!account) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Grid3x3 className="h-16 w-16 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold">Connect Your Wallet</h2>
          <p className="text-muted-foreground max-w-md">
            Connect your wallet to view and manage your land plot NFTs
          </p>
          <Button onClick={connectWallet} size="lg" data-testid="button-connect-cta">
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Plots</h1>
            <p className="text-muted-foreground">Manage your land plot NFTs</p>
          </div>
          {!loading && plots.length > 0 && (
            <Badge variant="secondary" className="text-lg px-4 py-2" data-testid="badge-total-plots">
              {plots.length} {plots.length === 1 ? "Plot" : "Plots"}
            </Badge>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : plots.length === 0 ? (
          <div className="text-center py-12">
            <Grid3x3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No plots owned yet</h3>
            <p className="text-muted-foreground mb-6">
              Browse available land projects and start building your portfolio
            </p>
            <Button asChild data-testid="button-browse-projects">
              <a href="/browse">Browse Projects</a>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plots.map((plot) => (
            <Card key={plot.tokenId} data-testid={`card-plot-${plot.tokenId}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-lg">{plot.landName}</h3>
                    <p className="text-sm text-muted-foreground">Plot #{plot.plotNumber}</p>
                  </div>
                  {plot.isListed ? (
                    <Badge variant="secondary" className="bg-yellow-600 text-white">
                      <Tag className="h-3 w-3 mr-1" />
                      Listed
                    </Badge>
                  ) : (
                    <Badge variant="outline">Unlisted</Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="bg-muted p-3 rounded-md space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Token ID</span>
                    <span className="font-mono">{plot.tokenId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Purchase Price</span>
                    <span className="font-semibold">{plot.purchasePrice} ETH</span>
                  </div>
                  {plot.isListed && plot.listingPrice && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Listing Price</span>
                      <span className="font-semibold text-green-600">
                        {plot.listingPrice} ETH
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="gap-2">
                {plot.isListed ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleUnlist(plot.tokenId)}
                    data-testid={`button-unlist-${plot.tokenId}`}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Unlist from Sale
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => handleListForSale(plot)}
                    data-testid={`button-list-${plot.tokenId}`}
                  >
                    <Tag className="h-4 w-4 mr-2" />
                    List for Sale
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
          </div>
        )}
      </div>

      <ListForSaleModal
        open={listModalOpen}
        onClose={() => setListModalOpen(false)}
        plot={selectedPlot}
        onSuccess={() => {
          setTimeout(() => {
            window.location.reload();
          }, 2500);
        }}
      />
    </div>
  );
}
