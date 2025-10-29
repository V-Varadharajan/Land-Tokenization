import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import LandProjectCard from "@/components/LandProjectCard";
import { Loader2, Plus, ShieldAlert, Upload, X } from "lucide-react";
import { useAllLandProjects } from "@/hooks/useBlockchainData";
import { createLandProject, mintPlot, deactivateLandProject } from "@/lib/blockchain";
import { uploadImageToPinata, validateImageFile } from "@/lib/pinata";
import { toast } from "react-toastify";

// Default placeholder image URL
const defaultProjectImage = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80";

export default function OwnerPanel() {
  const { account, isOwner, connectWallet } = useWallet();
  const { projects, loading, refetch } = useAllLandProjects();
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
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

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Owner Panel</h1>
            <p className="text-muted-foreground">Manage land projects and mint plots</p>
          </div>
          <Badge variant="secondary" className="bg-green-600 text-white">
            Contract Owner
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create New Land Project</CardTitle>
            <CardDescription>
              Add a new tokenized land project to the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="landName">
                    Land Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="landName"
                    value={formData.landName}
                    onChange={(e) => setFormData({ ...formData, landName: e.target.value })}
                    placeholder="e.g., Sunset Valley Estates"
                    required
                    data-testid="input-land-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">
                    Location <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Austin, Texas"
                    required
                    data-testid="input-location"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalArea">
                    Total Area (sq.ft) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="totalArea"
                    type="number"
                    value={formData.totalArea}
                    onChange={(e) => setFormData({ ...formData, totalArea: e.target.value })}
                    placeholder="e.g., 50000"
                    required
                    data-testid="input-total-area"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plotSize">
                    Plot Size (sq.ft) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="plotSize"
                    type="number"
                    value={formData.plotSize}
                    onChange={(e) => setFormData({ ...formData, plotSize: e.target.value })}
                    placeholder="e.g., 2500"
                    required
                    data-testid="input-plot-size"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="basePrice">
                    Base Price (ETH) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    placeholder="e.g., 2.5"
                    required
                    data-testid="input-base-price"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactNumber">
                    Contact Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contactNumber"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    placeholder="e.g., +1 (555) 123-4567"
                    required
                    data-testid="input-contact"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Project Image</Label>
                <div className="space-y-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <Label htmlFor="imageUpload" className="cursor-pointer">
                        <span className="text-sm text-muted-foreground">
                          Click to upload image or drag and drop
                        </span>
                        <br />
                        <span className="text-xs text-muted-foreground">
                          PNG, JPG, GIF or WebP (max 10MB)
                        </span>
                      </Label>
                      <Input
                        id="imageUpload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageSelect}
                      />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Upload an image to IPFS via Pinata, or manually enter an IPFS hash below
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageHash">Or Enter Image Hash/URL Manually (optional)</Label>
                <Input
                  id="imageHash"
                  value={formData.imageHash}
                  onChange={(e) => setFormData({ ...formData, imageHash: e.target.value })}
                  placeholder="IPFS hash or image URL"
                  data-testid="input-image"
                  disabled={!!imageFile}
                />
                {imageFile && (
                  <p className="text-xs text-muted-foreground">
                    Remove uploaded image to manually enter hash
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the land project, location benefits, and features..."
                  className="min-h-32"
                  data-testid="input-description"
                />
              </div>

              <Button type="submit" disabled={creating || uploading} className="w-full md:w-auto" data-testid="button-create-project">
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Project...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Land Project
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Manage Existing Projects</h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No projects created yet. Create your first project above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div key={project.id} className="space-y-2">
                  <LandProjectCard 
                    project={{
                      ...project,
                      imageUrl: project.imageUrl || defaultProjectImage,
                    }} 
                    showManageButton 
                  />
                  <div className="bg-muted/50 rounded-lg p-3 text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground">Plots Minted:</span>
                      <span className="font-bold">{project.plotsMinted} / {project.numPlots}</span>
                    </div>
                    <div className="w-full bg-background rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(project.plotsMinted / project.numPlots) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleMintPlot(project.id)}
                      className="flex-1"
                      disabled={project.plotsMinted >= project.numPlots}
                      data-testid={`button-mint-${project.id}`}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Mint 1
                    </Button>
                    <Button
                      onClick={() => handleMintMultiplePlots(project.id, Math.min(5, project.numPlots - project.plotsMinted))}
                      className="flex-1"
                      disabled={project.plotsMinted >= project.numPlots}
                      variant="secondary"
                      data-testid={`button-mint-5-${project.id}`}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Mint 5
                    </Button>
                    {project.plotsMinted < project.numPlots && (
                      <Button
                        onClick={() => handleMintMultiplePlots(project.id, project.numPlots - project.plotsMinted)}
                        className="flex-1"
                        variant="outline"
                        data-testid={`button-mint-all-${project.id}`}
                      >
                        Mint All ({project.numPlots - project.plotsMinted})
                      </Button>
                    )}
                  </div>
                  {project.active && project.plotsMinted >= project.numPlots && (
                    <Button
                      onClick={() => handleDeactivate(project.id)}
                      variant="destructive"
                      className="w-full"
                      data-testid={`button-deactivate-${project.id}`}
                    >
                      Deactivate Project
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
