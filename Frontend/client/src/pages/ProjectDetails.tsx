import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PlotGrid, { Plot } from "@/components/PlotGrid";
import BuyPlotModal from "@/components/BuyPlotModal";
import { ArrowLeft, MapPin, Grid3x3, DollarSign, Phone, Mail, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useLandProject, useProjectPlots } from "@/hooks/useBlockchainData";
import { getContractOwner } from "@/lib/blockchain";
import { getIpfsUrl } from "@/lib/pinata";

// Default placeholder image URL
const defaultProjectImage = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80";

export default function ProjectDetails() {
  const [, params] = useRoute("/project/:id");
  const [selectedPlot, setSelectedPlot] = useState<any>(null);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [contractOwner, setContractOwner] = useState<string>("");
  
  const landId = parseInt(params?.id || "0");
  const { project, loading: loadingProject } = useLandProject(landId);
  const { plots, loading: loadingPlots } = useProjectPlots(
    landId,
    project?.numPlots || 0,
    contractOwner
  );

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const owner = await getContractOwner();
        setContractOwner(owner);
      } catch (error) {
        console.error("Error fetching contract owner:", error);
      }
    };
    fetchOwner();
  }, []);

  const handlePlotClick = (plot: Plot) => {
    setSelectedPlot({
      tokenId: plot.tokenId,
      plotNumber: plot.plotNumber,
      price: plot.status === "listed" ? plot.resalePrice : plot.price,
      landName: project?.name || "",
      isResale: plot.status === "listed",
    });
    setBuyModalOpen(true);
  };

  const availablePlots = plots.filter((p) => p.status === "available").length;
  const listedPlots = plots.filter((p) => p.status === "listed").length;
  const soldPlots = plots.filter((p) => p.status === "sold").length;

  if (loadingProject) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Grid3x3 className="h-16 w-16 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold">Project not found</h2>
          <Button asChild>
            <Link href="/browse">Browse Projects</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div>
          <Link href="/browse">
            <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h1 className="text-4xl font-bold">{project.name}</h1>
                  {project.active ? (
                    <Badge>Active</Badge>
                  ) : (
                    <Badge variant="destructive">Inactive</Badge>
                  )}
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{project.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{project.contactNumber}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Total Area</div>
                  <div className="text-2xl font-bold">
                    {project.totalArea.toLocaleString()} sq.ft
                  </div>
                </div>
                <div className="bg-card border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Plot Size</div>
                  <div className="text-2xl font-bold">
                    {project.plotSize.toLocaleString()} sq.ft
                  </div>
                </div>
                <div className="bg-card border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Total Plots</div>
                  <div className="text-2xl font-bold">{project.numPlots}</div>
                </div>
                <div className="bg-card border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Base Price</div>
                  <div className="text-2xl font-bold">{project.basePrice} ETH</div>
                </div>
              </div>
            </div>

            <div className="aspect-video relative overflow-hidden rounded-lg border">
              <img
                src={project.imageUrl ? getIpfsUrl(project.imageUrl) : defaultProjectImage}
                alt={project.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Plot Availability</h2>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-green-500"></div>
                <span>Available ({availablePlots})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-yellow-500"></div>
                <span>Listed ({listedPlots})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-muted"></div>
                <span>Sold ({soldPlots})</span>
              </div>
            </div>
          </div>

          {loadingPlots ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : plots.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Grid3x3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Plots Available Yet</h3>
              <p className="text-muted-foreground mb-4">
                The owner needs to mint plots before they can be purchased.
              </p>
              <p className="text-sm text-muted-foreground">
                Total plots available to mint: {project.numPlots}
              </p>
            </div>
          ) : (
            <PlotGrid plots={plots} onPlotClick={handlePlotClick} />
          )}
        </div>
      </div>

      <BuyPlotModal 
        open={buyModalOpen} 
        onClose={() => setBuyModalOpen(false)} 
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
