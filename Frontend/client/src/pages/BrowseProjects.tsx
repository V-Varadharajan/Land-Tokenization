import { useState } from "react";
import LandProjectCard from "@/components/LandProjectCard";
import SearchFilterBar from "@/components/SearchFilterBar";
import { Grid3x3, Loader2 } from "lucide-react";
import { useAllLandProjects } from "@/hooks/useBlockchainData";

// Default placeholder image URL (can be replaced with your own)
const defaultProjectImage = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80";

export default function BrowseProjects() {
  const { projects: allProjects, loading } = useAllLandProjects();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("All Locations");
  const [priceFilter, setPriceFilter] = useState("all");

  const uniqueLocations = ["All Locations", ...Array.from(new Set(allProjects.map(p => p.location)))];

  const projects = allProjects.map((project) => ({
    ...project,
    imageUrl: project.imageUrl || defaultProjectImage,
  }));

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLocation =
      locationFilter === "All Locations" || project.location === locationFilter;

    const price = parseFloat(project.basePrice);
    let matchesPrice = true;
    if (priceFilter === "0-2") matchesPrice = price >= 0 && price <= 2;
    else if (priceFilter === "2-5") matchesPrice = price > 2 && price <= 5;
    else if (priceFilter === "5+") matchesPrice = price > 5;

    return matchesSearch && matchesLocation && matchesPrice;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Browse Land Projects</h1>
          <p className="text-muted-foreground">
            Discover and invest in tokenized land plots
          </p>
        </div>

        <SearchFilterBar
          onSearch={setSearchQuery}
          onFilterLocation={setLocationFilter}
          onFilterPrice={setPriceFilter}
          locations={uniqueLocations}
        />

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredProjects.length} of {projects.length} projects
            </p>

            {filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <Grid3x3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No projects found</h3>
                <p className="text-muted-foreground">
                  {projects.length === 0
                    ? "No land projects available yet. Check back later!"
                    : "Try adjusting your filters to see more results"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <LandProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
