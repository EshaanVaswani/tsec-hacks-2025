import { Star, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Location } from "@/lib/types";

interface LocationDetailsProps {
  location: Location;
}

export function LocationDetails({ location }: LocationDetailsProps) {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-4">{location.name}</h1>
      
      <div className="flex items-center gap-2 mb-4">
        <Star className="h-5 w-5 text-yellow-500" />
        <span className="font-semibold">{location.rating}</span>
        <Badge>{location.status}</Badge>
      </div>

      <div className="flex items-start gap-2 mb-4">
        <MapPin className="h-5 w-5 mt-1" />
        <p>
          {location.coordinates.lat.toFixed(6)}, {location.coordinates.lng.toFixed(6)}
        </p>
      </div>

      <p className="text-lg mb-6">{location.description}</p>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Categories</h2>
          <div className="flex gap-2">
            <Badge variant="secondary">{location.category}</Badge>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {location.tags.map(tag => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Badges</h2>
          <div className="flex flex-wrap gap-2">
            {location.badges.map(badge => (
              <Badge key={badge} variant="default">{badge}</Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}