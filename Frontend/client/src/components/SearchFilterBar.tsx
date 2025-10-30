import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

interface SearchFilterBarProps {
  onSearch: (query: string) => void;
  onFilterLocation: (location: string) => void;
  onFilterPrice: (range: string) => void;
  locations?: string[];
}

export default function SearchFilterBar({
  onSearch,
  onFilterLocation,
  onFilterPrice,
  locations = ["All Locations", "Austin, Texas", "Denver, Colorado", "Portland, Oregon"],
}: SearchFilterBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [filtersActive, setFiltersActive] = useState(false);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleLocationChange = (value: string) => {
    setSelectedLocation(value);
    onFilterLocation(value);
    setFiltersActive(value !== "All Locations" || selectedPrice !== "all");
  };

  const handlePriceChange = (value: string) => {
    setSelectedPrice(value);
    onFilterPrice(value);
    setFiltersActive(selectedLocation !== "All Locations" || value !== "all");
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedLocation("All Locations");
    setSelectedPrice("all");
    setFiltersActive(false);
    onSearch("");
    onFilterLocation("All Locations");
    onFilterPrice("all");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or location..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>

        <Select value={selectedLocation} onValueChange={handleLocationChange}>
          <SelectTrigger className="w-full sm:w-48" data-testid="select-location">
            <SelectValue placeholder="Filter by location" />
          </SelectTrigger>
          <SelectContent>
            {locations.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedPrice} onValueChange={handlePriceChange}>
          <SelectTrigger className="w-full sm:w-48" data-testid="select-price">
            <SelectValue placeholder="Filter by price" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Prices</SelectItem>
            <SelectItem value="0-2">0 - 2 ETH</SelectItem>
            <SelectItem value="2-5">2 - 5 ETH</SelectItem>
            <SelectItem value="5+">5+ ETH</SelectItem>
          </SelectContent>
        </Select>

        {filtersActive && (
          <Button
            variant="outline"
            onClick={clearFilters}
            data-testid="button-clear-filters"
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
