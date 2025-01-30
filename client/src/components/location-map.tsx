 

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { Location } from "@/lib/types";

interface LocationMapProps {
  location: Location;
}

export function LocationMap({ location }: LocationMapProps) {
  return (
    <MapContainer
      center={[location.coordinates.lat, location.coordinates.lng]}
      zoom={15}
      className="h-full w-full"
      key={location.id}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[location.coordinates.lat, location.coordinates.lng]}>
        <Popup>
          <div className="p-2">
            <h3 className="font-semibold">{location.name}</h3>
            <p className="text-sm">{location.description}</p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}