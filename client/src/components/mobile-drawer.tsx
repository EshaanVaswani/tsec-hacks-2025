 

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchFilters } from "./search-filters";
import { LocationList } from "./location-list";
import type { FilterState, Location } from "@/lib/types";

interface MobileDrawerProps {
  locations: Location[];
  selectedLocation?: Location;
  onLocationSelect: (location: Location) => void;
  onFilterChange: (filters: FilterState) => void;
  availableTags: string[];
  availableCategories: string[];
}

export function MobileDrawer({
  locations,
  selectedLocation,
  onLocationSelect,
  onFilterChange,
  availableTags,
  availableCategories,
}: MobileDrawerProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="md:hidden fixed left-0 top-1/2 -translate-y-1/2 z-50 h-12 w-8 rounded-r-lg rounded-l-none border-l-0 bg-background shadow-lg hover:translate-x-1 transition-transform"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[85%] p-0">
        <div className="flex flex-col h-full">
          <SearchFilters
            onFilterChange={onFilterChange}
            availableTags={availableTags}
            availableCategories={availableCategories}
          />
          <LocationList
            locations={locations}
            onLocationSelect={onLocationSelect}
            selectedLocation={selectedLocation}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}