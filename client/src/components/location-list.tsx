 

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import type { Location } from "@/lib/types";

interface LocationListProps {
  locations: Location[];
  onLocationSelect: (location: Location) => void;
  selectedLocation?: Location;
}

export function LocationList({
  locations,
  onLocationSelect,
  selectedLocation,
}: LocationListProps) {
  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="space-y-4 p-4">
        {locations.map((location) => (
          <div
            key={location.id}
            className={`p-4 rounded-lg cursor-pointer transition-colors ${
              selectedLocation?.id === location.id
                ? "bg-primary/5 border-primary"
                : "bg-card hover:bg-accent"
            } border`}
            onClick={() => onLocationSelect(location)}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{location.name}</h3>
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="text-sm">{location.rating}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {location.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {location.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {location.badges.map((badge) => (
                <Badge key={badge} variant="default" className="text-xs">
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}