import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Grid3x3, DollarSign, Phone } from "lucide-react";
import { Link } from "wouter";
import { getIpfsUrl } from "@/lib/pinata";

// Default placeholder image URL
const defaultProjectImage = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80";

export interface LandProject {
  id: number;
  name: string;
  location: string;
  totalArea: number;
  plotSize: number;
  numPlots: number;
  plotsMinted: number;
  basePrice: string;
  imageUrl: string;
  contactNumber: string;
  description: string;
  active: boolean;
}

interface LandProjectCardProps {
  project: LandProject;
  showManageButton?: boolean;
}

export default function LandProjectCard({ project, showManageButton = false }: LandProjectCardProps) {
  const availablePlots = project.plotsMinted;
  const soldPlots = project.numPlots - project.plotsMinted;
  const imageUrl = project.imageUrl ? getIpfsUrl(project.imageUrl) : defaultProjectImage;

  return (
    <Card className="overflow-hidden hover-elevate" data-testid={`card-project-${project.id}`}>
      <div className="aspect-video relative overflow-hidden">
        <img
          src={imageUrl}
          alt={project.name}
          className="w-full h-full object-cover"
        />
        {!project.active && (
          <Badge className="absolute top-2 right-2" variant="destructive">
            Inactive
          </Badge>
        )}
      </div>
      
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-xl font-semibold truncate" data-testid={`text-project-name-${project.id}`}>
            {project.name}
          </h3>
          <Badge variant="secondary" data-testid={`badge-plots-${project.id}`}>
            {availablePlots}/{project.numPlots} Available
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        )}
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Grid3x3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Total Area:</span>
            <span className="font-medium">{project.totalArea.toLocaleString()} sq.ft</span>
          </div>
          <div className="flex items-center gap-2">
            <Grid3x3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Plot Size:</span>
            <span className="font-medium">{project.plotSize.toLocaleString()} sq.ft</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{project.location}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{project.contactNumber}</span>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <span className="text-2xl font-bold" data-testid={`text-price-${project.id}`}>
            {project.basePrice} ETH
          </span>
          <span className="text-sm text-muted-foreground">per plot</span>
        </div>
      </CardContent>

      <CardFooter>
        <Link href={`/project/${project.id}`}>
          <Button className="w-full" data-testid={`button-view-${project.id}`}>
            {showManageButton ? "Manage Project" : "View Plots"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
