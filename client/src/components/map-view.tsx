 

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { Location } from "@/lib/types";

interface MapViewProps {
  locations: Location[];
  selectedLocation?: Location;
  onLocationSelect: (location: Location) => void;
}

function MapController({
  selectedLocation,
}: {
  selectedLocation?: Location;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedLocation) {
      map.setView(
        [selectedLocation.coordinates.lat, selectedLocation.coordinates.lng],
        15
      );
    }
  }, [selectedLocation, map]);

  return null;
}

export function MapView({
  locations,
  selectedLocation,
  onLocationSelect,
}: MapViewProps) {
  // Use Mumbai coordinates as default center
  const defaultCenter = { lat: 18.9667, lng: 72.8333 };
  
  return (
    <div className="h-full w-full">
      <MapContainer
        key="map" // Add a key to ensure proper remounting
        center={[
          selectedLocation?.coordinates.lat || defaultCenter.lat,
          selectedLocation?.coordinates.lng || defaultCenter.lng
        ]}
        zoom={13}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController selectedLocation={selectedLocation} />
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.coordinates.lat, location.coordinates.lng]}
            eventHandlers={{
              click: () => onLocationSelect(location),
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{location.name}</h3>
                <p className="text-sm">{location.description}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default MapView;