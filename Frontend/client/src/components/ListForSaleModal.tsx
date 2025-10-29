import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { listForSale } from "@/lib/blockchain";
import { toast } from "react-toastify";

interface ListForSaleModalProps {
  open: boolean;
  onClose: () => void;
  plot: {
    tokenId: number;
    plotNumber: number;
    landName: string;
    originalPrice: string;
  } | null;
  onSuccess?: () => void;
}

export default function ListForSaleModal({ open, onClose, plot, onSuccess }: ListForSaleModalProps) {
  const [price, setPrice] = useState("");
  const [listing, setListing] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!plot) return null;

  const handleList = async () => {
    if (!price || parseFloat(price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setListing(true);

    try {
      await listForSale(plot.tokenId, price);
      
      setSuccess(true);
      toast.success(`Plot #${plot.plotNumber} listed for ${price} ETH!`);
      
      if (onSuccess) {
        onSuccess();
      }
      
      setTimeout(() => {
        setSuccess(false);
        setPrice("");
        onClose();
      }, 2000);
    } catch (error: any) {
      console.error("Error listing plot:", error);
      
      if (error.code === 4001) {
        toast.error("Transaction rejected by user");
      } else {
        toast.error("Failed to list plot for sale. Please try again.");
      }
    } finally {
      setListing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent data-testid="modal-list-sale">
        {success ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-2xl font-bold mb-2">Listed Successfully!</h3>
            <p className="text-muted-foreground text-center">
              Plot #{plot.plotNumber} is now listed for {price} ETH
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>List Plot for Sale</DialogTitle>
              <DialogDescription>
                Set your resale price for this plot
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Land Project</span>
                  <span className="font-medium">{plot.landName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Plot Number</span>
                  <span className="font-medium">#{plot.plotNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Original Price</span>
                  <span className="font-medium">{plot.originalPrice} ETH</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resale-price">Resale Price (ETH)</Label>
                <Input
                  id="resale-price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Enter price in ETH"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  data-testid="input-resale-price"
                />
                <p className="text-xs text-muted-foreground">
                  Set a competitive price to attract buyers
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={listing} data-testid="button-cancel">
                Cancel
              </Button>
              <Button onClick={handleList} disabled={listing} data-testid="button-confirm-list">
                {listing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Listing...
                  </>
                ) : (
                  "List for Sale"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
