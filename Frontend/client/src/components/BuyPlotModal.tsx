import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { buyPlot, buyResale } from "@/lib/blockchain";
import { toast } from "react-toastify";

interface BuyPlotModalProps {
  open: boolean;
  onClose: () => void;
  plot: {
    tokenId: number;
    plotNumber: number;
    price: string;
    landName: string;
    isResale?: boolean;
  } | null;
  onSuccess?: () => void;
}

export default function BuyPlotModal({ open, onClose, plot, onSuccess }: BuyPlotModalProps) {
  const [purchasing, setPurchasing] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!plot) return null;

  const handlePurchase = async () => {
    setPurchasing(true);
    
    try {
      const purchaseFunction = plot.isResale ? buyResale : buyPlot;
      await purchaseFunction(plot.tokenId, plot.price);
      
      setSuccess(true);
      toast.success(`Successfully purchased Plot #${plot.plotNumber}!`);
      
      if (onSuccess) {
        onSuccess();
      }
      
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (error: any) {
      console.error("Error purchasing plot:", error);
      
      if (error.code === 4001) {
        toast.error("Transaction rejected by user");
      } else if (error.message?.includes("insufficient funds")) {
        toast.error("Insufficient funds to complete this purchase");
      } else {
        toast.error("Failed to purchase plot. Please try again.");
      }
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent data-testid="modal-buy-plot">
        {success ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-2xl font-bold mb-2">Purchase Successful!</h3>
            <p className="text-muted-foreground text-center">
              Plot #{plot.plotNumber} is now yours
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                {plot.isResale ? "Buy Resale Plot" : "Buy Plot"}
              </DialogTitle>
              <DialogDescription>
                Review the details before confirming your purchase
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Land Project</span>
                  <span className="font-medium">{plot.landName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Plot Number</span>
                  <span className="font-medium">#{plot.plotNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Token ID</span>
                  <span className="font-mono text-sm">{plot.tokenId}</span>
                </div>
                {plot.isResale && (
                  <Badge variant="secondary" className="w-full justify-center">
                    Resale Listing
                  </Badge>
                )}
              </div>

              <div className="bg-primary/10 border border-primary p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Price</span>
                  <span className="text-2xl font-bold">{plot.price} ETH</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                By purchasing this plot, you agree to the terms and conditions. The transaction
                will be processed on the blockchain and cannot be reversed.
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={purchasing} data-testid="button-cancel">
                Cancel
              </Button>
              <Button onClick={handlePurchase} disabled={purchasing} data-testid="button-confirm-purchase">
                {purchasing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Purchase"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
