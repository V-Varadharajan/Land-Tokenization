import { useState, useEffect } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LandProjectCard from "@/components/LandProjectCard";
import { ManageProjectsModal } from "@/components/ManageProjectsModal";
import { Loader2, Plus, ShieldAlert, Upload, X, Settings, Pause, Play, Trash2 } from "lucide-react";
import { useAllLandProjects } from "@/hooks/useBlockchainData";
import { createLandProject, mintPlot, mintPlotBatch, deactivateLandProject, holdProject, unholdProject, deleteProject, isProjectOnHold } from "@/lib/blockchain";
import { uploadImageToPinata, validateImageFile } from "@/lib/pinata";
import { toast } from "react-toastify";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Default placeholder image URL
const defaultProjectImage = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80";

export default function OwnerPanel() {
  const { account, isOwner, connectWallet } = useWallet();
  const [activeTab, setActiveTab] = useState("create");
  const { projects, loading, refetch } = useAllLandProjects();
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [projectHoldStatus, setProjectHoldStatus] = useState<Record<number, boolean>>({});
  
  // Confirmation dialog states
  const [holdDialogOpen, setHoldDialogOpen] = useState(false);
  const [unholdDialogOpen, setUnholdDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    landName: "",
    totalArea: "",
    plotSize: "",
    location: "",
    contactNumber: "",
    description: "",
    imageHash: "",
    basePrice: "",
  });

  // Fetch hold status for all projects
  useEffect(() => {
    const fetchHoldStatuses = async () => {
      if (projects.length === 0) return;
      
      const statuses: Record<number, boolean> = {};
      for (const project of projects) {
        try {
          const isOnHold = await isProjectOnHold(project.id);
          statuses[project.id] = isOnHold;
        } catch (error) {
          console.error(`Error fetching hold status for project ${project.id}:`, error);
          statuses[project.id] = false;
        }
      }
      setProjectHoldStatus(statuses);
    };

    fetchHoldStatuses();
  }, [projects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      // Upload image to Pinata if a file is selected
      let imageHash = formData.imageHash;
      if (imageFile) {
        toast.info("Uploading image to IPFS...");
        const uploadResult = await uploadImageToPinata(imageFile);
        imageHash = uploadResult.ipfsHash;
        toast.success("Image uploaded successfully!");
      }

      await createLandProject({
        landName: formData.landName,
        totalArea: parseInt(formData.totalArea),
        plotSize: parseInt(formData.plotSize),
        imageHash: imageHash || "",
        description: formData.description,
        contactNumber: formData.contactNumber,
        location: formData.location,
        basePriceInEther: formData.basePrice,
      });

      toast.success("Land project created successfully!");
      
      setFormData({
        landName: "",
        totalArea: "",
        plotSize: "",
        location: "",
        contactNumber: "",
        description: "",
        imageHash: "",
        basePrice: "",
      });
      setImageFile(null);
      setImagePreview("");
      
      setTimeout(() => {
        refetch();
      }, 2000);
    } catch (error: any) {
      console.error("Error creating land project:", error);
      
      if (error.code === 4001) {
        toast.error("Transaction rejected by user");
      } else if (error.message?.includes("Pinata")) {
        toast.error(`Image upload failed: ${error.message}`);
      } else {
        toast.error("Failed to create land project. Please try again.");
      }
    } finally {
      setCreating(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid image file");
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData({ ...formData, imageHash: "" });
  };

  const handleMintPlot = async (landId: number) => {
    try {
      await mintPlot(landId);
      toast.success(`Plot minted successfully for project #${landId}!`);
      
      setTimeout(() => {
        refetch();
      }, 2000);
    } catch (error: any) {
      console.error("Error minting plot:", error);
      
      if (error.code === 4001) {
        toast.error("Transaction rejected by user");
      } else {
        toast.error("Failed to mint plot. Please try again.");
      }
    }
  };

  const handleMintMultiplePlots = async (landId: number, count: number) => {
    if (count <= 0) return;
    
    // Check if batch minting is possible (max 50 plots per batch)
    if (count <= 50) {
      // Use batch minting for single transaction
      try {
        toast.info(`Minting ${count} plots in one transaction...`);
        await mintPlotBatch(landId, count);
        toast.success(`Successfully minted ${count} plots in one transaction!`);
        
        setTimeout(() => {
          refetch();
        }, 2000);
      } catch (error: any) {
        console.error("Error batch minting plots:", error);
        
        if (error.code === 4001) {
          toast.error("Transaction rejected by user");
        } else {
          toast.error("Failed to mint plots. Please try again.");
        }
      }
    } else {
      // If more than 50, split into batches
      toast.info(`Minting ${count} plots in batches of 50...`);
      
      let successCount = 0;
      let failCount = 0;
      const batchSize = 50;
      const numBatches = Math.ceil(count / batchSize);
      
      for (let i = 0; i < numBatches; i++) {
        const plotsInBatch = Math.min(batchSize, count - (i * batchSize));
        
        try {
          await mintPlotBatch(landId, plotsInBatch);
          successCount += plotsInBatch;
          toast.success(`Batch ${i + 1}/${numBatches}: ${plotsInBatch} plots minted!`);
          
          // Small delay between batches
          if (i < numBatches - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (error: any) {
          failCount += plotsInBatch;
          console.error(`Error minting batch ${i + 1}:`, error);
          
          if (error.code === 4001) {
            toast.error(`Batch ${i + 1} rejected by user`);
            break; // Stop if user rejects
          } else {
            toast.error(`Batch ${i + 1} failed`);
          }
        }
      }
      
      if (successCount > 0) {
        toast.success(`Total: ${successCount} plots minted successfully!`);
        setTimeout(() => {
          refetch();
        }, 2000);
      }
      
      if (failCount > 0) {
        toast.error(`${failCount} plots failed to mint`);
      }
    }
  };

  const handleMintPlotOld = async (landId: number, count: number) => {
    if (count <= 0) return;
    
    toast.info(`Minting ${count} plots... Please confirm each transaction.`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < count; i++) {
      try {
        await mintPlot(landId);
        successCount++;
        toast.success(`Plot ${i + 1}/${count} minted!`);
        
        // Small delay between transactions
        if (i < count - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error: any) {
        failCount++;
        console.error(`Error minting plot ${i + 1}:`, error);
        
        if (error.code === 4001) {
          toast.error("Transaction rejected. Stopping batch mint.");
          break;
        } else {
          toast.error(`Failed to mint plot ${i + 1}`);
        }
      }
    }
    
    if (successCount > 0) {
      toast.success(`Successfully minted ${successCount} plot(s)!`);
      setTimeout(() => {
        refetch();
      }, 2000);
    }
    
    if (failCount > 0) {
      toast.warning(`${failCount} plot(s) failed to mint.`);
    }
  };

  const handleDeactivate = async (landId: number) => {
    if (!confirm("Are you sure you want to deactivate this project?")) {
      return;
    }

    try {
      await deactivateLandProject(landId);
      toast.success(`Project #${landId} deactivated successfully!`);
      
      setTimeout(() => {
        refetch();
      }, 2000);
    } catch (error: any) {
      console.error("Error deactivating land project:", error);
      
      if (error.code === 4001) {
        toast.error("Transaction rejected by user");
      } else {
        toast.error("Failed to deactivate project. Please try again.");
      }
    }
  };

  const handleHoldProject = async () => {
    if (selectedProjectId === null) return;

    try {
      await holdProject(selectedProjectId);
      toast.success(`Project #${selectedProjectId} has been put on hold!`);
      setProjectHoldStatus({ ...projectHoldStatus, [selectedProjectId]: true });
      
      setTimeout(() => {
        refetch();
      }, 2000);
    } catch (error: any) {
      console.error("Error holding project:", error);
      
      if (error.code === 4001) {
        toast.error("Transaction rejected by user");
      } else {
        toast.error("Failed to hold project. Please try again.");
      }
    } finally {
      setHoldDialogOpen(false);
      setSelectedProjectId(null);
    }
  };

  const handleUnholdProject = async () => {
    if (selectedProjectId === null) return;

    try {
      await unholdProject(selectedProjectId);
      toast.success(`Project #${selectedProjectId} has been reactivated!`);
      setProjectHoldStatus({ ...projectHoldStatus, [selectedProjectId]: false });
      
      setTimeout(() => {
        refetch();
      }, 2000);
    } catch (error: any) {
      console.error("Error unholding project:", error);
      
      if (error.code === 4001) {
        toast.error("Transaction rejected by user");
      } else {
        toast.error("Failed to reactivate project. Please try again.");
      }
    } finally {
      setUnholdDialogOpen(false);
      setSelectedProjectId(null);
    }
  };

  const handleDeleteProject = async () => {
    if (selectedProjectId === null) return;

    try {
      await deleteProject(selectedProjectId);
      toast.success(`Project #${selectedProjectId} has been deleted permanently!`);
      
      setTimeout(() => {
        refetch();
      }, 2000);
    } catch (error: any) {
      console.error("Error deleting project:", error);
      
      if (error.code === 4001) {
        toast.error("Transaction rejected by user");
      } else {
        toast.error("Failed to delete project. Please try again.");
      }
    } finally {
      setDeleteDialogOpen(false);
      setSelectedProjectId(null);
    }
  };

  if (!account) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <ShieldAlert className="h-16 w-16 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold">Owner Access Required</h2>
          <p className="text-muted-foreground max-w-md">
            Connect your wallet to access owner panel
          </p>
          <Button onClick={connectWallet} size="lg" data-testid="button-connect-cta">
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <ShieldAlert className="h-16 w-16 mx-auto text-destructive" />
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground max-w-md">
            Connected account is not the contract owner. Owner-only actions are restricted.
          </p>
        </div>
      </div>
    );
  }

  // Check if there are any projects with unminted plots
  const hasUnmintedPlots = projects.some(project => project.plotsMinted < project.numPlots);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShieldAlert className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Owner Panel
                </h1>
                <p className="text-muted-foreground mt-1">Manage land projects and mint plots with ease</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <Button 
              variant="outline" 
              onClick={() => setManageModalOpen(true)}
              disabled={loading || projects.length === 0}
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              <Settings className="h-4 w-4 mr-2" />
              Manage Projects
            </Button>
            <Badge variant="secondary" className="bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2 shadow-md">
              <ShieldAlert className="h-3 w-3 mr-1" />
              Contract Owner
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 h-auto rounded-xl shadow-sm">
            <TabsTrigger 
              value="create" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg py-3 text-base font-semibold transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Project
            </TabsTrigger>
            <TabsTrigger 
              value="mint" 
              disabled={!hasUnmintedPlots}
              className="data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg py-3 text-base font-semibold transition-all"
            >
              <Settings className="h-4 w-4 mr-2" />
              Mint Plots {!hasUnmintedPlots && "(All Minted)"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <Card className="border-2 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent border-b pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Plus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Create New Land Project</CardTitle>
                    <CardDescription className="mt-1">
                      Add a new tokenized land project to the platform with detailed information
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-8">
                <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="landName" className="text-sm font-medium flex items-center gap-2">
                      Land Name <span className="text-destructive text-xs">*</span>
                    </Label>
                    <Input
                      id="landName"
                      value={formData.landName}
                      onChange={(e) => setFormData({ ...formData, landName: e.target.value })}
                      placeholder="e.g., Sunset Valley Estates"
                      required
                      className="h-11 border-2 focus:border-primary transition-colors"
                      data-testid="input-land-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                      Location <span className="text-destructive text-xs">*</span>
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Austin, Texas"
                      required
                      className="h-11 border-2 focus:border-primary transition-colors"
                      data-testid="input-location"
                    />
                  </div>
                </div>
              </div>

              {/* Property Details Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                  <h3 className="text-lg font-semibold">Property Details</h3>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="totalArea" className="text-sm font-medium flex items-center gap-2">
                      Total Area <span className="text-xs text-muted-foreground">(sq.ft)</span> <span className="text-destructive text-xs">*</span>
                    </Label>
                    <Input
                      id="totalArea"
                      type="number"
                      value={formData.totalArea}
                      onChange={(e) => setFormData({ ...formData, totalArea: e.target.value })}
                      placeholder="e.g., 50000"
                      required
                      className="h-11 border-2 focus:border-primary transition-colors"
                      data-testid="input-total-area"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plotSize" className="text-sm font-medium flex items-center gap-2">
                      Plot Size <span className="text-xs text-muted-foreground">(sq.ft)</span> <span className="text-destructive text-xs">*</span>
                    </Label>
                    <Input
                      id="plotSize"
                      type="number"
                      value={formData.plotSize}
                      onChange={(e) => setFormData({ ...formData, plotSize: e.target.value })}
                      placeholder="e.g., 2500"
                      required
                      className="h-11 border-2 focus:border-primary transition-colors"
                      data-testid="input-plot-size"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="basePrice" className="text-sm font-medium flex items-center gap-2">
                      Base Price <span className="text-xs text-muted-foreground">(ETH)</span> <span className="text-destructive text-xs">*</span>
                    </Label>
                    <Input
                      id="basePrice"
                      type="number"
                      step="0.01"
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                      placeholder="e.g., 2.5"
                      required
                      className="h-11 border-2 focus:border-primary transition-colors"
                      data-testid="input-base-price"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactNumber" className="text-sm font-medium flex items-center gap-2">
                    Contact Number <span className="text-destructive text-xs">*</span>
                  </Label>
                  <Input
                    id="contactNumber"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    placeholder="e.g., +1 (555) 123-4567"
                    required
                    className="h-11 border-2 focus:border-primary transition-colors"
                    data-testid="input-contact"
                  />
                </div>
              </div>

              {/* Project Media Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                  <h3 className="text-lg font-semibold">Project Media</h3>
                </div>
                <div className="space-y-4">
                  {imagePreview ? (
                    <div className="relative group">
                      <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-primary/30">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-64 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            type="button"
                            variant="destructive"
                            size="lg"
                            onClick={handleRemoveImage}
                            className="shadow-lg"
                          >
                            <X className="h-5 w-5 mr-2" />
                            Remove Image
                          </Button>
                        </div>
                      </div>
                      <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                        Ready to Upload
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-12 text-center hover:border-primary/50 transition-colors bg-gradient-to-br from-muted/30 to-transparent">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-primary/10 rounded-full">
                          <Upload className="h-10 w-10 text-primary" />
                        </div>
                        <div>
                          <Label htmlFor="imageUpload" className="cursor-pointer">
                            <span className="text-base font-semibold text-foreground hover:text-primary transition-colors">
                              Click to upload image
                            </span>
                            <span className="text-muted-foreground"> or drag and drop</span>
                          </Label>
                          <p className="text-sm text-muted-foreground mt-2">
                            PNG, JPG, GIF or WebP (max 10MB)
                          </p>
                        </div>
                      </div>
                      <Input
                        id="imageUpload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageSelect}
                      />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border">
                    💡 <strong>Tip:</strong> Upload an image to IPFS via Pinata, or manually enter an IPFS hash below
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageHash" className="text-sm font-medium">
                  Or Enter Image Hash/URL Manually <span className="text-xs text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="imageHash"
                  value={formData.imageHash}
                  onChange={(e) => setFormData({ ...formData, imageHash: e.target.value })}
                  placeholder="IPFS hash or image URL"
                  className="h-11 border-2 focus:border-primary transition-colors"
                  data-testid="input-image"
                  disabled={!!imageFile}
                />
                {imageFile && (
                  <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-2 rounded flex items-center gap-2">
                    <ShieldAlert className="h-3 w-3" />
                    Remove uploaded image to manually enter hash
                  </p>
                )}
              </div>

              {/* Description Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                  <h3 className="text-lg font-semibold">Project Description</h3>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description <span className="text-xs text-muted-foreground">(optional)</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the land project, location benefits, amenities, and unique features that make this property stand out..."
                    className="min-h-32 border-2 focus:border-primary transition-colors resize-none"
                    data-testid="input-description"
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.description.length} / 500 characters
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t">
                <Button 
                  type="submit" 
                  disabled={creating || uploading} 
                  size="lg"
                  className="flex-1 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all" 
                  data-testid="button-create-project"
                >
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Project...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-5 w-5" />
                      Create Land Project
                    </>
                  )}
                </Button>
                {(formData.landName || formData.location || formData.totalArea) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      if (confirm("Are you sure you want to clear the form?")) {
                        setFormData({
                          landName: "",
                          totalArea: "",
                          plotSize: "",
                          location: "",
                          contactNumber: "",
                          description: "",
                          imageHash: "",
                          basePrice: "",
                        });
                        setImageFile(null);
                        setImagePreview("");
                      }
                    }}
                    className="h-12"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Project Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Project Overview</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {projects.length} {projects.length === 1 ? 'project' : 'projects'} created
              </p>
            </div>
            {projects.length > 0 && (
              <Badge variant="outline" className="text-base px-4 py-2">
                Total: {projects.reduce((sum, p) => sum + p.plotsMinted, 0)} plots minted
              </Badge>
            )}
          </div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 bg-muted/20 rounded-2xl border-2 border-dashed">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-muted/30 to-transparent rounded-2xl border-2 border-dashed">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-muted rounded-full">
                  <Plus className="h-12 w-12 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
                  <p className="text-muted-foreground max-w-md">
                    Create your first land project using the form above to get started with tokenization!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div key={project.id} className="space-y-3 group">
                  <div className="transform transition-all group-hover:scale-[1.02]">
                    <LandProjectCard 
                      project={{
                        ...project,
                        imageUrl: project.imageUrl || defaultProjectImage,
                      }} 
                      showManageButton 
                    />
                  </div>
                  <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-4 shadow-sm border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground font-medium">Minting Progress</span>
                      <span className="font-bold text-lg">{project.plotsMinted} / {project.numPlots}</span>
                    </div>
                    <div className="w-full bg-background/80 rounded-full h-3 overflow-hidden shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all duration-500 relative overflow-hidden"
                        style={{ width: `${(project.plotsMinted / project.numPlots) * 100}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      {Math.round((project.plotsMinted / project.numPlots) * 100)}% Complete
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4 pt-3 border-t">
                      {projectHoldStatus[project.id] ? (
                        <Button
                          onClick={() => {
                            setSelectedProjectId(project.id);
                            setUnholdDialogOpen(true);
                          }}
                          size="sm"
                          variant="outline"
                          className="flex-1 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Resume
                        </Button>
                      ) : (
                        <Button
                          onClick={() => {
                            setSelectedProjectId(project.id);
                            setHoldDialogOpen(true);
                          }}
                          size="sm"
                          variant="outline"
                          className="flex-1 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <Pause className="h-3 w-3 mr-1" />
                          Hold
                        </Button>
                      )}
                      <Button
                        onClick={() => {
                          setSelectedProjectId(project.id);
                          setDeleteDialogOpen(true);
                        }}
                        size="sm"
                        variant="destructive"
                        className="flex-1 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>

                    {/* Hold Status Badge */}
                    {projectHoldStatus[project.id] && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200 dark:border-amber-900">
                        <Pause className="h-3 w-3" />
                        <span className="font-medium">Project is on hold</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="mint" className="space-y-6">
        <Card className="border-2 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent border-b pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  Mint Plots
                </CardTitle>
                <CardDescription className="mt-1">
                  Mint plots for your land projects. Use batch minting to mint multiple plots efficiently (up to 50 plots per transaction).
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading projects...</p>
              </div>
            ) : !hasUnmintedPlots ? (
              <div className="text-center py-12 bg-gradient-to-br from-green-50 to-transparent dark:from-green-950/20 rounded-xl border-2 border-green-200 dark:border-green-900">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <ShieldAlert className="h-12 w-12 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">All Plots Minted!</h3>
                    <p className="text-muted-foreground">
                      All plots have been minted for all projects. Great job! 🎉
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {projects.filter(project => project.plotsMinted < project.numPlots).map((project) => (
                  <div 
                    key={project.id} 
                    className="border-2 rounded-xl p-6 space-y-5 bg-gradient-to-br from-card to-muted/10 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    {/* Project Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-xl">{project.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            ID: {project.id}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                          📍 {project.location}
                        </p>
                      </div>
                      <Badge 
                        variant={project.active ? "default" : "secondary"}
                        className={project.active ? "bg-green-600 hover:bg-green-700" : ""}
                      >
                        {project.active ? "● Active" : "○ Inactive"}
                      </Badge>
                    </div>

                    {/* Project Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-background/80 rounded-lg p-3 border shadow-sm">
                        <p className="text-xs text-muted-foreground font-medium mb-1">Total Plots</p>
                        <p className="text-2xl font-bold">{project.numPlots}</p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 border border-green-200 dark:border-green-900 shadow-sm">
                        <p className="text-xs text-green-700 dark:text-green-400 font-medium mb-1">Minted</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{project.plotsMinted}</p>
                      </div>
                      <div className="bg-primary/5 rounded-lg p-3 border border-primary/20 shadow-sm">
                        <p className="text-xs text-primary font-medium mb-1">Remaining</p>
                        <p className="text-2xl font-bold text-primary">
                          {project.numPlots - project.plotsMinted}
                        </p>
                      </div>
                      <div className="bg-background/80 rounded-lg p-3 border shadow-sm">
                        <p className="text-xs text-muted-foreground font-medium mb-1">Price/Plot</p>
                        <p className="text-2xl font-bold">{project.basePrice} <span className="text-sm">ETH</span></p>
                      </div>
                    </div>

                    {/* Enhanced Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground font-medium">Minting Progress</span>
                        <span className="font-bold text-lg">
                          {Math.round((project.plotsMinted / project.numPlots) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-muted/50 rounded-full h-4 overflow-hidden shadow-inner border">
                        <div 
                          className="bg-gradient-to-r from-primary via-primary to-primary/80 h-4 rounded-full transition-all duration-700 relative overflow-hidden"
                          style={{ width: `${(project.plotsMinted / project.numPlots) * 100}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse" />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                        </div>
                      </div>
                    </div>

                    {/* Minting Controls */}
                    <div className="space-y-3 pt-2 border-t">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                        <p className="text-sm font-semibold text-muted-foreground">Quick Mint Options</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => handleMintPlot(project.id)}
                          size="sm"
                          disabled={!project.active}
                          className="shadow-sm hover:shadow-md transition-shadow"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Mint 1
                        </Button>
                        <Button
                          onClick={() => handleMintMultiplePlots(project.id, Math.min(5, project.numPlots - project.plotsMinted))}
                          size="sm"
                          variant="secondary"
                          disabled={!project.active || (project.numPlots - project.plotsMinted) < 5}
                          className="shadow-sm hover:shadow-md transition-shadow"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Mint 5
                        </Button>
                        <Button
                          onClick={() => handleMintMultiplePlots(project.id, Math.min(10, project.numPlots - project.plotsMinted))}
                          size="sm"
                          variant="secondary"
                          disabled={!project.active || (project.numPlots - project.plotsMinted) < 10}
                          className="shadow-sm hover:shadow-md transition-shadow"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Mint 10
                        </Button>
                        <Button
                          onClick={() => handleMintMultiplePlots(project.id, Math.min(20, project.numPlots - project.plotsMinted))}
                          size="sm"
                          variant="secondary"
                          disabled={!project.active || (project.numPlots - project.plotsMinted) < 20}
                          className="shadow-sm hover:shadow-md transition-shadow"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Mint 20
                        </Button>
                        <Button
                          onClick={() => handleMintMultiplePlots(project.id, Math.min(50, project.numPlots - project.plotsMinted))}
                          size="sm"
                          variant="secondary"
                          disabled={!project.active || (project.numPlots - project.plotsMinted) < 50}
                          className="shadow-sm hover:shadow-md transition-shadow"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Mint 50
                        </Button>
                        <Button
                          onClick={() => handleMintMultiplePlots(project.id, project.numPlots - project.plotsMinted)}
                          size="sm"
                          variant="outline"
                          disabled={!project.active}
                          className="ml-auto shadow-sm hover:shadow-md transition-shadow border-2"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Mint All ({project.numPlots - project.plotsMinted})
                        </Button>
                      </div>
                      {!project.active && (
                        <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-900">
                          <ShieldAlert className="h-5 w-5 flex-shrink-0" />
                          <span className="font-medium">Project is inactive. Activate it from Manage Projects to mint plots.</span>
                        </div>
                      )}
                    </div>

                    {/* Deactivate Button */}
                    {project.active && (
                      <div className="pt-3 border-t">
                        <Button
                          onClick={() => handleDeactivate(project.id)}
                          variant="destructive"
                          size="sm"
                          className="w-full shadow-sm hover:shadow-md transition-shadow"
                        >
                          <ShieldAlert className="h-4 w-4 mr-2" />
                          Deactivate Project
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
      </div>
      
      <ManageProjectsModal
        open={manageModalOpen}
        onOpenChange={setManageModalOpen}
        projects={projects}
        onUpdate={refetch}
      />

      {/* Hold Project Confirmation Dialog */}
      <AlertDialog open={holdDialogOpen} onOpenChange={setHoldDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Pause className="h-5 w-5 text-amber-600" />
              Hold Project?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to put <strong>Project #{selectedProjectId}</strong> on hold? 
              <br /><br />
              This will temporarily pause all activities for this project. Users won't be able to purchase plots until you resume it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleHoldProject}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Yes, Hold Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unhold Project Confirmation Dialog */}
      <AlertDialog open={unholdDialogOpen} onOpenChange={setUnholdDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-green-600" />
              Resume Project?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to resume <strong>Project #{selectedProjectId}</strong>?
              <br /><br />
              This will reactivate the project and allow users to purchase plots again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnholdProject}
              className="bg-green-600 hover:bg-green-700"
            >
              Yes, Resume Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Project Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete Project Permanently?
            </AlertDialogTitle>
            <AlertDialogDescription>
              ⚠️ <strong>Warning:</strong> This action cannot be undone!
              <br /><br />
              Are you absolutely sure you want to permanently delete <strong>Project #{selectedProjectId}</strong>?
              <br /><br />
              All project data will be removed from the blockchain. This should only be done if no plots have been sold.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className="bg-destructive hover:bg-destructive/90"
            >
              Yes, Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
