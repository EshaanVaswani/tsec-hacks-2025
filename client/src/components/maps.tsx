import { useState, lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import { SearchFilters } from "@/components/search-filters";
import { LocationList } from "@/components/location-list";
import { MobileDrawer } from "@/components/mobile-drawer";
import { SAMPLE_LOCATIONS, AVAILABLE_TAGS, AVAILABLE_CATEGORIES } from "@/lib/data";
import type { FilterState, Location } from "@/lib/types";

const MapView = lazy(() => import("@/components/map-view"));

export default function Maps() {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState<Location>();
  const [filteredLocations, setFilteredLocations] = useState(SAMPLE_LOCATIONS);

  const handleFilterChange = (filters: FilterState) => {
    let filtered = SAMPLE_LOCATIONS;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        location =>
          location.name.toLowerCase().includes(searchLower) ||
          location.description.toLowerCase().includes(searchLower)
      );
    }

    if (filters.tags.length > 0) {
      filtered = filtered.filter(location =>
        filters.tags.some(tag => location.tags.includes(tag))
      );
    }

    if (filters.category) {
      filtered = filtered.filter(location => location.category === filters.category);
    }

    filtered = [...filtered].sort((a, b) => {
      switch (filters.sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "name":
          return a.name.localeCompare(b.name);
        case "distance":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredLocations(filtered);
  };

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    navigate(`/location/${location.id}`);
  };

  return (
    <main className="flex h-screen">
      {/* Mobile Drawer */}
      <MobileDrawer
        locations={filteredLocations}
        selectedLocation={selectedLocation}
        onLocationSelect={handleLocationSelect}
        onFilterChange={handleFilterChange}
        availableTags={AVAILABLE_TAGS}
        availableCategories={AVAILABLE_CATEGORIES}
      />

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-1/3 lg:w-2/5 h-full flex-col border-r">
        <SearchFilters
          onFilterChange={handleFilterChange}
          availableTags={AVAILABLE_TAGS}
          availableCategories={AVAILABLE_CATEGORIES}
        />
        <LocationList
          locations={filteredLocations}
          onLocationSelect={handleLocationSelect}
          selectedLocation={selectedLocation}
        />
      </div>

      {/* Map */}
      <div className="flex-1 h-full">
        <Suspense fallback={<div>Loading Map...</div>}>
          <MapView
            locations={filteredLocations}
            selectedLocation={selectedLocation}
            onLocationSelect={handleLocationSelect}
          />
        </Suspense>
      </div>
    </main>
  );
}
