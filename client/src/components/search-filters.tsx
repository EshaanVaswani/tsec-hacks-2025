 

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import type { FilterState } from "@/lib/types";

interface SearchFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  availableTags: string[];
  availableCategories: string[];
}

export function SearchFilters({
  onFilterChange,
  availableTags,
  availableCategories,
}: SearchFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    tags: [],
    category: null,
    distance: 10,
    sortBy: "distance",
  });

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg shadow-sm">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search locations..."
            className="pl-9"
            value={filters.search}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
            // Remove default browser attributes
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
        </div>
        <Select
          value={filters.sortBy}
          onValueChange={(value) =>
            handleFilterChange({ sortBy: value as FilterState["sortBy"] })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="distance">Distance</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => (
          <Badge
            key={tag}
            variant={filters.tags.includes(tag) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() =>
              handleFilterChange({
                tags: filters.tags.includes(tag)
                  ? filters.tags.filter((t) => t !== tag)
                  : [...filters.tags, tag],
              })
            }
          >
            {tag}
          </Badge>
        ))}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Distance (km)</label>
        <Slider
          value={[filters.distance]}
          onValueChange={([value]) => handleFilterChange({ distance: value })}
          max={50}
          step={1}
        />
        <div className="text-sm text-muted-foreground">
          Within {filters.distance}km
        </div>
      </div>
    </div>
  );
}