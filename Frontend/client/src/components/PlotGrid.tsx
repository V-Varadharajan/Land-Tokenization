import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface Plot {
  tokenId: number;
  plotNumber: number;
  status: "available" | "listed" | "sold";
  price: string;
  owner?: string;
  resalePrice?: string;
}

interface PlotGridProps {
  plots: Plot[];
  onPlotClick: (plot: Plot) => void;
}

export default function PlotGrid({ plots, onPlotClick }: PlotGridProps) {
  const getPlotColor = (status: string) => {
    switch (status) {
      case "available":
        return "border-green-500 bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/40";
      case "listed":
        return "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 hover:bg-yellow-100 dark:hover:bg-yellow-950/40";
      case "sold":
        return "border-border bg-muted/50 opacity-60 cursor-not-allowed";
      default:
        return "";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="text-xs bg-green-600">Available</Badge>;
      case "listed":
        return <Badge className="text-xs bg-yellow-600">Listed</Badge>;
      case "sold":
        return <Badge variant="secondary" className="text-xs">Sold</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
      <TooltipProvider>
        {plots.map((plot) => (
          <Tooltip key={plot.tokenId}>
            <TooltipTrigger asChild>
              <button
                onClick={() => plot.status !== "sold" && onPlotClick(plot)}
                className={`aspect-square border-2 rounded-md flex items-center justify-center text-xs font-medium transition-all hover-elevate active-elevate-2 ${getPlotColor(
                  plot.status
                )}`}
                disabled={plot.status === "sold"}
                data-testid={`plot-${plot.tokenId}`}
              >
                #{plot.plotNumber}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-semibold">Plot #{plot.plotNumber}</p>
                <p className="text-sm">Token ID: {plot.tokenId}</p>
                {getStatusBadge(plot.status)}
                {plot.status === "available" && (
                  <p className="text-sm">Price: {plot.price} ETH</p>
                )}
                {plot.status === "listed" && plot.resalePrice && (
                  <p className="text-sm">Resale: {plot.resalePrice} ETH</p>
                )}
                {plot.owner && (
                  <p className="text-xs font-mono">
                    Owner: {plot.owner.slice(0, 6)}...{plot.owner.slice(-4)}
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
}
